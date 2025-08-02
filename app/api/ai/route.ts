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
      tokens: modelInfo.tokens || 128000, // Better default for modern models
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

// Better token estimation
function estimateTokens(text: string): number {
  // GPT tokenization rough estimates:
  // - English: ~1 token per 4 characters
  // - Code/special chars: ~1 token per 2-3 characters
  // We'll use 4 chars per token as a reasonable estimate
  return Math.ceil(text.length / 4);
}

// NEW: Proper bottom-to-top truncation
function truncateMessages(messages: any[], maxTokens: number): any[] {
  if (!messages || messages.length === 0) return messages;

  // Use 80% of limit to leave room for response
  const targetTokens = Math.floor(maxTokens * 0.8);
  
  console.log(`\n[🎯 Truncation] Model limit: ${maxTokens}, Using: ${targetTokens} tokens`);
  
  // Track what we're including
  let includedTokens = 0;
  const result: any[] = [];
  
  // Start from the newest message and work backwards
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    const messageContent = message.content || '';
    const messageTokens = estimateTokens(messageContent);
    
    console.log(`[📝 Message ${i}] ${message.role}: ${messageContent.length} chars (~${messageTokens} tokens)`);
    
    // Can we fit the entire message?
    if (includedTokens + messageTokens <= targetTokens) {
      // Yes! Include the whole message
      result.unshift(message);
      includedTokens += messageTokens;
      console.log(`  ✅ Full message included. Total: ${includedTokens}/${targetTokens} tokens`);
    } else {
      // Can't fit the whole message - truncate it
      const remainingTokens = targetTokens - includedTokens;
      
      if (remainingTokens < 20) {
        // Not enough space for meaningful truncation
        console.log(`  ❌ Only ${remainingTokens} tokens left - skipping`);
        break;
      }
      
      // Calculate how many characters we can include
      const charsToInclude = remainingTokens * 4; // Reverse of our estimation
      
      // Keep the END of the message (most recent part)
      const truncatedContent = '... ' + messageContent.slice(-charsToInclude);
      
      console.log(`  ✂️ Truncating: keeping last ${charsToInclude} of ${messageContent.length} chars`);
      
      result.unshift({
        ...message,
        content: truncatedContent
      });
      
      includedTokens = targetTokens; // We're at the limit now
      break;
    }
  }
  
  // Log summary
  console.log(`[📊 Summary] Input: ${messages.length} messages, Output: ${result.length} messages`);
  console.log(`[📊 Tokens] Used ~${includedTokens} of ${targetTokens} available\n`);
  
  return result;
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

// Simple fetch with retry
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
  if (contentLength && parseInt(contentLength) > 1200000) {
    return new Response(JSON.stringify({ error: 'Request too large' }), {
      status: 413,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { messages, stream = false, model = 'gpt-4o' } = await req.json();
    console.log('[📩 Request] Model:', model, '| Messages:', messages.length, '| Stream:', stream);

    if (!API_KEY) {
      console.error('[❌ ERROR] Missing API KEY');
      return new Response(JSON.stringify({ error: 'Service unavailable' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get model info and token limit
    const modelInfo = await getModelInfo(model);
    const tokenLimit = modelInfo?.tokens || 128000; // Better default
    
    // Log for browser console
    const debugInfo = {
      model: model,
      tokenLimit: tokenLimit,
      originalMessages: messages.length,
      originalChars: messages.reduce((sum: number, msg: any) => sum + (msg.content?.length || 0), 0),
      originalTokensEstimate: messages.reduce((sum: number, msg: any) => sum + estimateTokens(msg.content || ''), 0)
    };

    console.log(`[🤖 Model: ${model}] Token limit: ${tokenLimit}`);

    // Truncate messages from newest to oldest
    const truncatedMessages = truncateMessages(messages, tokenLimit);
    
    // Add truncation info to debug
    debugInfo.truncatedMessages = truncatedMessages.length;
    debugInfo.truncatedChars = truncatedMessages.reduce((sum: number, msg: any) => sum + (msg.content?.length || 0), 0);
    debugInfo.truncatedTokensEstimate = truncatedMessages.reduce((sum: number, msg: any) => sum + estimateTokens(msg.content || ''), 0);

    console.log(`[📤 Sending] ${truncatedMessages.length} messages (~${debugInfo.truncatedTokensEstimate} tokens)`);

    // 5 minute timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('[⏰ 5 minute timeout reached]');
      controller.abort();
    }, 5 * 60 * 1000);

    // Handle client disconnect
    req.signal.addEventListener('abort', () => {
      console.log(`[🔌 Client disconnected] Stream ${streamId}`);
      clearTimeout(timeoutId);
      controller.abort();
      streamBuffers.delete(streamId);
    });

    const body = JSON.stringify({
      model,
      messages: truncatedMessages,
      temperature: 0.9,
      presence_penalty: 0.6,
      frequency_penalty: 0.7,
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
      
      // Add debug info for browser
      if (data.choices) {
        data._debug = debugInfo;
      }
      
      console.log('[✅ RESPONSE] Completion received');
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!response.ok) {
      clearTimeout(timeoutId);
      const errorText = await response.text();
      console.error('[❌ API Error]', errorText);
      return new Response(JSON.stringify({ 
        error: response.status >= 500 ? 'Service error' : 'Request failed',
        _debug: debugInfo
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
        // Send initial connection with debug info
        // controller.enqueue(encoder.encode(': connected\n\n'));
        // type":"connected","streamId":"${streamId}","_debug":${JSON.stringify(debugInfo)}}\n\n`));
controller.enqueue(encoder.encode(': connected\n\n'));
controller.enqueue(encoder.encode(`data: {"type":"connected","streamId":"${streamId}","_debug":${JSON.stringify(debugInfo)}}\n\n`));
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
          if (buffer.length > 3000000) {
            console.error('[⚠️ Buffer overflow]');
            buffer = '';
            const errorData = {
              error: true,
              message: 'Buffer overflow',
              _streamId: streamIdJSON.stringify(errorData)}\n\n`));
            controllern'));
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
                controller.enqueue(encoder.encode('delete(streamId);
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

                // Keep enriched data
                const enrichedData = {
                  ...parsed,
                  _seq: chunkCount,
                  _streamId: streamIdJSON.stringify(enrichedData)}\n\n`));
              } catch (e) {
                console.error('[⚠️ Invalid JSON]', e);
              }
            }
          }
        } catch (error) {
          console.error('[❌ Transform error]', error);
          
          const errorData = {
            error: true,
            message: 'Stream interrupted',
            _streamId: streamId
          };
          
          controller.enqueue(encoder.(errorData)}\n\nDONE]\n\n'));
          
          streamBuffers.delete(streamId);
          clearTimeout(timeoutId);
          controller.terminate();
        }
      },

      flush(controller) {
        console.log('[🏁 Flush called] Buffer:', buffer);
        if (buffer.trim() && buffer.start data = buffer.slice(6);
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

// GET endpoint for chunk retrieval
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
