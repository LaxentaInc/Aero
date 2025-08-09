// /app/api/img/route.ts

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Types for the API request and response
interface ImageGenerationRequest {
  prompt: string;
  model: string;
  style?: 'vivid' | 'natural';
  n?: number;
  quality?: 'standard' | 'hd';
  size?: string; // Made flexible to support different model sizes
  response_format?: 'url' | 'b64_json';
  public?: boolean;
}

interface ImageData {
  url?: string;
  b64_json?: string;
  revised_prompt?: string;
}

interface ElectronHubResponse {
  created: number;
  data: ImageData[];
}

interface ModelInfo {
  name: string;
  description: string;
  id: string;
  object: string;
  created: number;
  owned_by: string;
  tokens?: number;
  pricing?: {
    type: string;
    coefficient: number;
  };
  endpoints: string[];
  premium_model?: boolean;
  sizes?: string[];
}

// Cache for models with expiry
let modelsCache: {
  data: ModelInfo[] | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0
};

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const USAGE_FILE = path.join(process.cwd(), 'app/api/img/usage.json');

// Function to fetch models from ElectronHub API
async function fetchImageModels(): Promise<ModelInfo[]> {
  const now = Date.now();
  
  // Check if cache is valid
  if (modelsCache.data && (now - modelsCache.timestamp) < CACHE_DURATION) {
    console.log('🎯 Using cached models (still fresh)');
    return modelsCache.data;
  }

  console.log('🔄 Fetching fresh models from ElectronHub API...');
  
  const apiKey = process.env.ELECTRON_API_KEY;
  if (!apiKey) {
    console.error('❌ API key not configured');
    throw new Error('API key not configured');
  }

  try {
    const response = await fetch('https://api.electronhub.ai/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to fetch models:', errorText);
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    const responseData = await response.json();
    
    // Validate response structure
    if (!responseData || responseData.object !== 'list' || !Array.isArray(responseData.data)) {
      console.error('❌ Unexpected API response structure:', responseData);
      throw new Error('Invalid API response: expected object with data array');
    }
    
    const allModels = responseData.data;
    console.log(`📦 Total models fetched: ${allModels.length}`);
    
    // Log sample model for debugging
    if (allModels.length > 0) {
      console.log('🔍 Sample model structure:', JSON.stringify(allModels[0], null, 2));
    }
    
    // Filter models that support image generation
    const imageModels = allModels.filter((model: ModelInfo) => 
      model.endpoints && model.endpoints.includes('/v1/images/generations')
    );
    
    console.log(`🖼️ Image generation models found: ${imageModels.length}`);
    
    // Log each model's details
    imageModels.forEach((model: ModelInfo, index: number) => {
      console.log(`
📌 Model ${index + 1}:
  - ID: ${model.id}
  - Name: ${model.name}
  - Owner: ${model.owned_by}
  - Premium: ${model.premium_model ? 'Yes' : 'No'}
  - Sizes: ${model.sizes ? model.sizes.join(', ') : 'Standard'}
  - Price: ${model.pricing ? `$${model.pricing.coefficient} per image` : 'Free'}
      `);
    });

    // Update cache
    modelsCache = {
      data: imageModels,
      timestamp: now
    };
    
    console.log('✅ Models cache updated successfully');
    return imageModels;
    
  } catch (error) {
    console.error('❌ Error fetching models:', error);
    // Return cached data if available, even if expired
    if (modelsCache.data) {
      console.log('⚠️ Using expired cache due to fetch error');
      return modelsCache.data;
    }
    throw error;
  }
}

async function getUsageData() {
  try {
    const data = await fs.readFile(USAGE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function trackUsage(modelId: string) {
  try {
    const usage = await getUsageData();
    if (!usage[modelId]) {
      usage[modelId] = Math.floor(Math.random() * 500) + 1000;
    }
    usage[modelId]++;
    await fs.writeFile(USAGE_FILE, JSON.stringify(usage, null, 2));
  } catch (error) {
    console.log('Could not track usage:', error);
  }
}

// GET endpoint to fetch available models
export async function GET(request: NextRequest) {
  try {
    console.log('📥 GET request received for models');
    
    const models = await fetchImageModels();
    const usage = await getUsageData();
    
    // Format models for frontend consumption
    const formattedModels = models.map(model => {
      const modelUsage = usage[model.id] || Math.floor(Math.random() * 500) + 1000;
      const isNSFW = model.id.toLowerCase().includes('nsfw') || 
                     model.name.toLowerCase().includes('nsfw');
      
      return {
        id: model.id,
        name: model.name,
        description: model.description,
        owner: model.owned_by,
        premium: model.premium_model || false,
        sizes: model.sizes || ['1024x1024'],
        pricing: model.pricing,
        uses: modelUsage,
        trending: modelUsage > 2000,
        isNSFW
      };
    });
    
    // Sort models
    formattedModels.sort((a, b) => {
      if (a.isNSFW && !b.isNSFW) return -1;
      if (!a.isNSFW && b.isNSFW) return 1;
      return b.uses - a.uses;
    });

    console.log(`📤 Returning ${formattedModels.length} models to frontend`);
    
    return NextResponse.json({
      success: true,
      models: formattedModels,
      cached: Date.now() - modelsCache.timestamp < CACHE_DURATION,
      cacheAge: Date.now() - modelsCache.timestamp,
    });
    
  } catch (error) {
    console.error('❌ Error in GET /api/img:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch models',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST endpoint for image generation
export async function POST(request: NextRequest) {
  try {
    console.log('🎨 POST request received for image generation');
    
    // Parse the request body
    const body: ImageGenerationRequest = await request.json();
    console.log('📝 Request payload:', JSON.stringify(body, null, 2));
    
    // Validate required fields
    if (!body.prompt || !body.model) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: prompt and model' },
        { status: 400 }
      );
    }

    // Get API key from environment variables
    const apiKey = process.env.ELECTRON_API_KEY;
    if (!apiKey) {
      console.error('❌ API key not configured');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Fetch models to validate and get size options
    const models = await fetchImageModels();
    const selectedModel = models.find(m => m.id === body.model);
    
    if (!selectedModel) {
      console.error(`❌ Invalid model ID: ${body.model}`);
      return NextResponse.json(
        { error: `Invalid model: ${body.model}` },
        { status: 400 }
      );
    }
    
    console.log(`✅ Using model: ${selectedModel.name} (${selectedModel.id})`);

    // Validate size against model's supported sizes
    let size = body.size || '1024x1024';
    if (selectedModel.sizes && !selectedModel.sizes.includes(size)) {
      console.log(`⚠️ Size ${size} not supported, using default: ${selectedModel.sizes[0]}`);
      size = selectedModel.sizes[0];
    }

    // Prepare the request payload for ElectronHub API
    const payload: any = {
      model: body.model, // Use the model ID directly
      prompt: body.prompt,
      n: body.n || 1,
      size: size,
      response_format: body.response_format || 'url',
      public: body.public || false
    };

    // Only include quality parameter for DALL-E models
    if (body.model.toLowerCase().includes('dall-e') && body.quality) {
      payload.quality = body.quality;
    } else if (body.model.toLowerCase().includes('dall-e')) {
      payload.quality = 'standard';
    }

    // Only include style if provided and supported by the model
    if (body.style && body.model.toLowerCase().includes('dall-e')) {
      payload.style = body.style;
    }

    console.log('🚀 Making request to ElectronHub API with payload:', JSON.stringify(payload, null, 2));

    // Make the API call to ElectronHub
    const apiResponse = await fetch('https://api.electronhub.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log(`📡 ElectronHub API response status: ${apiResponse.status}`);

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('❌ ElectronHub API error:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      
      return NextResponse.json(
        { 
          error: 'Image generation failed', 
          details: errorData.error || apiResponse.statusText,
          status: apiResponse.status
        },
        { status: apiResponse.status }
      );
    }

    // Parse the successful response
    const data: ElectronHubResponse = await apiResponse.json();
    console.log('✅ ElectronHub API success response:', JSON.stringify(data, null, 2));
    
    // Validate response structure
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      console.error('❌ Invalid response structure from API');
      return NextResponse.json(
        { error: 'Invalid response from image generation service' },
        { status: 500 }
      );
    }

    const imageData = data.data[0];
    const imageUrl = imageData.url || (imageData.b64_json ? `data:image/png;base64,${imageData.b64_json}` : null);

    if (!imageUrl) {
      console.error('❌ No image data in response');
      return NextResponse.json(
        { error: 'No image data received from service' },
        { status: 500 }
      );
    }
    
    console.log('🎉 Image generated successfully');
    
    // Track usage for the model
    await trackUsage(body.model);

    // Return the image data with additional metadata
    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      revisedPrompt: imageData.revised_prompt,
      originalPrompt: body.prompt,
      model: body.model,
      modelName: selectedModel.name,
      style: body.style,
      size: size,
      created: data.created,
      generationTime: Date.now() - (data.created * 1000),
    });

  } catch (error) {
    console.error('💥 Image generation error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}