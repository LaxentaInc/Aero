"use client";

import { motion } from "framer-motion";
import { Coffee, Star, ShieldCheck } from "lucide-react";

export const PlannedOpenSource = ({ theme }: { theme: "dark" | "light" }) => {
    const isDark = theme === "dark";

    const bgContainer = isDark ? "bg-[#0f0f11]" : "bg-slate-50";
    const bgHeader = isDark ? "bg-[#161618]" : "bg-slate-100";
    const bgFooter = isDark ? "bg-[#161618]" : "bg-slate-100";
    const borderColor = isDark ? "border-white/10" : "border-black/10";
    const mutedText = isDark ? "text-white/60" : "text-black/60";
    const codeMuted = isDark ? "text-white/40" : "text-black/40";

    const highlight = {
        keyword: isDark ? "text-[#f92672]" : "text-[#d73a49]",
        type: isDark ? "text-[#66d9ef]" : "text-[#005cc5]",
        string: isDark ? "text-[#a6e22e]" : "text-[#22863a]",
        variable: isDark ? "text-[#fd971f]" : "text-[#e36209]",
        comment: isDark ? "text-[#75715e]" : "text-[#6a737d]",
        text: isDark ? "text-[#f8f8f2]" : "text-[#24292e]",
    };

    return (
        <section className="py-24 px-4 sm:px-8 relative w-full flex justify-center overflow-hidden">
            {/* Background pattern */}
            <div className={`absolute inset-0 pointer-events-none ${isDark ? "opacity-10" : "opacity-[0.03]"}`}
                style={{
                    backgroundImage: `linear-gradient(${isDark ? 'white' : 'black'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? 'white' : 'black'} 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                    maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 70%)',
                    WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 70%)'
                }}
            />

            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center relative z-10">

                {/* ════ Left: Code Window ════ */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className={`rounded-xl overflow-hidden shadow-2xl border flex flex-col font-mono ${bgContainer} ${borderColor}`}
                >
                    {/* Window Header */}
                    <div className={`px-4 py-3 flex items-center justify-between border-b ${bgHeader} ${borderColor}`}>
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                        </div>
                        <div className={`text-xs ${codeMuted}`}>
                            Aero / Security
                        </div>
                    </div>

                    {/* Code Content */}
                    <div className={`p-6 sm:p-8 space-y-4 ${highlight.text}`}>
                        <div className="leading-loose whitespace-pre font-mono text-sm">
                            <span className={highlight.keyword}>export class</span> <span className={highlight.type}>AntiNukeManager</span> {"{\n"}
                            {"\n"}
                            {"    "}<span className={highlight.keyword}>async</span> <span className={highlight.type}>handleAction</span>(event) {"{\n"}
                            {"        "}<span className={`${highlight.comment} italic`}>// Detect mass destruction</span>{"\n"}
                            {"        "}<span className={highlight.keyword}>if</span> (event.count {'>'} <span className={highlight.variable}>threshold</span>) {"{\n"}
                            {"            "}<span className={highlight.keyword}>await</span> <span className={highlight.type}>this</span>.ban(event.executor);{"\n"}
                            {"            "}<span className={highlight.keyword}>await</span> <span className={highlight.type}>this</span>.restore(event.data);{"\n"}
                            {"        }\n"}
                            {"    }\n"}
                            {"}\n"}
                        </div>

                        {/* Star Button inside code block */}
                        <div className="flex justify-end pt-2">
                            <div className={`inline-flex items-center gap-3 px-3 py-1.5 rounded-md text-xs font-semibold border
                                ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-black/5 border-black/10 text-black"}`}>
                                <Star size={14} className="text-[#ffbd2e] fill-[#ffbd2e]" />
                                <span>Secured</span>
                                <span className={`w-[1px] h-3 ${isDark ? "bg-white/20" : "bg-black/20"}`} />
                                <span>97+</span>
                            </div>
                        </div>
                    </div>

                    {/* Window Footer */}
                    <div className={`px-4 py-3 border-t flex items-center gap-6 text-xs font-medium ${bgFooter} ${borderColor} ${codeMuted}`}>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#3178c6]" />
                            TypeScript
                        </div>
                        <div className="flex items-center gap-1.5">
                            <ShieldCheck size={12} />
                            Zero trust architecture
                        </div>
                    </div>
                </motion.div>

                {/* ════ Right: Content ════ */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col justify-center"
                >
                    <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.1] mb-6">
                        <span className={isDark ? "text-white" : "text-black"}>Support</span><br />
                        <span className="text-[#5865F2] drop-shadow-sm">Development</span>
                    </h2>

                    <p className={`text-base leading-relaxed ${mutedText}`}>
                        Aero is provided entirely for free. We don't lock crucial security features behind a paywall because we believe every community deserves proper protection against raiders and nukers.
                    </p>

                    <div className={`h-[1px] w-full ${isDark ? "bg-white/10" : "bg-black/10"} my-8 shadow-sm`} />

                    <p className={`text-sm sm:text-base mb-6 font-medium ${mutedText}`}>
                        If Aero has saved your server, consider supporting the hosting costs:
                    </p>

                    <div>
                        <a
                            href="https://discord.gg/QYwhay7r2V"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#5865F2] to-[#4752c4] hover:shadow-[0_0_20px_rgba(88,101,242,0.4)] transition-all duration-300 hover:-translate-y-0.5"
                        >
                            <Coffee size={18} className="fill-white" />
                            Support Server
                        </a>
                    </div>

                    <p className={`mt-6 text-sm italic opacity-70 ${mutedText}`}>
                        Your support directly helps pay for server hosting, domain names, and database costs to keep Aero fast and reliable.
                    </p>
                </motion.div>
            </div>
        </section>
    );
};
