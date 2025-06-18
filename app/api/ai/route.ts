import { NextRequest } from 'next/server';

const API_KEY = process.env.ELECTRON_API_KEY;
const API_URL = 'https://api.electronhub.ai/v1/chat/completions';

// Rate limit store (in-memory)
const RATE_LIMIT = 5; // max requests
const WINDOW_MS = 60 * 1000; // time window in ms
const ipMap = new Map<string, { count: number; timestamp: number }>();

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

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  console.log(`[⚡️ HIT] /api/ai POST from IP: ${ip}`);

  if (!checkRateLimit(ip)) {
    console.warn(`[🚫 RATE LIMITED] IP ${ip}`);
    return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { messages, stream = false } = await req.json();
    console.log("[📩 Messages]", messages);
    console.log("[🌊 Stream]", stream);

    if (!API_KEY) {
      console.error("[❌ ERROR] Missing API KEY");
      return new Response(JSON.stringify({ error: "Missing API KEY" }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = JSON.stringify({
      model: 'o3-mini-online',
      messages,
      temperature: 0.9,
      presence_penalty: 0.6,
      frequency_penalty: 0.7,
      limit: 10,
      stream,
    });

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body,
    });

    if (!stream) {
      const data = await response.json();
      console.log("[✅ RESPONSE]", data);
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const text = decoder.decode(chunk, { stream: true });
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              return;
            }
            try {
              JSON.parse(data);
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            } catch (e) {
              console.error('[⚠️ Invalid JSON]', e);
            }
          }
        }
      },
    });

    return new Response(response.body?.pipeThrough(transformStream), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('[❌ CATCH ERROR]', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET() {
  console.log("[⚡️ HIT] /api/ai GET");
  return new Response(JSON.stringify({ alive: true, timestamp: Date.now() }), {
    headers: { 'Content-Type': 'application/json' },
  });
}