// /app/api/ai/route.ts
import { NextRequest } from 'next/server';

// Use Edge Runtime for no timeout on Vercel
export const runtime = 'edge';
export const maxDuration = 300; // 5 minutes

const API_KEY = process.env.ELECTRON_API_KEY;
const API_URL = 'https://api.electronhub.ai/v1/chat/completions';
const MODELS_URL = 'https://api.electronhub.ai/models';

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

// Model info cache
interface ModelInfo {
  tokens: number;
  name: string;
  id: string;
}

const modelCache = new Map<string, { data: ModelInfo; timestamp: number }>();
const MODEL_CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Clean up old buffers, rate limit map, and model cache
setInterval(() => {
  const now = Date.now();
  
  // Clean stream buffers
  for (const [id, buffer] of streamBuffers.entries()) {
    if (now - buffer.lastActivity > 5 * 60 * 1000) {
      streamBuffers.delete(id);
    }
  }
  
  // Clean rate limit map
  for (const [ip, record] of ipMap.entries()) {
    if (now - record.timestamp > WINDOW_MS * 2) {
      ipMap.delete(ip);
    }
  }
  
  // Clean model cache
  for (const [modelId, cache] of modelCache.entries()) {
    if (now - cache.timestamp > MODEL_CACHE_TTL) {
      modelCache.delete(modelId);
    }
  }
}, 60 * 1000);

// Fetch model info from ElectronHub API
async function getModelInfo(modelId: string): Promise<ModelInfo | null> {
  try {
    // Check cache first
    const cached = modelCache.get(modelId);
    if (cached && Date.now() - cached.timestamp < MODEL_CACHE_TTL) {
      console.log(`[📦 Cache hit] Model info for ${modelId}`);
      return cached.data;
    }

    console.log(`[🌐 Fetching] Model info for ${modelId}`);
    const response = await fetch(MODELS_URL, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    if (!response.ok) {
      console.error('[❌ Models API Error]', response.status);
      return null;
    }

    const data = await response.json();
    const models = data.data || [];
    
    const modelInfo = models.find((m: any) => m.id === modelId);
    if (!modelInfo) {
      console.warn(`[⚠️ Model not found] ${modelId}`);
      return null;
    }

    const info: ModelInfo = {
      tokens: modelInfo.tokens || 1000, // Default to 4000 if not specified000000000000000000000000000000000000!!!
      name: modelInfo.name,
      id: modelInfo.id,
    };

    // Cache the result
    modelCache.set(modelId, { data: info, timestamp: Date.now() });
    console.log(`[✅ Model info] ${modelId}: ${info.tokens} tokens`);
    
    return info;
  } catch (error) {
    console.error('[❌ Error fetching model info]', error);
    return null;
  }
}

// Simple token estimation (roughly 4 chars per token)
function estimateTokens(text: string): number {
  // More accurate estimation based on common patterns
  // Average is ~4 chars per token for English text
  // But we'll be conservative and use 3.5 to avoid cutting too much
  return Math.ceil(text.length / 3.5);
}

// Truncate messages to fit within token limit
function truncateMessages(messages: any[], maxTokens: number): any[] {
  if (!messages || messages.length === 0) return messages;

  // Reserve some tokens for the response and system overhead
  const availableTokens = Math.floor(maxTokens * 0.85); // Use 85% of limit for safety
  
  let totalTokens = 0;
  const truncatedMessages = [];
  
  // Always keep the most recent messages, work backwards
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    const content = message.content || '';
    const messageTokens = estimateTokens(JSON.stringify(message));
    
    if (totalTokens + messageTokens <= availableTokens) {
      truncatedMessages.unshift(message);
      totalTokens += messageTokens;
    } else if (i === messages.length - 1) {
      // Always keep at least the last message, but truncate it if needed
      const remainingTokens = availableTokens - totalTokens;
      const charLimit = Math.floor(remainingTokens * 3.5);
      
      if (charLimit > 100) { // Keep at least 100 chars
        truncatedMessages.unshift({
          ...message,
          content: content.substring(content.length - charLimit),
        });
      } else {
        truncatedMessages.unshift(message);
      }
      break;
    } else {
      // Stop adding older messages
      break;
    }
  }
  
  console.log(`[✂️ Truncated] ${messages.length} → ${truncatedMessages.length} messages (${totalTokens} tokens)`);
  return truncatedMessages;
}

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

// Simple fetch with retry - no individual timeouts
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  maxRetries: number = 3
): Promise<Response> {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.ok) return response;
      
      // Don't retry client errors
      if (response.status >= 400 && response.status < 500) {
        return response;
      }

      // Server error, retry with backoff
      const delay = Math.min(Math.pow(2, i) * 1000, 10000);
      console.log(`[🔄 Retry ${i+1}/${maxRetries}] Status ${response.status}, waiting ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
    } catch (error: any) {
      lastError = error;
      console.error(`[❌ Fetch error] Attempt ${i+1}:`, error.message);
      
      if (i < maxRetries - 1) {
        const delay = Math.min(Math.pow(2, i) * 1000, 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Max retries reached');
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const streamId = `${ip}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  console.log(`[⚡️ HIT] /api/ai POST from IP: ${ip}, Stream ID: ${streamId}`);

  if (!checkRateLimit(ip)) {
    console.warn(`[🚫 RATE LIMITED] IP ${ip}`);
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Request size limit
  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 100000) {
    return new Response(JSON.stringify({ error: 'Request too large' }), {
      status: 413,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { messages, stream = false, model = 'gpt-4o' } = await req.json();
    console.log('[📩 Messages]', messages.length, 'messages');
    console.log('[🌊 Stream]', stream);
    console.log('[🤖 Model]', model);

    if (!API_KEY) {
      console.error('[❌ ERROR] Missing API KEY');
      return new Response(JSON.stringify({ error: 'Service unavailable' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get model info and token limit
    const modelInfo = await getModelInfo(model);
    const tokenLimit = modelInfo?.tokens || 1000; // Default to 4000 if fetch fails !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    console.log(`[🎯 Token Limit] ${tokenLimit} tokens for model ${model}`);

    // Truncate messages based on token limit
    const truncatedMessages = truncateMessages(messages, tokenLimit);

    // ONE SIMPLE 5 MINUTE TIMEOUT - THAT'S IT
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('[⏰ 5 minute timeout reached]');
      controller.abort();
    }, 5 * 60 * 1000); // 5 minutes

    // Handle client disconnect
    req.signal.addEventListener('abort', () => {
      console.log(`[🔌 Client disconnected] Stream ${streamId}`);
      clearTimeout(timeoutId);
      controller.abort();
      streamBuffers.delete(streamId);
    });

    const body = JSON.stringify({
      model,
      messages: truncatedMessages, // Use truncated messages
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
      signal: controller.signal,
    });

    console.log('[📡 API Response Status]', response.status);

    if (!stream) {
      clearTimeout(timeoutId);
      const data = await response.json();
      console.log('[✅ RESPONSE]', data);
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!response.ok) {
      clearTimeout(timeoutId);
      const errorText = await response.text();
      console.error('[❌ API Error]', errorText);
      return new Response(JSON.stringify({ 
        error: response.status >= 500 ? 'Service error' : 'Request failed' 
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize stream buffer
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
      start(controller) {
        // Send initial connection confirmation
        controller.enqueue(encoder.encode(': connected\n\n'));
        controller.enqueue(encoder.encode(`data: {"type":"connected","streamId":"${streamId}"}\n\n`));
      },

      async transform(chunk, controller) {
        const streamBuffer = streamBuffers.get(streamId);
        if (!streamBuffer) {
          controller.terminate();
          return;
        }

        streamBuffer.lastActivity = Date.now();
        chunkCount++;

        try {
          const text = decoder.decode(chunk, { stream: true });
          console.log(`[🔄 Chunk ${chunkCount}] Size: ${text.length}`);

          buffer += text;
          
          // Buffer overflow protection
          if (buffer.length > 3000000 ) { // 3mb limit goes hard
            console.error('[⚠️ Buffer overflow]');
            buffer = '';
            const errorData = {
              error: true,
              message: 'Buffer overflow',
              _streamId: streamId
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            streamBuffers.delete(streamId);
            clearTimeout(timeoutId);
            controller.terminate();
            return;
          }
          
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() === '') continue;

            // Send heartbeat every 5 seconds
            const now = Date.now();
            if (now - lastHeartbeat > 5000) {
              controller.enqueue(encoder.encode(': keepalive\n\n'));
              lastHeartbeat = now;
            }

            if (line.startsWith('data: ')) {
              const data = line.slice(6);

              if (data === '[DONE]') {
                console.log('[✅ Stream Complete] Total content length:', totalContent.length);
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                streamBuffers.delete(streamId);
                clearTimeout(timeoutId);
                controller.terminate();
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;

                if (content) {
                  totalContent += content;
                  streamBuffer.chunks.push(data);
                }

                // Keep enriched data feature
                const enrichedData = {
                  ...parsed,
                  _seq: chunkCount,
                  _streamId: streamId
                };

                controller.enqueue(encoder.encode(`data: ${JSON.stringify(enrichedData)}\n\n`));
              } catch (e) {
                console.error('[⚠️ Invalid JSON]', e);
                // Don't terminate on parse error, just skip
              }
            }
          }
        } catch (error) {
          console.error('[❌ Transform error]', error);
          
          // Send error to client
          const errorData = {
            error: true,
            message: 'Stream interrupted',
            _streamId: streamId
          };
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          
          streamBuffers.delete(streamId);
          clearTimeout(timeoutId);
          controller.terminate();
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
        clearTimeout(timeoutId);
      },
    });

    const readableStream = response.body?.pipeThrough(transformStream);

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform, no-store',
        'Connection': 'keep-alive',
        'X-Stream-ID': streamId,
        'X-Accel-Buffering': 'no',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error: any) {
    console.error('[❌ CATCH ERROR]', error);
    
    // Don't expose internal errors
    const message = error.name === 'AbortError' 
      ? 'Request timeout' 
      : error.message.includes('fetch')
      ? 'Network error'
      : 'Failed to process request';
      
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Keep your GET endpoint for chunk retrieval
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