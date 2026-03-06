"use client";

import { useInView } from "react-intersection-observer";
import { Zap, MessageCircle } from "lucide-react";

export const BottomCTA = ({ theme }: { theme: "dark" | "light" }) => {
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

    return (
        <section
            ref={ref}
            className={`py-24 px-6 relative overflow-hidden
                ${theme === "dark" ? "bg-[#050508]" : "bg-gray-50/50"}`}
        >
            {/* background accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#5865F2]/[0.04] blur-[100px] pointer-events-none" />

            <div
                className="relative z-10 max-w-2xl mx-auto text-center"
                style={{
                    opacity: inView ? 1 : 0,
                    transform: inView ? "translateY(0)" : "translateY(20px)",
                    transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
                }}
            >
                <h2 className={`text-3xl sm:text-5xl font-black tracking-tight mb-4
                    ${theme === "dark" ? "text-white" : "text-black"}`}>
                    Ready to secure your server?
                </h2>
                <p className={`text-base sm:text-lg mb-10 max-w-lg mx-auto
                    ${theme === "dark" ? "text-white/40" : "text-black/40"}`}>
                    Add Aero in seconds. All 6 modules activate automatically with smart defaults. Configure anything from the dashboard.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4">
                    <a
                        href="https://discord.com/oauth2/authorize?client_id=1107155830274523136&permissions=8&scope=bot%20applications.commands"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-sm tracking-wide bg-[#5865F2] text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(88,101,242,0.3)]"
                    >
                        <Zap size={18} />
                        Invite Aero Now
                    </a>

                    <a
                        href="https://discord.gg/QYwhay7r2V"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 px-6 py-4 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300 hover:-translate-y-0.5
                            ${theme === "dark"
                                ? "border border-white/15 text-white/60 hover:border-white/30 hover:bg-white/5"
                                : "border border-black/15 text-black/50 hover:border-black/30 hover:bg-black/5"}`}
                    >
                        <MessageCircle size={16} />
                        Join Our Discord
                    </a>
                </div>
            </div>
        </section>
    );
};
