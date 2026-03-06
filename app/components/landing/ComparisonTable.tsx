"use client";

import { motion } from "framer-motion";
import { GradientHeading } from "./GradientHeading";

export const ComparisonTable = ({ theme }: { theme: "dark" | "light" }) => {
    return (
        <section className="py-24 px-4 sm:px-8">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <p className={`text-xs font-mono uppercase tracking-[0.2em] mb-3
                        ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`}>
                        how we compare
                    </p>
                    <GradientHeading
                        text="Unmatched Security"
                        theme={theme}
                        className="text-3xl sm:text-4xl font-black"
                    />
                    <h1 className="text-base sm:text-lg font-bold opacity-60 mt-2">Built for speed, efficiency, and zero compromises</h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`rounded-2xl overflow-hidden border ${theme === "dark" ? "border-white/10" : "border-black/10"}`}
                >
                    <table className="w-full text-sm">
                        <thead>
                            <tr className={theme === "dark" ? "bg-white/5" : "bg-black/5"}>
                                <th className="text-left p-4 font-medium opacity-50" />
                                <th className={`p-4 font-bold ${theme === "dark" ? "text-[#5865F2]" : "text-[#5865F2]"}`}>Aero</th>
                                <th className="p-4 font-medium opacity-40">Typical Free Bot</th>
                                <th className="p-4 font-medium opacity-40">Premium Bots</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${theme === "dark" ? "divide-white/5" : "divide-black/5"}`}>
                            {[
                                ["Price", "Free Forever", "Free (with limits)", "$5-$15/mo"],
                                ["Auto-Restore", "Full (Roles/Channels)", "None", "Partial"],
                                ["Dashboard", "Included", "Hardly any", "Included"],
                                ["Anti-Permissions Abuse", "Yes", "No", "Yes"],
                                ["Spam Protection", "Advanced (4 types)", "Basic", "Advanced"],
                                ["Open Source", "Planned", "Closed", "Closed"],
                            ].map(([label, cw, we, lv]) => (
                                <tr key={label} className={`transition-colors ${theme === "dark" ? "hover:bg-white/[0.03]" : "hover:bg-black/[0.02]"}`}>
                                    <td className="p-4 font-medium">{label}</td>
                                    <td className={`p-4 text-center font-semibold ${theme === "dark" ? "text-[#5865F2]" : "text-[#5865F2]"}`}>{cw}</td>
                                    <td className="p-4 text-center opacity-50">{we}</td>
                                    <td className="p-4 text-center opacity-50">{lv}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>
            </div>
        </section>
    );
}
