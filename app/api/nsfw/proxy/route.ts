// import { NextRequest } from 'next/server';
// import axios from 'axios';

// const nsfwTokenCache = { token: null as string | null, expires: 0 };

// async function getNSFWAuthToken() {
//   if (nsfwTokenCache.token && Date.now() < nsfwTokenCache.expires) {
//     return nsfwTokenCache.token;
//   }
//   try {
//     const res = await axios.get('https://api.redgifs.com/v2/auth/temporary');
//     nsfwTokenCache.token = res.data.token;
//     nsfwTokenCache.expires = Date.now() + (24 * 60 * 60 * 1000);
//     return nsfwTokenCache.token;
//   } catch (error) {
//     console.error('NSFW Auth error:', error);
//     return null;
//   }
// }

// export async function GET(request: NextRequest) {
//   const { searchParams } = new URL(request.url);
//   const url = searchParams.get('url');
  
//   if (!url || !url.includes('redgifs.com')) {
//     return new Response(JSON.stringify({ error: 'Invalid URL' }), { 
//       status: 400,
//       headers: { 'Content-Type': 'application/json' }
//     });
//   }

//   const token = await getNSFWAuthToken();
//   if (!token) {
//     return new Response(JSON.stringify({ error: 'Authentication failed' }), { 
//       status: 500,
//       headers: { 'Content-Type': 'application/json' }
//     });
//   }

//   try {
//     const range = request.headers.get('range');
//     const headers: any = {
//       'Authorization': `Bearer ${token}`,
//       'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
//       'Referer': 'https://www.redgifs.com/',
//       'Origin': 'https://www.redgifs.com',
//       'Accept': '*/*',
//       'Accept-Encoding': 'identity',
//       'Connection': 'keep-alive'
//     };

//     if (range) {
//       headers['Range'] = range;
//     }

//     console.log('Proxying URL:', url);

//     const response = await fetch(url, {
//       method: 'GET',
//       headers: headers,
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const responseHeaders: any = {
//       'Content-Type': response.headers.get('content-type') || 'video/mp4',
//       'Accept-Ranges': 'bytes',
//       'Cache-Control': 'public, max-age=3600',
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
//       'Access-Control-Allow-Headers': 'Range, Content-Range, Content-Length'
//     };

//     // Copy relevant headers
//     const contentLength = response.headers.get('content-length');
//     const contentRange = response.headers.get('content-range');
    
//     if (contentLength) {
//       responseHeaders['Content-Length'] = contentLength;
//     }
    
//     if (contentRange) {
//       responseHeaders['Content-Range'] = contentRange;
//     }

//     return new Response(response.body, {
//       status: response.status,
//       headers: responseHeaders
//     });

//   } catch (error: any) {
//     console.error('Proxy error:', error.message);
    
//     // Fallback: try without auth
//     try {
//       console.log('Retrying without auth token...');
      
//       const fallbackHeaders: any = {
//         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
//         'Referer': 'https://www.redgifs.com/',
//         'Accept': '*/*'
//       };

//       const range = request.headers.get('range');
//       if (range) {
//         fallbackHeaders['Range'] = range;
//       }

//       const response = await fetch(url, {
//         method: 'GET',
//         headers: fallbackHeaders,
//       });

//       if (!response.ok) {
//         throw new Error(`Fallback failed: ${response.status}`);
//       }

//       const responseHeaders: any = {
//         'Content-Type': response.headers.get('content-type') || 'video/mp4',
//         'Accept-Ranges': 'bytes',
//         'Access-Control-Allow-Origin': '*'
//       };

//       const contentLength = response.headers.get('content-length');
//       const contentRange = response.headers.get('content-range');
      
//       if (contentLength) responseHeaders['Content-Length'] = contentLength;
//       if (contentRange) responseHeaders['Content-Range'] = contentRange;

//       return new Response(response.body, {
//         status: response.status,
//         headers: responseHeaders
//       });

//     } catch (fallbackError: any) {
//       console.error('Fallback error:', fallbackError.message);
//       return new Response(JSON.stringify({ error: 'Proxy failed - ' + error.message }), { 
//         status: 500,
//         headers: { 'Content-Type': 'application/json' }
//       });
//     }
//   }
// }

// // Handle OPTIONS requests for CORS
// export async function OPTIONS() {
//   return new Response(null, {
//     status: 200,
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
//       'Access-Control-Allow-Headers': 'Range, Content-Range, Content-Length',
//       'Access-Control-Max-Age': '86400',
//     },
//   });
// }


import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  
  if (!url) {
    return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
  }

  try {
    console.log('Proxying URL:', url)
    
    // Important: Pass range headers for video streaming
    const headers: HeadersInit = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://www.redgifs.com/',
    }
    
    // Handle range requests for video seeking
    const range = request.headers.get('range')
    if (range) {
      headers['Range'] = range
    }

    const response = await fetch(url, { headers })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Create response headers
    const responseHeaders = new Headers({
      'Content-Type': response.headers.get('content-type') || 'video/mp4',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    })

    // Pass through important headers for video streaming
    const headersToPass = ['content-length', 'content-range', 'accept-ranges']
    headersToPass.forEach(header => {
      const value = response.headers.get(header)
      if (value) {
        responseHeaders.set(header, value)
      }
    })

    // Return streamed response
    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to proxy video' },
      { status: 500 }
    )
  }
}