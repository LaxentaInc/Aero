'use client';
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";
import { Home, Briefcase, Code, Sun, Moon, ExternalLink, Star, GitFork, Calendar } from 'lucide-react';

// Page Types
type PageType = 'home' | 'projects' | 'skills';

// Project data
const projectsData = [
    {
        name: "ProCommit",
        description: "📝 A Customizable VS Code extension for AI-generated commit messages.",
        tech: ["TypeScript"],
        license: "MIT License",
        updated: "Jul 19",
        url: "https://github.com/koimoee/ProCommit",
        color: "from-blue-400 to-blue-600"
    },
    {
        name: "Kizzy",
        description: "Discord Rich Presence for Android. Made with jetpack compose and material3",
        tech: ["Kotlin"],
        license: "GNU General Public License v3.0",
        updated: "May 25",
        url: "https://github.com/koimoee/Kizzy",
        forked: true,
        stars: 1,
        color: "from-purple-400 to-purple-600"
    },
    {
        name: "VSNordTheme",
        description: "🎨 A Multi awesome Nord theme For Visual Studio Code",
        tech: ["CSS"],
        license: "GNU General Public License v3.0",
        updated: "Jan 9",
        url: "https://github.com/koimoee/VSNordTheme",
        color: "from-cyan-400 to-cyan-600"
    },
    {
        name: "GameServerMonitorFork",
        description: "📺 A discord bot that monitors your game server and tracks the live data of your game servers. Supports over 260 game servers.",
        tech: ["Python"],
        license: "MIT License",
        updated: "Jan 6",
        url: "https://github.com/koimoee/GameServerMonitorFork",
        forked: true,
        stars: 1,
        color: "from-green-400 to-green-600"
    },
    {
        name: "lanyard",
        description: "🏷️ Expose your Discord presence and activities to a RESTful API and WebSocket in less than 10 seconds",
        tech: ["Elixir"],
        license: "MIT License",
        updated: "Dec 29, 2024",
        url: "https://github.com/koimoee/lanyard",
        forked: true,
        color: "from-red-400 to-red-600"
    },
    {
        name: "EllenJoeNextGlass",
        description: "🎨 A Clean Frosted Glass Themed Ellen Joe's For Discord.",
        tech: ["CSS"],
        license: "GNU General Public License v3.0",
        updated: "Dec 20, 2024",
        url: "https://github.com/koimoee/EllenJoeNextGlass",
        color: "from-pink-400 to-pink-600"
    },
    {
        name: "GHSocialPreview",
        description: "Create Your Github Social Image!",
        tech: ["JavaScript"],
        license: "MIT License",
        updated: "Dec 19, 2024",
        url: "https://github.com/koimoee/GHSocialPreview",
        color: "from-yellow-400 to-yellow-600"
    },
    {
        name: "GeminiCommit",
        description: "AI-powered commit message generator",
        tech: ["TypeScript"],
        license: "MIT License",
        updated: "Dec 13, 2024",
        url: "https://github.com/koimoee/GeminiCommit",
        forked: true,
        color: "from-indigo-400 to-indigo-600"
    },
    {
        name: "koimoee",
        description: "Just My Readme",
        tech: ["Markdown"],
        updated: "Dec 12, 2024",
        url: "https://github.com/koimoee/koimoee",
        stars: 2,
        color: "from-gray-400 to-gray-600"
    },
    {
        name: "lavalink-list",
        description: "A list of free and available public Lavalink nodes with their live status.",
        tech: ["TypeScript"],
        license: "GNU General Public License v3.0",
        updated: "Oct 26, 2024",
        url: "https://github.com/koimoee/lavalink-list",
        forked: true,
        color: "from-blue-500 to-blue-700"
    },
    {
        name: "ActivityCord",
        description: "Allows you to create streaming, playing, and listening status on Discord.",
        tech: ["JavaScript"],
        license: "GNU General Public License v3.0",
        updated: "May 24, 2024",
        url: "https://github.com/koimoee/ActivityCord",
        stars: 8,
        color: "from-purple-500 to-purple-700"
    },
    {
        name: "PrismLog",
        description: "Simple logging utility for Node.js applications, providing colorful and formatted console logs.",
        tech: ["JavaScript"],
        license: "MIT License",
        updated: "Mar 31, 2024",
        url: "https://github.com/koimoee/PrismLog",
        color: "from-emerald-400 to-emerald-600"
    },
    {
        name: "thorium",
        description: "Chromium fork named after radioactive element No. 90.",
        tech: ["C++"],
        license: "BSD 3-Clause License",
        updated: "Mar 27, 2024",
        url: "https://github.com/koimoee/thorium",
        forked: true,
        color: "from-orange-400 to-orange-600"
    },
    {
        name: "Welcomify",
        description: "A cutting-edge canvas library for creating futuristic welcome cards.",
        tech: ["JavaScript"],
        license: "GNU General Public License v3.0",
        updated: "Mar 7, 2024",
        url: "https://github.com/koimoee/Welcomify",
        color: "from-violet-400 to-violet-600"
    },
    {
        name: "register",
        description: "Grab your own sweet-looking '.is-a.dev' subdomain",
        tech: ["JavaScript"],
        license: "GNU General Public License v3.0",
        updated: "Nov 19, 2023",
        url: "https://github.com/koimoee/register",
        forked: true,
        stars: 1,
        color: "from-teal-400 to-teal-600"
    },
    {
        name: "ServerCloner2.0",
        description: "Clone a Discord server, including channels, categories, roles and permissions.",
        tech: ["Python"],
        updated: "Sep 22, 2023",
        url: "https://github.com/koimoee/ServerCloner2.0",
        color: "from-rose-400 to-rose-600"
    }
];
//hehe

const useProtection = () => {
  useEffect(() => {
    const preventDefaultKeys = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'u' || e.key === 'U')) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'i') ||
        (e.ctrlKey && e.shiftKey && e.key === 'I')
      ) {
        e.preventDefault();
        return false;
      }
    };

    const preventContextMenu = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.closest('.allow-select')) {
        return;
      }
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('keydown', preventDefaultKeys);

    const images = document.getElementsByTagName('img');
    Array.from(images).forEach(img => {
      img.addEventListener('dragstart', (e) => e.preventDefault());
      img.setAttribute('draggable', 'false');
    });

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('keydown', preventDefaultKeys);
      Array.from(images).forEach(img => {
        img.removeEventListener('dragstart', (e) => e.preventDefault());
      });
    };
  }, [])
}

const VideoBackground = ({ theme }: { theme: 'dark' | 'light' }) => {
	// list of possible video sources
	const videos = [
		"/videos/damnbro.webm",
		"/videos/Eyeloading-bg.webm",
        "/videos/myCutekoiiii.webm"
	]

	// pick one at random every render
	const randomVideo = videos[Math.floor(Math.random() * videos.length)]

	return (
		<div className="absolute inset-0 z-0 overflow-hidden">
			<video
				autoPlay
				muted
				loop
				playsInline
				crossOrigin="anonymous"
				className={`absolute top-0 left-0 w-full h-[53vh] object-cover ${
					theme === 'dark' ? 'opacity-40' : 'opacity-20'
				}`}
			>
				{/* https://static.tradingview.com/static/bundles/northern-lights-pricing-desktop.86b1853e628d56f03bc8.webm */}
                {/* https://prplmoe.me/assets/animation/Kochan_2.mp4 */}
				<source 
				    src={randomVideo} //also add shorekeeper.mp4
					type="video/webm" 
				/>
			</video>


			<div className={`absolute inset-0 bg-gradient-to-b ${
				theme === 'dark' 
					? 'from-black/50 via-black/30 to-black/50' 
					: 'from-white/50 via-white/30 to-white/50'
			}`} />
		</div>
	)
}



const Skillsbg = ({ theme }: { theme: 'dark' | 'light' }) => {
	return (
		<div className="absolute inset-0 z-0 overflow-hidden">
			<video
				autoPlay
				muted
				loop
				playsInline
				crossOrigin="anonymous"
				className={`absolute top-0 left-0 w-full h-full object-cover ${
					theme === 'dark' ? 'opacity-40' : 'opacity-20'
				}`}
			>
				{/* https://static.tradingview.com/static/bundles/northern-lights-pricing-desktop.86b1853e628d56f03bc8.webm */}
                {/* https://prplmoe.me/assets/animation/Kochan_2.mp4 */}
				<source 
				    src="https://static.tradingview.com/static/bundles/northern-lights-pricing-desktop.86b1853e628d56f03bc8.webm" //also add shorekeeper.mp4
					type="video/webm" 
				/>
			</video>
			
			<img 
  src="https://static.tradingview.com/static/bundles/northern-lights-pricing-desktop.86b1853e628d56f03bc8.webm" 
  alt="Background GIF"
  className={`absolute top-0 left-0 w-full h-full object-cover z-0 ${theme === 'dark' ? 'opacity-40' : 'opacity-20'}`}
/>

			<div className={`absolute inset-0 bg-gradient-to-b ${
				theme === 'dark' 
					? 'from-black/50 via-black/30 to-black/50' 
					: 'from-white/50 via-white/30 to-white/50'
			}`} />
		</div>
	)
}


const API_URL = "https://api.lanyard.rest/v1/users/886971572668219392";

type DiscordStatus = 'online' | 'dnd' | 'idle' | 'offline';
type DiscordData = {
    discord_status: DiscordStatus;
    discord_user: {
        username: string;
        global_name: string;
        avatar: string;
        id: string;
        clan?: string;
        avatar_decoration_data?: {
            sku_id: string;
            asset: string;
            expires_at: string | null;
        };
        primary_guild?: {
            tag: string;
            identity_guild_id: string;
            badge: string;
            identity_enabled: boolean;
        };
    };
    activities: Array<{
        name: string;
        type: number;
        timestamps?: {
            start: number;
        };
        assets?: {
            large_image: string;
        };
        platform?: string;
    }>;
    active_on_discord_desktop?: boolean;
    active_on_discord_mobile?: boolean;
    active_on_discord_web?: boolean;
    active_on_discord_embedded?: boolean;
    listening_to_spotify?: boolean;
    spotify?: {
        song: string;
        artist: string;
    };
};

const DiscordStatus = ({ currentPage }: { currentPage: PageType }) => {
    const { theme } = useTheme();
    const [discordData, setDiscordData] = useState<DiscordData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        const fetchDiscordData = async () => {
            setLoading(true);
            try {
                const response = await fetch(API_URL);
                const { data } = await response.json();
                setDiscordData(data);
            } catch (error) {
                console.error("Failed to fetch Discord data:", error);
            }
            setLoading(false);
        };

        if (currentPage === 'home') {
            fetchDiscordData();
            const interval = setInterval(fetchDiscordData, 10000);
            return () => clearInterval(interval);
        }
    }, [currentPage]);

    if (currentPage !== 'home') return null;

    const statusColors = {
        online: 'bg-green-500',
        dnd: 'bg-red-500',
        idle: 'bg-yellow-500',
        offline: 'bg-gray-500'
    };

    const avatarUrl = discordData?.discord_user?.avatar 
        ? `https://cdn.discordapp.com/avatars/${discordData.discord_user.id}/${discordData.discord_user.avatar}.png?size=128`
        : '';

    const getStatusMessage = (status: DiscordStatus) => {
        switch (status) {
            case 'online':
                return "She's online!!!!";
            case 'dnd':
                return "Do not disturb";
            case 'idle':
                return "Away from keyboard, maybe getting snacks?";
            case 'offline':
                return "Might be trying to jump off a cliff to cure her depression 🏔️";
            default:
                return "Unknown status";
        }
    };

    const SoundWaveAnimation = () => (
        <svg 
            className="absolute inset-0 w-full h-full opacity-30" 
            viewBox="0 0 100 100" 
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={theme === 'dark' ? '#3B82F6' : '#6366F1'} stopOpacity="0.4" />
                    <stop offset="50%" stopColor={theme === 'dark' ? '#8B5CF6' : '#A855F7'} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={theme === 'dark' ? '#EC4899' : '#EC4899'} stopOpacity="0.2" />
                </linearGradient>
            </defs>
            
            {[...Array(3)].map((_, i) => (
                <motion.circle
                    key={i}
                    cx="50"
                    cy="50"
                    r={15 + i * 10}
                    fill="none"
                    stroke="url(#waveGradient)"
                    strokeWidth="1"
                    initial={{ r: 15, opacity: 0.6 }}
                    animate={{ 
                        r: [15 + i * 10, 40 + i * 10, 15 + i * 10],
                        opacity: [0.6, 0.1, 0.6]
                    }}
                    transition={{
                        duration: 2.5 + i * 0.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.4
                    }}
                />
            ))}
        </svg>
    );

    return (
        <>
            {/* Discord Status Icon */}
            <motion.div
                className={`fixed top-80 right-6 cursor-pointer w-16 h-16 rounded-xl ${
                    theme === 'dark' ? 'bg-gray-800/90' : 'bg-white/90'
                } backdrop-blur-xl border ${
                    theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'
                } shadow-lg overflow-hidden z-40`}
                initial={{ opacity: 0, scale: 0.8, x: 50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPopup(!showPopup)}
            >
                <div className="relative w-full h-full">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 border-3 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <>
                            <img 
                                src={avatarUrl}
                                alt={discordData?.discord_user?.global_name || discordData?.discord_user?.username || 'Discord Avatar'}
                                className="w-full h-full rounded-xl object-cover"
                            />
                            <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-3 ${
                                theme === 'dark' ? 'border-gray-800' : 'border-white'
                            } ${statusColors[discordData?.discord_status || 'offline']}`} />
                            <SoundWaveAnimation />
                        </>
                    )}
                </div>
            </motion.div>

            {/* Status Message Popup - Under Profile Pic */}
            <AnimatePresence>
                {showPopup && discordData && (
                    <motion.div
                        className={`fixed top-96 right-6 w-80 rounded-xl p-4 ${
                            theme === 'dark' ? 'bg-gray-800/95' : 'bg-white/95'
                        } backdrop-blur-xl border ${
                            theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'
                        } shadow-xl z-50`}
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Arrow pointing up */}
                        <div className={`absolute -top-2 right-8 w-4 h-4 rotate-45 ${
                            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                        } border-l border-t ${
                            theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'
                        }`}></div>
                        
                        <div className="flex items-center gap-3 mb-3">
                            <img 
                                src={avatarUrl}
                                alt="Discord Avatar"
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex-1">
                                <p className={`font-semibold text-sm ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                    {discordData.discord_user.global_name || discordData.discord_user.username}
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${statusColors[discordData.discord_status]}`}></div>
                                    <span className={`text-xs capitalize ${
                                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                    }`}>
                                        {discordData.discord_status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <p className={`text-sm mb-4 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                            {getStatusMessage(discordData.discord_status)}
                        </p>

                        {discordData.activities.length > 0 && (
                            <div className={`mb-4 p-3 rounded-lg ${
                                theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100/70'
                            }`}>
                                <p className={`text-xs font-medium mb-1 ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                    Current Activity
                                </p>
                                <p className={`text-sm font-semibold ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                    {discordData.activities[0].name}
                                </p>
                            </div>
                        )}

                        {discordData.spotify && (
                            <div className={`mb-4 p-3 rounded-lg ${
                                theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100/70'
                            }`}>
                                <p className={`text-xs font-medium mb-1 ${
                                    theme === 'dark' ? 'text-green-400' : 'text-green-600'
                                }`}>
                                    Listening to Spotify
                                </p>
                                <p className={`text-sm font-semibold ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                    {discordData.spotify.song}
                                </p>
                                <p className={`text-xs ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                    by {discordData.spotify.artist}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <a
                                href={`https://discord.com/users/953527567808356404`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex-1 px-3 py-2 rounded-lg text-center text-sm font-semibold transition-all duration-200 ${
                                    theme === 'dark' 
                                        ? 'bg-blue-600 text-white hover:bg-blue-500' 
                                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                }`}
                            >
                                View Profile
                            </a>
                            <button
                                onClick={() => setShowPopup(false)}
                                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                    theme === 'dark' 
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

const Navigation = ({ currentPage, setCurrentPage }: { currentPage: PageType; setCurrentPage: (page: PageType) => void }) => {
    const { theme, toggleTheme } = useTheme();
    const navItems = [
        { id: 'home' as PageType, label: 'Home', icon: Home },
        { id: 'projects' as PageType, label: 'Projects', icon: Briefcase },
        { id: 'skills' as PageType, label: 'Skills', icon: Code },
    ];

    return (
        <>
            <motion.nav
                className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 ${
                    theme === 'dark' ? 'bg-gray-900/80' : 'bg-white/80'
                } backdrop-blur-xl rounded-2xl px-6 sm:px-8 py-4 shadow-2xl ${
                    theme === 'dark' ? 'border border-gray-700/30' : 'border border-gray-200/30'
                }`}
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
            >
                <div className="flex items-center space-x-2 sm:space-x-4">
                    {navItems.map((item, index) => (
                        <motion.button
                            key={item.id}
                            onClick={() => setCurrentPage(item.id)}
                            className={`relative px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 text-sm sm:text-base ${
                                currentPage === item.id
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                    : theme === 'dark' 
                                        ? 'text-gray-300 hover:text-white hover:bg-gray-800/50' 
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <item.icon size={18} />
                            <span className="hidden sm:inline">{item.label}</span>
                            {currentPage === item.id && (
                                <motion.div
                                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 -z-10"
                                    layoutId="activeTab"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </motion.button>
                    ))}
                    <motion.button
                        onClick={toggleTheme}
                        className={`p-3 rounded-xl transition-all duration-300 ${
                            theme === 'dark' 
                                ? 'text-gray-300 hover:bg-gray-800/50 hover:text-yellow-400' 
                                : 'text-gray-600 hover:bg-gray-100/50 hover:text-yellow-500'
                        }`}
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ scale: 1.1, rotate: 180 }}
                        transition={{ duration: 0.3 }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={theme}
                                initial={{ opacity: 0, rotate: -180 }}
                                animate={{ opacity: 1, rotate: 0 }}
                                exit={{ opacity: 0, rotate: 180 }}
                                transition={{ duration: 0.3 }}
                            >
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </motion.div>
                        </AnimatePresence>
                    </motion.button>
                </div>
            </motion.nav>
            <DiscordStatus currentPage={currentPage} />
        </>
    );
};

const HomePage = () => {
    const { theme } = useTheme();

    return (
        <div className={`min-h-screen flex items-center justify-center p-6 pt-32 ${
            theme === 'dark' 
                ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/20' 
                : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'
        } transition-all duration-500`}>
            			<VideoBackground theme={theme} />

<img
  src="/MillenniumEvent.png"
  alt="Anime girl"
  className="absolute top-[35vh] left-1/2 -translate-x-[180%] w-[600px] h-auto z-10"
/>



            <div className="text-center max-w-4xl">
                <motion.div
                    className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto mb-8 sm:mb-12 group"
                    initial={{ scale: 0, opacity: 0, rotate: -180 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ duration: 1, delay: 0.2, type: "spring", bounce: 0.4 }}
                    whileHover={{ scale: 1.1 }}
                >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-600 animate-spin-slow opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <img
                        src="https://avatars.githubusercontent.com/u/107134739?v=4"
                        alt="Koi Natsuko"
                        className={`relative w-full h-full rounded-full object-cover border-4 shadow-2xl z-10 ${
                            theme === 'dark' ? 'border-gray-800' : 'border-white'
                        }`}
                    />
                    <motion.div
                        className="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-border opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <motion.h1 
                        className={`text-5xl sm:text-7xl font-black mb-4 ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                        style={{ fontFamily: '"Mochiy Pop One", serif' }}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                      Koi Natsuko!
                    </motion.h1>
                    <motion.p 
                        className={`text-xl sm:text-2xl font-medium mb-3 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        코이 나츠코
                    </motion.p>
                    <motion.p 
                        className={`text-lg sm:text-xl italic mb-8 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                    >
                        (From がらなつこ)
                    </motion.p>
                </motion.div>

                <motion.div
                    className={`backdrop-blur-lg rounded-2xl p-8 mb-8 border shadow-xl ${
                        theme === 'dark' 
                            ? 'bg-gray-800/70 border-gray-700/50' 
                            : 'bg-white/70 border-gray-200/50'
                    }`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                >
                    <p className={`text-lg sm:text-xl leading-relaxed ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                        She a student who always is bored and jumps off cliffs for fun.
                        <br />
                        Always eager to dive into new knowledge, experiences and off cliffs into the ocean.
                        <br />
                        When she is not studying, you'll probably find her coding, talking to me or trying to jump off another cliff.
                    </p>
                </motion.div>

                <motion.p
                    className={`text-lg sm:text-xl font-medium italic mb-12 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4, duration: 0.8 }}
                >
                    That's all I can describe about her Ngl
                </motion.p>

                <motion.div
                    className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6, duration: 0.6 }}
                >
                    <motion.a
                        href="https://discord.gg/ily-koi"
                        className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-bold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl text-lg flex items-center gap-2"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span>DISCORD</span>
                        <ExternalLink size={20} className="group-hover:translate-x-1 transition-transform" />
                    </motion.a>
                    <motion.a
                        href="https://github.com/koimoee"
                        className={`group px-8 py-4 border-2 rounded-2xl font-bold transition-all duration-300 text-lg flex items-center gap-2 ${
                            theme === 'dark' 
                                ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-800/50' 
                                : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span>GITHUB</span>
                        <ExternalLink size={20} className="group-hover:translate-x-1 transition-transform" />
                    </motion.a>
                </motion.div>
            </div>
        </div>
    );
};

const ProjectsPage = () => {
    const { theme } = useTheme();
    const [filter, setFilter] = useState('all');
    const languages = ['all', 'TypeScript', 'JavaScript', 'Python', 'Kotlin', 'CSS', 'C++', 'Elixir', 'Markdown'];

    const filteredProjects = filter === 'all' 
        ? projectsData 
        : projectsData.filter(project => project.tech.includes(filter));

    return (
        <div className={`min-h-screen pt-32 pb-16 px-6 transition-all duration-500 ${
            theme === 'dark' 
                ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/20' 
                : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'
        }`}>
            <div className="max-w-7xl mx-auto">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className={`text-6xl font-black mb-6 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                        Her goofy Projects
                    </h1>
                    <p className={`text-xl mb-8 max-w-2xl mx-auto ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                        A collection of open source projects and contributions that showcase her luv for development :3
                    </p>
                </motion.div>

                <motion.div
                    className="flex flex-wrap justify-center gap-3 mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    {languages.map((lang, index) => (
                        <motion.button
                            key={lang}
                            onClick={() => setFilter(lang)}
                            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                                filter === lang
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                    : theme === 'dark' 
                                        ? 'bg-gray-800/70 backdrop-blur-lg text-gray-300 hover:bg-gray-700/70 border border-gray-700/50' 
                                        : 'bg-white/70 backdrop-blur-lg text-gray-600 hover:bg-gray-100 border border-gray-200/50'
                            }`}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            {lang}
                        </motion.button>
                    ))}
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {filteredProjects.map((project, i) => (
                            <motion.div
                                key={project.name}
                                className={`group backdrop-blur-xl rounded-2xl p-8 border transition-all duration-300 shadow-lg hover:shadow-2xl ${
                                    theme === 'dark' 
                                        ? 'bg-gray-800/80 border-gray-700/50 hover:border-gray-600' 
                                        : 'bg-white/80 border-gray-200/50 hover:border-gray-300'
                                }`}
                                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -50, scale: 0.9 }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                layout
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex-1">
                                        <h3 className={`text-2xl font-bold mb-2 transition-colors ${
                                            theme === 'dark' 
                                                ? 'text-white group-hover:text-blue-400' 
                                                : 'text-gray-900 group-hover:text-blue-600'
                                        }`}>
                                            {project.name}
                                        </h3>
                                        <div className="flex items-center gap-3 mb-4">
                                            {project.forked && (
                                                <span className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full border ${
                                                    theme === 'dark' 
                                                        ? 'bg-amber-900/30 text-amber-300 border-amber-700' 
                                                        : 'bg-amber-100 text-amber-700 border-amber-200'
                                                }`}>
                                                    <GitFork size={12} />
                                                    Forked
                                                </span>
                                            )}
                                            {project.stars && project.stars > 0 && (
                                                <span className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full border ${
                                                    theme === 'dark' 
                                                        ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700' 
                                                        : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                }`}>
                                                    <Star size={12} />
                                                    {project.stars}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <p className={`leading-relaxed mb-6 text-lg ${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                    {project.description}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    {project.tech.map((tech) => (
                                        <span
                                            key={tech}
                                            className={`px-3 py-1 rounded-lg text-sm font-medium ${
                                                theme === 'dark' 
                                                    ? 'bg-gradient-to-r from-gray-700 to-gray-600 text-gray-300' 
                                                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700'
                                            }`}
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>

                                <div className={`flex items-center justify-between text-sm mb-6 ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                    <span className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        {project.updated}
                                    </span>
                                    <span className="text-xs">{project.license}</span>
                                </div>

                                <motion.a
                                    href={project.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl w-full justify-center"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <span>View Project</span>
                                    <ExternalLink size={16} />
                                </motion.a>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

const SkillsPage = () => {
    const skillCategories = [
        {
            category: "Her Professional Talents",
            description: "Core life competencies that define her excellence!",
            items: [
                { 
                    name: "Procrastination", 
                    level: 99, 
                    description: "Can turn a 2-hour assignment into a 2-week anxiety marathon" 
                },
                { 
                    name: "Overthinking", 
                    level: 95, 
                    description: "Will analyze a simple 'hi' text for 5 mins" 
                },
                { 
                    name: "Caffeine Dependence", 
                    level: 69, 
                    description: "Cannot function without at least 5 mouthful spoons of raw coffee per day" 
                },
                { 
                    name: "Tab Hoarding", 
                    level: 47, 
                    description: "Currently has 47 browser tabs open and refuses to close any" 
                },
                {
                    name: "Bored"
                    , level: 69,
                    description: "thats her whole personality lol, i aint even gotta explain, if she sees this, she will be mad at me XD"
                }
                    
            ],
            color: "from-red-400 to-pink-500"
        },
        {
            category: "Social Skills",
            description: "Totally normal and not awkward at all",
            items: [
                { 
                    name: "Hobby", 
                    level: 100, 
                    description: "OH you thought sutdying or coding? NAHH she Likes to jump off cliffs for no reason at all" 
                },
                { 
                    name: "Meme Knowledge", 
                    level: 96, 
                    description: "Can communicate entirely through anime reaction gifs and emojis lmao" 
                },
                { 
                    name: "Adorable", 
                    level: 100, 
                    description: "Can never take a single complement, and always acts bored" 
                },
                           { 
                    name: "Annoying", 
                    level: 100, 
                    description: "Unitentionally annoys you, and you can't even be mad at her, bcz she is clueless about everything lol" 
                },
                {
                    name: "Crazy",
                    level: 85,  
                    description: "I tell her that i will go and meet her in a year or so, and she acts like she will be lonely, like bruh XD i mean im lonely too until we meet, sadly lmao"
                }
            ],
            color: "from-blue-400 to-purple-500"
        },
        {
            category: "Her Life Skills!",
            description: "survival capablities",
            items: [
                { 
                    name: "Mood swings", 
                    level: 50, 
                    description: "50-50 chance she will get mad at you for no reason at all or act cute asf, cant even get mad at her, she is so innocent for that XD" 
                },
                { 
                    name: "Rest Schedule?", 
                    level: 26, 
                    description: "What is a consistent bedtime? We don't know her, absolutely questionable sleeping habits, and says her ghost uses pc all night ;-;" 
                },
                { 
                    name: "Snack Discovery", 
                    level: 91, 
                    description: "Can't find the perfect midnight snack in her kitchen (want me to help?)" 
                },
                { 
                    name: "Playlist Curation", 
                    level: 99, 
                    description: "Has 26 different mood playlists and all kind of subscriptions lmao" 
                },
                              { 
                    name: "Mafia girl", 
                    level: 100, 
                    description: "Is rich af and acts like she got some kind of secret business going lmao" 
                }
            ],
            color: "from-green-400 to-teal-500"
        }
    ];

    return (
        <div className="min-h-screen pt-32 pb-16 px-6 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900/20 transition-all duration-500">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 mb-6">
                        Her Skills
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        A breakdown of her.. ahem unique professional competencies (defnitely real)
                    </p>
                    <p className="text-lg text-gray-500 dark:text-gray-400 italic mt-2">
                        these will keep on stacking the more i know about her personality, because why not lmao?
                        </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {skillCategories.map((category, index) => (
                        <motion.div
                            key={category.category}
                            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2, duration: 0.6 }}
                            whileHover={{ y: -4, scale: 1.02 }}
                        >
                            <div className="mb-8">
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">
                                    {category.category}
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-300">
                                    {category.description}
                                </p>
                            </div>

                            <div className="space-y-8">
                                {category.items.map((skill, skillIndex) => (
                                    <motion.div
                                        key={skill.name}
                                        className="space-y-4"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: (index * 0.2) + (skillIndex * 0.1) }}
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="text-xl font-bold text-gray-800 dark:text-gray-100">
                                                {skill.name}
                                            </span>
                                            <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                                                {skill.level}%
                                            </span>
                                        </div>
                                        <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                                            <motion.div
                                                className={`h-full rounded-full bg-gradient-to-r ${category.color}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${skill.level}%` }}
                                                transition={{ 
                                                    duration: 1.5, 
                                                    delay: (index * 0.2) + (skillIndex * 0.1) + 0.5,
                                                    ease: "easeOut"
                                                }}
                                            />
                                        </div>
                                        <p className="text-base text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                                            {skill.description}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const KoiPortfolio = () => {
    const [currentPage, setCurrentPage] = useState<PageType>('home');
    const { theme } = useTheme();

    useProtection();

    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Mochiy+Pop+One&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        document.body.style.fontFamily = '"Mochiy Pop One", serif';

        return () => {
            document.head.removeChild(link);
            document.body.style.fontFamily = '';
        };
    }, []);

    const pageVariants = {
        initial: { opacity: 0, x: -50 },
        in: { opacity: 1, x: 0 },
        out: { opacity: 0, x: 50 }
    };

    const pageTransition = {
        type: "tween",
        ease: "easeInOut",
        duration: 0.4
    };

    const renderCurrentPage = () => {
        switch (currentPage) {
            case 'home':
                return <HomePage />;
            case 'projects':
                return <ProjectsPage />;
            case 'skills':
                return <SkillsPage />;
            default:
                return <HomePage />;
        }
    };

    return (
        <div className={`min-h-screen transition-all duration-500 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
            <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
            
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentPage}
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                >
                    {renderCurrentPage()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default KoiPortfolio;