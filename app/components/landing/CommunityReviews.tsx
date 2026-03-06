"use client";

import { motion } from "framer-motion";
import { Star, ShieldCheck } from "lucide-react";
import Image from "next/image";

export const CommunityReviews = ({ theme }: { theme: "dark" | "light" }) => {
    const isDark = theme === "dark";

    const textColor = isDark ? "text-white" : "text-black";
    const mutedText = isDark ? "text-white/60" : "text-black/60";

    return (
        <section className="py-24 px-4 sm:px-8 relative w-full flex justify-center overflow-hidden">
            <div className={`absolute inset-0 pointer-events-none ${isDark ? "opacity-10" : "opacity-[0.03]"}`}
                style={{
                    backgroundImage: `linear-gradient(${isDark ? 'white' : 'black'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? 'white' : 'black'} 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                    maskImage: 'radial-gradient(ellipse at center, black 10%, transparent 80%)',
                    WebkitMaskImage: 'radial-gradient(ellipse at center, black 10%, transparent 80%)'
                }}
            />

            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center relative z-10">

                {/* ════ Left: Text Content ════ */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col justify-center max-w-lg"
                >
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] mb-6">
                        <span className={theme === "dark" ? "text-white" : "text-black"}>Trusted by</span><br />
                        <span className="text-[#5865F2] drop-shadow-sm">communities</span>{" "}
                        <span className={theme === "dark" ? "text-white" : "text-black"}>worldwide</span>
                    </h2>

                    <p className={`text-base sm:text-lg leading-relaxed mb-10 ${mutedText}`}>
                        Aero currently protects over 97 servers, securing thousands of members from nuke attempts, spam raids, and permission abuse. We take great pride in our uptime and reliability.
                    </p>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 bg-[#5865F2] text-white px-3 py-1.5 rounded-sm">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} size={18} className="fill-white text-white" />
                            ))}
                        </div>
                        <span className={`font-bold text-sm sm:text-base ${textColor}`}>
                            Highly trusted platform
                        </span>
                    </div>
                </motion.div>

                {/* ════ Right: Cards ════ */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative flex flex-col sm:block lg:pl-10 items-center justify-center lg:justify-end gap-6 sm:gap-0"
                >
                    {/* Main Review Card */}
                    <div className={`rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-[420px] relative z-10 border transform rotate-1 hover:rotate-0 transition-transform duration-300 ${isDark ? "bg-[#0f0f12] border-white/10" : "bg-white border-black/5"}`}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${isDark ? "bg-white/10 text-white" : "bg-[#1e1e1e] text-white"}`}>
                                LX
                            </div>
                            <div>
                                <h4 className={`font-bold text-base ${isDark ? "text-white" : "text-black"}`}>lex</h4>
                                <p className={`text-xs ${isDark ? "text-white/50" : "text-black/50"}`}>Server Owner</p>
                            </div>
                        </div>

                        <div className="flex gap-1 mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} size={16} className="fill-[#5865F2] text-[#5865F2]" />
                            ))}
                        </div>

                        <h5 className={`font-bold text-lg mb-2 ${isDark ? "text-white" : "text-black"}`}>Saves so much time</h5>
                        <p className={`text-sm leading-relaxed ${isDark ? "text-white/70" : "text-black/70"}`}>
                            The auto-restore feature is incredible. When a rogue admin tried to delete all our roles, Aero instantly banned them and restored everything before anyone noticed.
                        </p>

                        {/* Decoration */}
                        <div className="absolute -right-6 -bottom-6 sm:-right-10 sm:-bottom-8 w-24 h-24 sm:w-28 sm:h-28 bg-[#5865F2] rounded-3xl rotate-12 flex items-center justify-center shadow-[0_0_30px_rgba(88,101,242,0.4)] z-20 overflow-hidden transform hover:scale-105 hover:rotate-6 transition-all duration-300">
                            <ShieldCheck size={50} className="text-white" />
                        </div>
                    </div>

                    {/* Secondary Metrics Card */}
                    <div className={`sm:absolute sm:-left-16 sm:-bottom-8 rounded-2xl p-5 shadow-2xl w-full max-w-[320px] z-30 transform sm:-rotate-1 sm:hover:rotate-0 transition-transform duration-300 border
                        ${isDark ? "bg-[#0f0f12] border-white/10" : "bg-white border-black/10"}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center p-2 shrink-0 overflow-hidden relative border border-[#5865F2]/20 shadow-inner">
                                <Image src="/KoiLogo.png" alt="Aero Logo" fill className="object-contain p-2" />
                            </div>

                            <div className="flex flex-col">
                                <h4 className={`font-bold text-lg ${isDark ? "text-white" : "text-black"}`}>Aero</h4>
                                <p className={`text-xs mt-0.5 ${isDark ? "text-white/60" : "text-black/60"}`}>Uptime - 99.9%</p>

                                <div className="flex gap-1 mt-1.5 mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} size={14} className="fill-[#00b67a] text-[#00b67a]" />
                                    ))}
                                </div>

                                <div className="flex items-center gap-1.5 bg-[#00b67a]/15 text-[#00b67a] px-2 py-1 rounded text-[10px] font-bold tracking-wide w-fit">
                                    <ShieldCheck size={12} />
                                    TESTED & VERIFIED
                                </div>
                            </div>
                        </div>
                    </div>

                </motion.div>
            </div>
        </section>
    );
};
