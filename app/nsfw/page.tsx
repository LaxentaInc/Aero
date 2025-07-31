'use client'

export default function DisabledPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white font-mono">
      <div className="text-center space-y-8">
        <h1 className="text-xl">
          This page contains NSFW content
        </h1>
        
        <button
          onClick={() => window.location.href = 'https://nextjs-errordumb.vercel.app/hanime'}
          className="bg-white text-black px-6 py-3 hover:bg-gray-200 transition-colors"
        >
          CONTINUE TO NSFW CONTENT
        </button>
        
        <p className="text-sm text-gray-400">
          You will be safely redirected
        </p>
      </div>
    </div>
  )
}
