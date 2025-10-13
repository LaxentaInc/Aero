'use client';

import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function SpotifySyncAuth() {
  const searchParams = useSearchParams();
  const hash = searchParams.get('hash');
  const [status, setStatus] = useState<'waiting' | 'authorizing' | 'success'>('waiting');

  useEffect(() => {
    if (!hash) {
      setStatus('waiting');
    }
  }, [hash]);

  const handleAuth = async () => {
    if (!hash) {
      alert('No session hash provided!');
      return;
    }

    setStatus('authorizing');
    
    // Redirect to Spotify OAuth
    // After auth, NextAuth will redirect to your callback
    await signIn('spotify', {
      callbackUrl: `/api/spotify-sync/callback?hash=${hash}`,
      redirect: true,
    });
  };

  if (!hash) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold">❌ Invalid Request</h1>
          <p className="mt-4">No session hash provided</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold mb-4">Authorization Successful!</h1>
          <p className="text-gray-400">You can close this tab and return to your terminal.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="text-6xl mb-6">🎵</div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Spotify Sync CLI
        </h1>
        <p className="text-gray-400 mb-8 max-w-md">
          Click below to authorize the CLI tool to access your Spotify playlists
        </p>
        <button
          onClick={handleAuth}
          disabled={status === 'authorizing'}
          className="px-8 py-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white rounded-lg font-semibold text-lg transition-colors"
        >
          {status === 'authorizing' ? 'Redirecting...' : 'Connect Spotify'}
        </button>
      </div>
    </div>
  );
}