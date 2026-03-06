"use client";

import Image from "next/image";
import Link from "next/link";
import { Zap, LayoutDashboard, MessageCircle, Shield, Server, Bot } from "lucide-react";
import { Typewriter } from "react-simple-typewriter";
import { ScrollArrow } from "./ScrollArrow";

export const HeroSection = ({ theme }: { theme: "dark" | "light" }) => {
    return (
        <section className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
            {/* video bg — no blur */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className={`w-full h-full object-cover ${theme === "dark" ? "opacity-40" : "opacity-90"}`}
                >
                    <source src="/videos/myCutekoiiii.webm" type="video/webm" />
                </video>
                {/* subtle gradient fade at edges */}
                <div className={`absolute inset-0 ${theme === "dark"
                    ? "bg-gradient-to-b from-black/60 via-black/20 to-black"
                    : "bg-gradient-to-b from-white/30 via-transparent to-white/80"}`}
                />
            </div>

            <div className="relative z-10 text-center flex flex-col items-center space-y-8 max-w-5xl mt-12">
                {/* logo */}
                <Image
                    src="/KoiLogo.png"
                    alt="Aero"
                    width={400}
                    height={400}
                    className="w-[180px] sm:w-[240px] md:w-[280px] h-auto object-contain drop-shadow-2xl brightness-110"
                    priority
                />

                <h2 className={`text-sm sm:text-base font-mono font-medium tracking-widest uppercase opacity-60 mb-1
                    ${theme === "dark" ? "text-white" : "text-black"}`}>
                    Discord Security <span className="text-[#5865F2]">&</span> Anti-Raid Protection
                </h2>

                {/* typewriter */}
                <div className={`text-sm sm:text-lg md:text-xl font-mono h-8 ${theme === "dark" ? "text-white/50" : "text-black/50"}`}>
                    <Typewriter
                        words={[
                            "< 6 security modules, zero compromises />",
                            "< antinuke · antispam · anti-permission abuse />",
                            "< auto-restore channels, roles & permissions />",
                            "< configurable per-guild via web dashboard />",
                            "< protecting 97+ servers and counting />",
                        ]}
                        loop={0}
                        cursor
                        cursorStyle="_"
                        typeSpeed={45}
                        deleteSpeed={25}
                        delaySpeed={2200}
                    />
                </div>

                {/* cta row */}
                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                    {/* invite */}
                    <a
                        href="https://discord.com/oauth2/authorize?client_id=1107155830274523136&permissions=8&scope=bot%20applications.commands"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group inline-flex items-center gap-3 px-7 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 hover:-translate-y-0.5
                            ${theme === "dark"
                                ? "bg-white text-black hover:shadow-[0_8px_30px_rgba(255,255,255,0.15)]"
                                : "bg-black text-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]"}`}
                    >
                        <Zap size={18} />
                        Invite Aero
                        <span className={`text-xs px-2 py-0.5 rounded-md ml-1
                            ${theme === "dark" ? "bg-black/10 text-black/60" : "bg-white/10 text-white/60"}`}>
                            Free
                        </span>
                    </a>

                    {/* dashboard */}
                    <Link
                        href="/dashboard"
                        className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300 hover:-translate-y-0.5
                            ${theme === "dark"
                                ? "border border-white/15 text-white/70 hover:border-white/30 hover:bg-white/5 hover:text-white"
                                : "border border-black/15 text-black/60 hover:border-black/30 hover:bg-black/5 hover:text-black"}`}
                    >
                        <LayoutDashboard size={16} />
                        Dashboard
                    </Link>

                    {/* discord support */}
                    <a
                        href="https://discord.gg/QYwhay7r2V"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300 hover:-translate-y-0.5
                            ${theme === "dark"
                                ? "border border-white/15 text-white/70 hover:border-[#5865F2]/50 hover:bg-[#5865F2]/10 hover:text-[#5865F2]"
                                : "border border-black/15 text-black/60 hover:border-[#5865F2]/50 hover:bg-[#5865F2]/5 hover:text-[#5865F2]"}`}
                    >
                        <MessageCircle size={16} />
                        Discord
                    </a>
                </div>

                {/* platform tags */}
                <div className={`flex items-center gap-3 text-xs font-mono pt-2
                    ${theme === "dark" ? "text-white/30" : "text-black/30"}`}
                >
                    <span className="flex items-center gap-1.5"><Shield size={12} /> 6 Modules</span>
                    <span>·</span>
                    <span className="flex items-center gap-1.5"><Server size={12} /> 97+ Servers</span>
                    <span>·</span>
                    <span className="flex items-center gap-1.5"><Bot size={12} /> Real-time Protection</span>
                </div>
            </div>

            <ScrollArrow theme={theme} />
        </section>
    );
};
