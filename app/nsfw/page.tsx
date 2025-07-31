'use client'
export default function DisabledPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>
      
      <div className="relative z-10 max-w-2xl w-full">
        <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-8 sm:p-12 shadow-2xl border border-white/10">
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <span className="text-3xl">🔒</span>
            </div>
            
            {/* Main message */}
            <h1 className="text-3xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
              The page is basically one other site and is just crazy nsfw hentai material ;-; ( i dont want this main site banned lol :3 )
            </h1>
            
            {/* Subtext */}
            <p className="text-zinc-300 text-base sm:text-lg leading-relaxed">
              You can still access this functionality at{' '}
              <a
                href="https://nextjs-errordumb.vercel.app/nsfw"
                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 transition-all duration-200 hover:underline-offset-8"
              >
                https://nextjs-errordumb.vercel.app/anime
              </a>
            </p>
            
            {/* Divider */}
            <div className="flex items-center justify-center space-x-4 my-8">
              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1"></div>
              <span className="text-zinc-500 text-sm">OR</span>
              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1"></div>
            </div>
            
            {/* 18+ Button */}
            <button
              onClick={() => window.location.href = 'https://nextjs-errordumb.vercel.app/nsfw'}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white transition-all duration-200 ease-out transform hover:scale-105 active:scale-95"
            >
              {/* Button background */}
              <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 rounded-full shadow-lg group-hover:shadow-red-500/50"></span>
              
              {/* Button hover effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
              
              {/* Button content */}
              <span className="relative flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>This is 18+ Content Page</span>
              </span>
            </button>
            
            {/* Small warning text */}
            <p className="text-xs text-zinc-500 mt-4">
              By clicking the button above, you confirm you are 18 years or older
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
