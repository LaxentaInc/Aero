// /app/api/img/route.ts

import { NextRequest, NextResponse } from 'next/server';

// Types for the API request and response
interface ImageGenerationRequest {
  prompt: string;
  model: string;
  style?: 'vivid' | 'natural'; // Updated to match API spec
  n?: number;
  quality?: 'standard' | 'hd';
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  response_format?: 'url' | 'b64_json';
  public?: boolean;
}

interface ElectronHubResponse {
  created: number;
  data: Array<{
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body: ImageGenerationRequest = await request.json();
    
    // Validate required fields
    if (!body.prompt || !body.model) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt and model' },
        { status: 400 }
      );
    }

    // Get API key from environment variables
    const apiKey = process.env.ELECTRON_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Prepare the request payload for ElectronHub API
    const payload: any = {
      model: body.model,
      prompt: body.prompt,
      n: body.n || 1,
      size: body.size || '1024x1024',
      response_format: body.response_format || 'url',
      public: body.public || false
    };

    // Only include quality parameter for DALL-E models
    if (body.model.toLowerCase().includes('dall-e') && body.quality) {
      payload.quality = body.quality;
    } else if (body.model.toLowerCase().includes('dall-e')) {
      payload.quality = 'standard'; // Default for DALL-E
    }

    // Only include style if provided and supported by the model
    if (body.style && body.model.toLowerCase().includes('dall-e')) {
      payload.style = body.style;
    }

    console.log('Making request to ElectronHub API with payload:', payload);

    // Make the API call to ElectronHub
    const response = await fetch('https://api.electronhub.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('ElectronHub API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElectronHub API error:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      
      return NextResponse.json(
        { 
          error: 'Image generation failed', 
          details: errorData.error || response.statusText,
          status: response.status
        },
        { status: response.status }
      );
    }

    // Parse the successful response
    const data: ElectronHubResponse = await response.json();
    console.log('ElectronHub API success response:', data);
    
    // Validate response structure
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      return NextResponse.json(
        { error: 'Invalid response from image generation service' },
        { status: 500 }
      );
    }

    const imageData = data.data[0];
    const imageUrl = imageData.url || (imageData.b64_json ? `data:image/png;base64,${imageData.b64_json}` : null);

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No image data received from service' },
        { status: 500 }
      );
    }
    
    // Return the image data with additional metadata
    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      revisedPrompt: imageData.revised_prompt,
      originalPrompt: body.prompt,
      model: body.model,
      style: body.style,
      created: data.created,
      generationTime: Date.now() - (data.created * 1000), // Approximate generation time
    });

  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to generate images.' },
    { status: 405 }
  );
}