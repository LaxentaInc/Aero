'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

const ALLOWED_IDS = ['886971572668219392', '953527567808356404'];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Loading state
  if (status === 'loading') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Verifying access...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (status === 'unauthenticated') {
    return null; // Will redirect
  }

  // Check if user ID is allowed
  const isAllowed = session?.user?.id && ALLOWED_IDS.includes(session.user.id);

  if (!isAllowed) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${
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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Lock size={64} className="mx-auto mb-6 text-red-500" />
          </motion.div>
          
          <h1 className={`text-3xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Access Denied
          </h1>
          
          <p className={`text-lg mb-6 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            This page is private and only accessible to authorized users.
          </p>
          
          <p className={`text-sm mb-8 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            If you think this is a mistake, please contact the site owner.
          </p>
          
          <motion.button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Go Back
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // User is allowed, render the page
  return <>{children}</>;
}