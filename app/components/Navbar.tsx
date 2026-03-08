 "use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useTheme } from "@/app/contexts/ThemeContext";
import { Home, LayoutDashboard, MessageCircle, Moon, Sun, Shield } from "lucide-react";

export const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const pathname = usePathname();
    const isDark = theme === "dark";
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // auto-hide on scroll down, show on scroll up
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY < lastScrollY || currentScrollY < 50) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
            setLastScrollY(currentScrollY);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    const navLinks = [
        { name: "Home", href: "/", icon: Home },
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ];

    return (
        <>
            {/* desktop: vertical side dock */}
            <motion.div
                className="hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 z-50 flex-col gap-4"
                initial={{ x: -100, opacity: 0 }}
                animate={{
                    x: isVisible || isHovered ? 0 : -100,
                    opacity: isVisible || isHovered ? 1 : 0
                }}
                
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className={`p-2 rounded-2xl border backdrop-blur-xl shadow-2xl flex flex-col gap-2
                    ${isDark
                        ? "bg-[#0a0a0a]/80 border-white/10"
                        : "bg-white/80 border-black/10"}`}
                >
                    {/* logo / home */}
                    <Link
                        href="/"
                        className={`p-2 rounded-xl transition-all duration-300 group relative
                            ${pathname === "/"
                                ? (isDark ? "bg-white/10 text-white" : "bg-black/5 text-black")
                                : (isDark ? "text-white/40 hover:text-white hover:bg-white/5" : "text-black/40 hover:text-black hover:bg-black/5")}`}
                    >
                        <Shield size={22} className="text-[#5865F2]" />
                        <span className={`absolute left-14 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                            ${isDark ? "bg-white text-black" : "bg-black text-white"}`}>
                            Home
                        </span>
                    </Link>

                    <div className={`h-[1px] w-full ${isDark ? "bg-white/10" : "bg-black/10"}`} />

                    {/* nav links */}
                    {navLinks.slice(1).map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`p-2.5 rounded-xl transition-all duration-300 group relative
                                    ${isActive
                                        ? (isDark ? "bg-white/10 text-white" : "bg-black/5 text-black")
                                        : (isDark ? "text-white/40 hover:text-white hover:bg-white/5" : "text-black/40 hover:text-black hover:bg-black/5")}`}
                            >
                                <link.icon size={20} />
                                <span className={`absolute left-14 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                                    ${isDark ? "bg-white text-black" : "bg-black text-white"}`}>
                                    {link.name}
                                </span>
                            </Link>
                        );
                    })}

                    <div className={`h-[1px] w-full ${isDark ? "bg-white/10" : "bg-black/10"}`} />

                    {/* invite bot */}
                    <a
                        href="https://discord.com/oauth2/authorize?client_id=1107155830274523136&permissions=8&scope=bot%20applications.commands"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2.5 rounded-xl transition-all duration-300 group relative
                            ${isDark ? "text-white/40 hover:text-[#5865F2] hover:bg-[#5865F2]/10" : "text-black/40 hover:text-[#5865F2] hover:bg-[#5865F2]/10"}`}
                    >
                        <Shield size={20} />
                        <span className={`absolute left-14 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                            ${isDark ? "bg-white text-black" : "bg-black text-white"}`}>
                            Invite Bot
                        </span>
                    </a>

                    {/* discord support */}
                    <a
                        href="https://discord.gg/QYwhay7r2V"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2.5 rounded-xl transition-all duration-300 group relative
                            ${isDark ? "text-white/40 hover:text-[#5865F2] hover:bg-[#5865F2]/10" : "text-black/40 hover:text-[#5865F2] hover:bg-[#5865F2]/10"}`}
                    >
                        <MessageCircle size={20} />
                        <span className={`absolute left-14 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                            ${isDark ? "bg-white text-black" : "bg-black text-white"}`}>
                            Discord
                        </span>
                    </a>

                    {/* theme toggle */}
                    <button
                        onClick={toggleTheme}
                        className={`p-2.5 rounded-xl transition-all duration-300 group relative
                            ${isDark ? "text-yellow-400 hover:bg-yellow-400/10" : "text-slate-600 hover:bg-slate-100"}`}
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        <span className={`absolute left-14 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                            ${isDark ? "bg-white text-black" : "bg-black text-white"}`}>
                            Toggle Theme
                        </span>
                    </button>
                </div>
            </motion.div>

            {/* mobile: floating bottom pill */}
            <motion.div
                className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-50"
                initial={{ y: 100, opacity: 0 }}
                animate={{
                    y: isVisible ? 0 : 100,
                    opacity: isVisible ? 1 : 0,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
            >
                <div className={`flex items-center gap-1 px-3 py-2 rounded-full border shadow-2xl backdrop-blur-xl
                    ${isDark
                        ? "bg-[#0a0a0a]/85 border-white/10 shadow-black/60"
                        : "bg-white/85 border-black/10 shadow-black/10"}`}
                >
                    {/* home */}
                    <Link
                        href="/"
                        className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 active:scale-90
                            ${pathname === "/"
                                ? (isDark ? "bg-white/10 text-white" : "bg-black/5 text-black")
                                : (isDark ? "text-white/40" : "text-black/40")}`}
                    >
                        <Home size={20} />
                    </Link>

                    <div className={`w-[1px] h-5 mx-1 ${isDark ? "bg-white/10" : "bg-black/10"}`} />

                    {/* dashboard */}
                    <Link
                        href="/dashboard"
                        className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 active:scale-90
                            ${pathname === "/dashboard"
                                ? (isDark ? "bg-white/10 text-white" : "bg-black/5 text-black")
                                : (isDark ? "text-white/40" : "text-black/40")}`}
                    >
                        <LayoutDashboard size={20} />
                    </Link>

                    <div className={`w-[1px] h-5 mx-1 ${isDark ? "bg-white/10" : "bg-black/10"}`} />

                    {/* discord */}
                    <a
                        href="https://discord.gg/QYwhay7r2V"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 active:scale-90
                            ${isDark ? "text-white/40" : "text-black/40"}`}
                    >
                        <MessageCircle size={20} />
                    </a>

                    {/* theme toggle */}
                    <button
                        onClick={toggleTheme}
                        className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 active:scale-90
                            ${isDark ? "text-yellow-400" : "text-slate-500"}`}
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </motion.div>
        </>
    );
};
