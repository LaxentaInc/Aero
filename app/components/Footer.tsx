"use client";

import Link from "next/link";
import { useTheme } from "@/app/contexts/ThemeContext";

export const Footer = ({ theme }: { theme: "dark" | "light" }) => {
    return (
        <footer className={`border-t py-12 px-6 ${theme === "dark" ? "border-white/5 bg-black" : "border-black/5 bg-white"}`}>
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* left — brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#5865F2] flex items-center justify-center">
                            <span className="text-white font-black text-sm">A</span>
                        </div>
                        <span className={`font-bold text-lg ${theme === "dark" ? "text-white" : "text-black"}`}>
                            Aero
                        </span>
                    </div>

                    {/* center — links */}
                    <div className={`flex items-center gap-6 text-sm font-medium ${theme === "dark" ? "text-white/40" : "text-black/40"}`}>
                        <Link href="/privacy" className="hover:opacity-80 transition-opacity">Privacy</Link>
                        <Link href="/terms" className="hover:opacity-80 transition-opacity">Terms</Link>
                        <a
                            href="https://discord.gg/QYwhay7r2V"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:opacity-80 transition-opacity"
                        >
                            Discord
                        </a>
                        <Link href="/dashboard" className="hover:opacity-80 transition-opacity">Dashboard</Link>
                    </div>

                    {/* right — copyright */}
                    <p className={`text-xs ${theme === "dark" ? "text-white/20" : "text-black/20"}`}>
                        © {new Date().getFullYear()} Aero. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};
