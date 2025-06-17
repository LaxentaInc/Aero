import { NextResponse } from 'next/server';

const API_KEY = process.env.ELECTRON_API_KEY;
const API_URL = 'https://api.electronhub.ai/v1/chat/completions';

export async function POST(req: Request) {
  console.log("[⚡️ HIT] /api/ai POST");

  try {
    const { messages } = await req.json();
    console.log("[📩 Messages]", messages);

    if (!API_KEY) {
      console.error("[❌ ERROR] Missing API KEY");
      return NextResponse.json({ error: "Missing API KEY" }, { status: 500 });
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'anubis-pro-105b-v1',
        messages,
        temperature: 0.9,
        presence_penalty: 0.6,
        frequency_penalty: 0.7,
        limit: 10
      })
    });

    const data = await response.json();
    console.log("[✅ RESPONSE]", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('[❌ CATCH ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// TEMP GET for testing endpoint
export async function GET() {
  console.log("[⚡️ HIT] /api/ai GET");
  return NextResponse.json({ alive: true, timestamp: Date.now() });
}
