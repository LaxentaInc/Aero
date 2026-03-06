"use client";

import { useInView } from "react-intersection-observer";
import { Server, Shield, Cpu, Globe } from "lucide-react";

const stats = [
    { icon: Server, label: "Servers Protected", value: "97+", color: "#5865F2" },
    { icon: Shield, label: "Security Modules", value: "6", color: "#10B981" },
    { icon: Cpu, label: "Uptime", value: "99.9%", color: "#F59E0B" },
    { icon: Globe, label: "Real-time Monitoring", value: "24/7", color: "#EC4899" },
];

export const StatsSection = ({ theme }: { theme: "dark" | "light" }) => {
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

    return (
        <section
            ref={ref}
            className={`py-20 px-6 ${theme === "dark" ? "bg-[#050508]" : "bg-gray-50/50"}`}
        >
            <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <div
                            key={stat.label}
                            className="text-center"
                            style={{
                                opacity: inView ? 1 : 0,
                                transform: inView ? "translateY(0)" : "translateY(20px)",
                                transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s`
                            }}
                        >
                            <div
                                className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                                style={{ backgroundColor: `${stat.color}15` }}
                            >
                                <stat.icon size={22} style={{ color: stat.color }} />
                            </div>
                            <p className={`text-3xl sm:text-4xl font-black tracking-tight mb-1
                                ${theme === "dark" ? "text-white" : "text-black"}`}>
                                {stat.value}
                            </p>
                            <p className={`text-xs font-mono uppercase tracking-widest
                                ${theme === "dark" ? "text-white/30" : "text-black/30"}`}>
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
