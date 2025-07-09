import { NextResponse } from 'next/server'

// Authorization token that must have been created previously. See : https://developer.spotify.com/documentation/web-api/concepts/authorization
const token = 'BQBkKuxh64Ic5eu0I0ZZJw_icFLJgr-6jGgKJ6OxpkySKmzPHAgp-eqRN9MiRL4BbpEAGuQrxUnsQzb990qXii2LtnCHADbephBpAZwxLhB4uNGSFhWkM-AmkBgWtA_qB-jqjvlY1x98JbWoOqb6jwTeIO_LuXqFLOQ7HfZReT9Gnxu5NATFhLL5iMy8HECc-4rIkybKcXgtHRDSZj4va2JqFmloTXoNJuJj4RHHO1Vy32FI0xgujtHqBd-_po-CgfU_-tnEBsV2MAVSdL1SWw9Qa6pxPxY6SqCFBGAY_9trGfVHm9JADNU3UOhBgAX7DHnS'

async function fetchWebApi(endpoint: string, method: string, body?: any) {
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return await res.json();
}

export async function GET() {
  try {
    const topTracks = await fetchWebApi(
      'v1/me/top/tracks?time_range=long_term&limit=10', 'GET'
    );
    return NextResponse.json({
      tracks: topTracks?.items?.map(
        (track: { name: string; artists: any[]; album: { name: string; images?: { url: string }[] }; external_urls: { spotify: string } }) => ({
          name: track.name,
          artists: track.artists.map((artist: any) => artist.name).join(', '),
          album: track.album.name,
          image: track.album.images?.[0]?.url,
          url: track.external_urls.spotify,
        })
      )
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch Spotify data' }, { status: 500 });
  }
}
