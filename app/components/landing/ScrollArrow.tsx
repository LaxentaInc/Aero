"use client";

import { motion } from "framer-motion";

export const ScrollArrow = ({ theme }: { theme: "dark" | "light" }) => (
    <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 cursor-pointer z-20"
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
    >
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path
                d="M18 6v24M8 22l10 10 10-10"
                stroke={theme === "dark" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    </motion.div>
);
