import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Reuse the same cache and auth functions
const nsfwTokenCache = { token: null as string | null, expires: 0 };
const nsfwContentCache = new Map();

async function getNSFWAuthToken() {
  if (nsfwTokenCache.token && Date.now() < nsfwTokenCache.expires) {
    return nsfwTokenCache.token;
  }
  try {
    const res = await axios.get('https://api.redgifs.com/v2/auth/temporary');
    nsfwTokenCache.token = res.data.token;
    nsfwTokenCache.expires = Date.now() + (24 * 60 * 60 * 1000);
    return nsfwTokenCache.token;
  } catch (error) {
    console.error('NSFW Auth error:', error);
    return null;
  }
}

function cacheContent(key: string, data: any, ttl = 5 * 60 * 1000) {
  nsfwContentCache.set(key, data);
  setTimeout(() => nsfwContentCache.delete(key), ttl);
}
function getCachedContent(key: string) {
  return nsfwContentCache.get(key);
}
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ query: string }> }
) {
  const { query } = await params;
  const { searchParams } = new URL(request.url);
  const count = searchParams.get('count') || '10';
  
  const cacheKey = `nsfw_suggest_${query}_${count}`;
  if (nsfwContentCache.has(cacheKey)) {
    return NextResponse.json(nsfwContentCache.get(cacheKey));
  }

  const token = await getNSFWAuthToken();
  if (!token) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }

  try {
    const response = await axios.get('https://api.redgifs.com/v2/tags/suggest', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      params: {
        text: query,  // Changed from 'query' to 'text' as per RedGifs API
        order: 'trending',  // Added default order
        count: parseInt(count)
      }
    });

    // Validate response data
    if (!response.data) {
      throw new Error('Empty response from RedGifs API');
    }

    const data = { 
      success: true, 
      suggestions: response.data.tags || [] // Access the tags array specifically
    };
    
    cacheContent(cacheKey, data, 10 * 60 * 1000);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('NSFW Tag suggestion error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Suggestions failed',
        details: error.response?.data || error.message
      }, 
      { status: error.response?.status || 500 }
    );
  }
}