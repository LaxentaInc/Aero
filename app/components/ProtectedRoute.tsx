'use client';
import { useSession, signIn } from 'next-auth/react';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';

const ALLOWED_IDS = ['886971572668219392', '953527567808356404'];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { theme } = useTheme();
  if (status === 'loading') {
    return (
      <div className={`min-h-screen flex items-center justify-center font-sans ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/20' 
          : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'
      }`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Are you a fish? Lets check your session...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated - show login prompt
  if (status === 'unauthenticated') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 font-sans ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/20' 
          : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'
      }`}>
        <motion.div
          className={`max-w-md w-full backdrop-blur-xl rounded-3xl p-8 border shadow-2xl text-center ${
            theme === 'dark' 
              ? 'bg-gray-800/80 border-gray-700/50' 
              : 'bg-white/80 border-gray-200/50'
          }`}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <svg className="mx-auto mb-6" width="80" height="80" viewBox="0 0 80 80" fill="none">
              <motion.circle
                cx="40"
                cy="40"
                r="35"
                stroke="url(#lockGradient)"
                strokeWidth="3"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
              <motion.rect
                x="28"
                y="35"
                width="24"
                height="28"
                rx="3"
                fill="url(#lockGradient)"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 35, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              />
              <motion.path
                d="M 32 35 L 32 28 Q 32 20 40 20 Q 48 20 48 28 L 48 35"
                stroke="url(#lockGradient)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.8, duration: 0.7 }}
              />
              <motion.circle
                cx="40"
                cy="48"
                r="3"
                fill="white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2, type: "spring", stiffness: 300 }}
              />
              <motion.rect
                x="38.5"
                y="48"
                width="3"
                height="8"
                rx="1.5"
                fill="white"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 1.4, duration: 0.3 }}
              />
              <defs>
                <linearGradient id="lockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
          
          <h1 className={`text-4xl font-black mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            This page is dedicated to a fish
          </h1>
          
          <p className={`text-lg mb-3 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Due to a <span className="font-bold text-red-500">concerning amount of comments</span> to me about her and other cringe shi they said...
          </p>

          <p className={`text-base mb-8 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            I decided to make it only Accessible to Her. Cz im done dealing with it atp, i have more to do in life than explain my relation with her to randoms
          </p>
          
          <motion.button
            onClick={() => signIn('discord')}
            className="w-full px-6 py-4 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogIn size={24} />
            Sign in to find out
          </motion.button>

          <p className={`text-xs mt-6 ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            Hint: Bro You probably shouldn't be here 👀
          </p>
        </motion.div>
      </div>
    );
  }

  const isAllowed = session?.user?.id && ALLOWED_IDS.includes(session.user.id);
  if (!isAllowed) {
    const userAvatar = session?.user?.image || '/default-avatar.png';
    const userName = session?.user?.name || 'Unknown User';

    return (
      <div className={`min-h-screen flex items-center justify-center p-6 font-sans ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/20' 
          : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'
      }`}>
        <motion.div
          className={`max-w-lg w-full backdrop-blur-xl rounded-3xl p-8 border shadow-2xl text-center ${
            theme === 'dark' 
              ? 'bg-gray-800/80 border-gray-700/50' 
              : 'bg-white/80 border-gray-200/50'
          }`}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <svg className="mx-auto mb-6" width="80" height="80" viewBox="0 0 80 80" fill="none">
              <motion.circle
                cx="40"
                cy="40"
                r="35"
                stroke="#EF4444"
                strokeWidth="4"
                fill="none"
                initial={{ pathLength: 0, rotate: 0 }}
                animate={{ pathLength: 1, rotate: 360 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
              <motion.path
                d="M 25 40 L 35 50 L 55 30"
                stroke="#EF4444"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 2, times: [0, 0.5, 0.7, 1], repeat: Infinity, repeatDelay: 1 }}
              />
              <motion.line
                x1="30"
                y1="30"
                x2="50"
                y2="50"
                stroke="#EF4444"
                strokeWidth="5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 1, duration: 0.3 }}
              />
              <motion.line
                x1="50"
                y1="30"
                x2="30"
                y2="50"
                stroke="#EF4444"
                strokeWidth="5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 1.2, duration: 0.3 }}
              />
            </svg>
          </motion.div>
          
          <h1 className={`text-4xl font-black mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Whoops! Wrong Door 🚪
          </h1>

          <motion.div 
            className={`mb-6 p-4 rounded-2xl ${
              theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-100/70'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <img 
              src={userAvatar} 
              alt={userName}
              className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-red-500"
            />
            <p className={`text-lg font-bold mb-1 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {userName}
            </p>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              ID: {session?.user?.id}
            </p>
          </motion.div>
          
          <p className={`text-lg mb-4 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            This page isn't for you my man
          </p>

          <p className={`text-base mb-6 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Due to an overwhelming amount of <span className="font-bold text-red-500">concerning messages</span> and comments about her to me by random ppl, 
            this page is now <span className="font-bold text-purple-500">restricted access only</span>.
          </p>

          <div className={`p-4 rounded-xl mb-6 ${
            theme === 'dark' ? 'bg-red-900/20 border border-red-700/50' : 'bg-red-100/70 border border-red-300'
          }`}>
            <p className={`text-sm font-semibold ${
              theme === 'dark' ? 'text-red-300' : 'text-red-700'
            }`}>
              ⚠️ No creeps allowed ⚠️
            </p>
            <p className={`text-xs mt-2 ${
              theme === 'dark' ? 'text-red-400' : 'text-red-600'
            }`}>
              This page is for someone, Please give up bro ;=;
            </p>
          </div>
          
          <motion.button
            onClick={() => window.location.href = '/'}
            className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold hover:from-red-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Back to Safety 🏃‍♂️💨
          </motion.button>

          <p className={`text-xs mt-6 italic ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            "you miss 100% of the pages you're not authorized to see"- Sun tzu, probably idk
          </p>
        </motion.div>
      </div>
    );
  }

  // User is allowed - ONLY NOW render the actual content
  return <>{children}</>;
}