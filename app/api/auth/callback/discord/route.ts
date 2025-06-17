import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect('http://localhost:3000/ai?error=no_code')
  }

  try {
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/discord',
      }),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      return new Response('Token error', { status: 400 })
    }

    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const userData = await userResponse.json()

    const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Login Successful</title>
    <style>
      body {
        font-family: sans-serif;
        background-color: #0f0f0f;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
      }
    </style>
  </head>
  <body>
    <div>
      <h1>Login Successful!</h1>
      <p>You can close this window.</p>
    </div>
    <script>
      const user = {
        id: "${userData.id}",
        username: "${userData.username}",
        avatar: "https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png",
        bots: []
      };

      console.log('Posting user:', user)

      if (window.opener) {
        window.opener.postMessage({ type: 'DISCORD_AUTH_SUCCESS', user }, '*');
        setTimeout(() => window.close(), 1000);
      }
    </script>
  </body>
</html>
    `

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    })
  } catch (err) {
    console.error(err)
    return new Response('uwu ily error', { status: 500 })
  }
}