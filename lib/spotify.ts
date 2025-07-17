import SpotifyWebApi from 'spotify-web-api-node'

const scopes = [
  'user-read-recently-played',
  'user-read-playback-state',
  'user-read-currently-playing',
].join(',')

const params = {
  scope: scopes,
}

const queryParamString = new URLSearchParams(params).toString()

export const LOGIN_URL = `https://accounts.spotify.com/authorize?${queryParamString}`

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
})

export default spotifyApi
