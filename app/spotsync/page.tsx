'use client';

import { useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface Playlist {
  id: string;
  name: string;
  images: Array<{ url: string }>;
  tracks: { total: number };
  external_urls: { spotify: string };
}

interface Account {
  name: string;
  image: string;
  role: 'source' | 'destination';
}

const SpotifyLogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#1DB954" />
    <path
      d="M22.4 13.6c-3.2-1.9-8.5-2.1-11.6-1.2-.5.2-1 0-1.2-.5-.2-.5 0-1 .5-1.2 3.6-1 9.4-.8 13.1 1.3.4.3.6.9.3 1.3-.3.5-.8.6-1.1.3zm-.1 2.9c-.3.4-.8.5-1.2.2-2.7-1.7-6.8-2.1-10-1.2-.4.1-.9-.1-1-.5-.1-.4.1-.9.5-1 3.7-1.1 8.2-.6 11.4 1.3.4.2.5.8.3 1.2zm-1.4 2.8c-.2.3-.6.4-.9.2-2.4-1.4-5.4-1.8-8.9-1-.3.1-.7-.1-.8-.5-.1-.3.1-.7.5-.8 3.8-.9 7.1-.5 9.8 1.1.4.2.5.7.3 1zm-4.9-13.3c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z"
      fill="white"
    />
  </svg>
);

const SwapIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"></polyline>
    <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
    <polyline points="7 23 3 19 7 15"></polyline>
    <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
  </svg>
);

const PlaylistIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mx-auto">
    <rect x="6" y="6" width="36" height="36" rx="4" fill="#1f2937" stroke="#4b5563" strokeWidth="1.5" />
    <line x1="12" y1="16" x2="36" y2="16" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="12" y1="24" x2="36" y2="24" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="12" y1="32" x2="28" y2="32" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const AlertIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

export default function SpotifySyncAuth() {
  const searchParams = useSearchParams();
  const hash = searchParams.get('hash');
  const { data: session, status } = useSession();
  
  const [accounts, setAccounts] = useState<{ source: Account | null; destination: Account | null }>({
    source: null,
    destination: null,
  });
  
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlaylists = async () => {
    if (!session?.accessToken) return;
    
    setLoading(true);
    try {
      const res = await fetch('https://api.spotify.com/v1/me/playlists', {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setPlaylists(data.items || []);
      }
    } catch (err) {
      console.error('Error fetching playlists:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSourceAuth = async () => {
    if (!hash) {
      alert('⚠️ No session hash provided! Start from your CLI tool first to get authentication access.');
      return;
    }

    await signIn('spotify', {
      callbackUrl: `/api/spotify-sync/callback?hash=${hash}&role=source`,
      redirect: true,
    });
  };

  const handleDestinationAuth = async () => {
    if (!hash) {
      alert('⚠️ No session hash provided! Start from your CLI tool first to get authentication access.');
      return;
    }

    await signIn('spotify', {
      callbackUrl: `/api/spotify-sync/callback?hash=${hash}&role=destination`,
      redirect: true,
    });
  };

  const handleSwapAccounts = () => {
    setAccounts(prev => ({
      source: prev.destination,
      destination: prev.source,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white pt-20">
      {/* Header */}
      <div className="border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <SpotifyLogo />
            <div>
              <h1 className="text-3xl font-bold">Spotify Sync</h1>
              <p className="text-gray-400 text-sm mt-1">Transfer playlists between accounts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Banner - Only shown when no hash */}
      {!hash && (
        <div className="border-b border-yellow-700/50 bg-yellow-900/20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-start gap-3">
              <AlertIcon />
              <div className="flex-1">
                <p className="font-semibold text-yellow-300">Authentication Locked</p>
                <p className="text-yellow-200/80 text-sm mt-1">
                  To authenticate your Spotify accounts, please start the sync process from your CLI tool. 
                  You'll receive a unique session hash that enables authentication on this page.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Account Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Source Account */}
          <div className={`bg-gray-800 rounded-lg p-6 border transition-all ${
            hash ? 'border-gray-700 hover:border-gray-600' : 'border-gray-800'
          }`}>
            <div className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
              Source Account
            </div>
            {accounts.source ? (
              <div className="flex flex-col items-center">
                {accounts.source.image && (
                  <img
                    src={accounts.source.image}
                    alt={accounts.source.name}
                    className="w-20 h-20 rounded-full mb-4 ring-2 ring-green-500"
                  />
                )}
                <p className="text-lg font-semibold text-center">{accounts.source.name}</p>
                <p className="text-sm text-green-400 mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Connected
                </p>
              </div>
            ) : (
              <button
                onClick={handleSourceAuth}
                disabled={!hash || status === 'loading'}
                className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  hash
                    ? 'bg-green-500 hover:bg-green-600 active:scale-95 text-white shadow-lg shadow-green-500/20'
                    : 'bg-gray-700/50 text-gray-400 cursor-not-allowed border border-gray-600/50'
                }`}
              >
                {!hash && <LockIcon />}
                {status === 'loading' ? 'Connecting...' : hash ? 'Connect Account' : 'Authentication Locked'}
              </button>
            )}
          </div>

          {/* Swap Button */}
          <div className="flex items-center justify-center">
            {accounts.source && accounts.destination && (
              <button
                onClick={handleSwapAccounts}
                className="p-4 bg-gray-700 hover:bg-gray-600 rounded-full transition-all hover:scale-110 active:scale-95 shadow-lg"
                title="Swap accounts"
              >
                <SwapIcon />
              </button>
            )}
          </div>

          {/* Destination Account */}
          <div className={`bg-gray-800 rounded-lg p-6 border transition-all ${
            hash ? 'border-gray-700 hover:border-gray-600' : 'border-gray-800'
          }`}>
            <div className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
              Destination Account
            </div>
            {accounts.destination ? (
              <div className="flex flex-col items-center">
                {accounts.destination.image && (
                  <img
                    src={accounts.destination.image}
                    alt={accounts.destination.name}
                    className="w-20 h-20 rounded-full mb-4 ring-2 ring-blue-500"
                  />
                )}
                <p className="text-lg font-semibold text-center">{accounts.destination.name}</p>
                <p className="text-sm text-blue-400 mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  Connected
                </p>
              </div>
            ) : (
              <button
                onClick={handleDestinationAuth}
                disabled={!hash || status === 'loading'}
                className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  hash
                    ? 'bg-green-500 hover:bg-green-600 active:scale-95 text-white shadow-lg shadow-green-500/20'
                    : 'bg-gray-700/50 text-gray-400 cursor-not-allowed border border-gray-600/50'
                }`}
              >
                {!hash && <LockIcon />}
                {status === 'loading' ? 'Connecting...' : hash ? 'Connect Account' : 'Authentication Locked'}
              </button>
            )}
          </div>
        </div>

        {/* Playlists Section */}
        {accounts.source ? (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Playlists from Source Account</h2>
              <p className="text-gray-400">Select playlists to sync to your destination account</p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block">
                  <div className="w-8 h-8 border-2 border-gray-600 border-t-green-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-400 mt-4">Loading playlists...</p>
              </div>
            ) : playlists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {playlists.map(playlist => (
                  <a
                    key={playlist.id}
                    href={playlist.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 hover:bg-gray-750 rounded-lg p-4 border border-gray-700 hover:border-green-500 transition-all group cursor-pointer"
                  >
                    <div className="flex gap-4">
                      {playlist.images[0] ? (
                        <img
                          src={playlist.images[0].url}
                          alt={playlist.name}
                          className="w-16 h-16 rounded object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded bg-gray-700 flex items-center justify-center">
                          <PlaylistIcon />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold group-hover:text-green-400 transition-colors line-clamp-2">
                          {playlist.name}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                          {playlist.tracks.total} tracks
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
                <PlaylistIcon />
                <p className="text-gray-400 mt-4">No playlists found</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-800/50 rounded-lg p-12 text-center border border-gray-700/50">
            <PlaylistIcon />
            <p className="text-gray-400 mt-4 text-lg font-medium">Connect your source account to view playlists</p>
            <p className="text-gray-500 text-sm mt-2">
              {hash 
                ? "Click the 'Connect Account' button above to get started" 
                : "Start from the CLI tool to enable authentication"}
            </p>
          </div>
        )}

        {/* Success State */}
        {accounts.source && accounts.destination && hash && (
          <div className="mt-12 bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/50 rounded-lg p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-2xl font-bold mb-2">Ready to Sync!</h3>
            <p className="text-gray-300 mb-6">
              Both accounts are connected. Return to your CLI tool to start syncing playlists.
            </p>
            <div className="inline-flex items-center gap-2 text-sm text-gray-400 bg-gray-900/50 px-4 py-2 rounded">
              <span className="text-gray-500">Session:</span>
              <code className="font-mono text-green-400">{hash.slice(0, 8)}...{hash.slice(-8)}</code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}