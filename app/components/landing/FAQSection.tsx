"use client";

import { useState } from "react";
import { useInView } from "react-intersection-observer";
import { ChevronDown } from "lucide-react";

const faqs = [
    {
        q: "How do I set up Aero?",
        a: "Just invite Aero to your server — it automatically creates log channels, enables all 6 protection modules with sensible defaults, and starts protecting immediately. No manual configuration needed."
    },
    {
        q: "Can I configure modules per-server?",
        a: "Yes. Every module has its own per-guild configuration stored in MongoDB. You can toggle modules, adjust thresholds, manage trusted users/roles, and change punishment types through the web dashboard."
    },
    {
        q: "What happens during a nuke attack?",
        a: "AntiNuke tracks destructive actions (channel deletes, role deletes, emoji deletes, webhook spam) and instantly punishes the attacker. It then auto-restores all deleted channels, roles, and permissions from its last backup."
    },
    {
        q: "Does Aero work with other bots?",
        a: "Yes. Bot Protection has a whitelist system — just add your trusted bots so they don't get auto-kicked. Aero also ignores its own actions and recognizes server owner actions."
    },
    {
        q: "What's the difference between the bot and user thresholds?",
        a: "Bots can execute destructive actions much faster than humans, so they have stricter thresholds (e.g., 2 channel deletes vs 5 for users). This prevents false positives on moderators while catching bot attacks instantly."
    },
    {
        q: "Is the dashboard free?",
        a: "Yes, everything is free. The dashboard uses Discord OAuth to authenticate you, then shows your servers and lets you configure each module's settings."
    }
];

export const FAQSection = ({ theme }: { theme: "dark" | "light" }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

    return (
        <section
            ref={ref}
            className={`py-24 px-6 ${theme === "dark" ? "bg-black" : "bg-white"}`}
        >
            <div className="max-w-3xl mx-auto">
                {/* section header */}
                <div className="text-center mb-16">
                    <p className={`text-xs font-mono font-semibold tracking-[0.3em] uppercase mb-4 text-[#7289da]`}>
                        FAQ
                    </p>
                    <h2 className={`text-3xl sm:text-4xl font-black tracking-tight
                        ${theme === "dark" ? "text-white" : "text-black"}`}>
                        Common Questions
                    </h2>
                </div>

                {/* faq items */}
                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            className={`rounded-xl border overflow-hidden transition-all duration-300
                                ${theme === "dark"
                                    ? "border-white/[0.06] bg-white/[0.02]"
                                    : "border-black/[0.06] bg-black/[0.01]"}`}
                            style={{
                                opacity: inView ? 1 : 0,
                                transform: inView ? "translateY(0)" : "translateY(10px)",
                                transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.07}s`
                            }}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className={`w-full px-5 py-4 flex items-center justify-between text-left transition-colors
                                    ${theme === "dark" ? "hover:bg-white/[0.02]" : "hover:bg-black/[0.01]"}`}
                            >
                                <span className={`font-semibold text-sm sm:text-base pr-4
                                    ${theme === "dark" ? "text-white/80" : "text-black/80"}`}>
                                    {faq.q}
                                </span>
                                <ChevronDown
                                    size={18}
                                    className={`shrink-0 transition-transform duration-300
                                        ${openIndex === i ? "rotate-180" : ""}
                                        ${theme === "dark" ? "text-white/50" : "text-black/50"}`}
                                />
                            </button>
                            <div className={`overflow-hidden transition-all duration-300
                                ${openIndex === i ? "max-h-60 pb-4" : "max-h-0"}`}>
                                <p className={`px-5 text-sm leading-relaxed
                                    ${theme === "dark" ? "text-white/60" : "text-black/60"}`}>
                                    {faq.a}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
