// /app/api/ai/route.ts
import { NextRequest } from 'next/server';

const API_KEY = process.env.ELECTRON_API_KEY;
const API_URL = 'https://api.electronhub.ai/v1/chat/completions';

// Rate limiting setup
const RATE_LIMIT = 5;
const WINDOW_MS = 60 * 1000;
const ipMap = new Map<string, { count: number; timestamp: number }>();

// Stream buffer management
const streamBuffers = new Map<string, { 
  chunks: string[], 
  lastActivity: number,
  retryCount: number 
}>();

// Clean up old buffers every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, buffer] of streamBuffers.entries()) {
    if (now - buffer.lastActivity > 5 * 60 * 1000) {
      streamBuffers.delete(id);
    }
  }
}, 5 * 60 * 1000);

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipMap.get(ip);

  if (!record) {
    ipMap.set(ip, { count: 1, timestamp: now });
    return true;
  }

  const elapsed = now - record.timestamp;
  if (elapsed > WINDOW_MS) {
    ipMap.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (record.count >= RATE_LIMIT) return false;
  record.count++;
  return true;
}

// Retry with exponential backoff
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  maxRetries: number = 3
): Promise<Response> {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(30000),
      });

      if (response.ok || i === maxRetries - 1) {
        return response;
      }

      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }

  throw lastError || new Error('Max retries reached');
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const streamId = `${ip}-${Date.now()}`;
  console.log(`[⚡️ HIT] /api/ai POST from IP: ${ip}, Stream ID: ${streamId}`);

  if (!checkRateLimit(ip)) {
    console.warn(`[🚫 RATE LIMITED] IP ${ip}`);
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { messages, stream = false, model = 'gpt-4o' } = await req.json();
    console.log('[📩 Messages]', messages);
    console.log('[🌊 Stream]', stream);
    console.log('[🤖 Model]', model);

    if (!API_KEY) {
      console.error('[❌ ERROR] Missing API KEY');
      return new Response(JSON.stringify({ error: 'Missing API KEY' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = JSON.stringify({
      model,
      messages,
      temperature: 0.9,
      presence_penalty: 0.6,
      frequency_penalty: 0.7,
      limit: 10,
      stream,
    });

    const response = await fetchWithRetry(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body,
    });

    console.log('[📡 API Response Status]', response.status);

    if (!stream) {
      const data = await response.json();
      console.log('[✅ RESPONSE]', data);
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[❌ API Error]', errorText);
      throw new Error(`API responded with status ${response.status}: ${errorText}`);
    }

    streamBuffers.set(streamId, { 
      chunks: [], 
      lastActivity: Date.now(),
      retryCount: 0 
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let buffer = '';
    let chunkCount = 0;
    let totalContent = '';
    let lastHeartbeat = Date.now();

    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const streamBuffer = streamBuffers.get(streamId);
        if (!streamBuffer) return;

        streamBuffer.lastActivity = Date.now();
        chunkCount++;

        try {
          const text = decoder.decode(chunk, { stream: true });
          console.log(`[🔄 Chunk ${chunkCount}] Size: ${text.length}`);

          buffer += text;
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() === '') continue;

            const now = Date.now();
            if (now - lastHeartbeat > 10000) {
              controller.enqueue(encoder.encode(': heartbeat\n\n'));
              lastHeartbeat = now;
            }

            if (line.startsWith('data: ')) {
              const data = line.slice(6);

              if (data === '[DONE]') {
                console.log('[✅ Stream Complete] Total content length:', totalContent.length);
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                streamBuffers.delete(streamId);
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;

                if (content) {
                  totalContent += content;
                  streamBuffer.chunks.push(data);
                }

                const enrichedData = {
                  ...parsed,
                  _seq: chunkCount,
                  _streamId: streamId
                };

                controller.enqueue(encoder.encode(`data: ${JSON.stringify(enrichedData)}\n\n`));
              } catch (e) {
                console.error('[⚠️ Invalid JSON]', e);
                streamBuffer.chunks.push(`ERROR: ${data}`);
              }
            }
          }
        } catch (error) {
          console.error('[❌ Transform error]', error);
          streamBuffer.retryCount++;

          if (streamBuffer.retryCount > 5) {
            controller.enqueue(encoder.encode('data: {"error": "Stream failed after multiple retries"}\n\n'));
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            streamBuffers.delete(streamId);
          }
        }
      },

      flush(controller) {
        console.log('[🏁 Flush called] Buffer:', buffer);
        if (buffer.trim() && buffer.startsWith('data: ')) {
          const data = buffer.slice(6);
          if (data !== '[DONE]') {
            try {
              JSON.parse(data);
              controller.enqueue(encoder.encode(`${buffer}\n\n`));
            } catch (e) {
              console.error('[⚠️ Invalid JSON in flush]', e);
            }
          }
        }
        streamBuffers.delete(streamId);
      },
    });

    const readableStream = response.body?.pipeThrough(transformStream);

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Stream-ID': streamId,
        'X-Accel-Buffering': 'no',
      },
    });

  } catch (error) {
    console.error('[❌ CATCH ERROR]', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET(req: NextRequest) {
  const streamId = req.nextUrl.searchParams.get('streamId');
  const fromChunk = parseInt(req.nextUrl.searchParams.get('fromChunk') || '0');

  if (!streamId) {
    return new Response(JSON.stringify({ alive: true, timestamp: Date.now() }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const streamBuffer = streamBuffers.get(streamId);
  if (!streamBuffer) {
    return new Response(JSON.stringify({ error: 'Stream not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const chunks = streamBuffer.chunks.slice(fromChunk);
  return new Response(JSON.stringify({ chunks, totalChunks: streamBuffer.chunks.length }), {
    headers: { 'Content-Type': 'application/json' },
  });
}