"use client";

import { motion } from "framer-motion";
import { Shield, ShieldAlert, ShieldCheck, Bot, Clock, MessageSquareWarning } from "lucide-react";
import { GradientHeading } from "./GradientHeading";

const features = [
    {
        id: "01",
        icon: ShieldAlert,
        title: "AntiNuke",
        desc: "Detects mass channel/role/emoji/webhook destruction and auto-restores everything. Separate thresholds for bots vs humans.",
    },
    {
        id: "02",
        icon: ShieldCheck,
        title: "Anti-Permission Abuse",
        desc: "Monitors role creation, updates, and dangerous permission assignments. Automatically neutralizes rogue roles and punishes abusers.",
    },
    {
        id: "03",
        icon: Shield,
        title: "Anti Mass Action",
        desc: "Catches mass kick/ban attacks in real-time. Configurable thresholds for bot and user actions with instant punishment.",
    },
    {
        id: "04",
        icon: MessageSquareWarning,
        title: "AntiSpam",
        desc: "Detects message floods, link spam, image spam, and webhook spam. Strike-based system with auto-escalating punishments.",
    },
    {
        id: "05",
        icon: Clock,
        title: "Account Age Protection",
        desc: "Filters new accounts below a configurable age threshold. Supports kick, ban, timeout, or notification-only modes.",
    },
    {
        id: "06",
        icon: Bot,
        title: "Bot Protection",
        desc: "Automatically kicks unauthorized bots and punishes whoever added them. Whitelist trusted bots to avoid false positives.",
    },
];

export const FeaturesSection = ({ theme }: { theme: "dark" | "light" }) => {
    return (
        <section className="py-32 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    className="mb-24"
                >
                    <p className={`text-xs font-mono uppercase tracking-[0.2em] mb-4 ml-1
                        ${theme === "dark" ? "text-[#5865F2]" : "text-[#5865F2]"}`}>
                        protection_modules
                    </p>
                    <GradientHeading
                        text="6 Layers of Security"
                        theme={theme}
                        className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight"
                    />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
                    {features.map((f, i) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            className="group relative"
                        >
                            {/* "tech spec" top line */}
                            <div className={`w-full h-[1px] mb-6 transition-all duration-500 origin-left
                                ${theme === "dark"
                                    ? "bg-white/10 group-hover:bg-[#5865F2]/50 group-hover:w-full"
                                    : "bg-black/10 group-hover:bg-[#5865F2]/50 group-hover:w-full"}`}
                            />

                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <span className={`text-4xl font-mono font-light tracking-tighter opacity-20 group-hover:opacity-40 transition-opacity duration-300
                                        ${theme === "dark" ? "text-white" : "text-black"}`}>
                                        {f.id}
                                    </span>
                                    <f.icon
                                        size={28}
                                        strokeWidth={1.5}
                                        className={`transition-colors duration-300
                                            ${theme === "dark"
                                                ? "text-white/40 group-hover:text-[#5865F2]"
                                                : "text-black/40 group-hover:text-[#5865F2]"}`}
                                    />
                                </div>

                                <div>
                                    <h3 className={`text-xl font-bold mb-3 tracking-wide group-hover:-translate-y-0.5 transition-transform duration-300
                                        ${theme === "dark" ? "text-white" : "text-black"}`}>
                                        {f.title}
                                    </h3>
                                    <p className={`text-sm leading-relaxed max-w-[90%]
                                        ${theme === "dark" ? "text-white/50" : "text-black/60"}`}>
                                        {f.desc}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <p className="text-center mt-32">
                <span className={`${theme === "dark" ? "text-white/70" : "text-black/70"} block text-2xl font-bold`}>
                    Seems too good to be true?
                </span>
                <span className={`${theme === "dark" ? "text-[#5865F2]/80" : "text-[#5865F2]/80"} block mt-2 text-lg font-semibold italic`}>
                    It is :D That's why I built it
                </span>
            </p>
        </section>
    );
}
