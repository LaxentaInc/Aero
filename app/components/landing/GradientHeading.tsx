"use client";

import { motion } from "framer-motion";
import React from "react";

interface GradientHeadingProps {
    text: string;
    theme: "dark" | "light";
    className?: string;
    as?: "h1" | "h2" | "h3" | "h4";
}

export const GradientHeading = ({ text, theme, className = "", as = "h2" }: GradientHeadingProps) => {
    const gradient = theme === "dark"
        ? 'linear-gradient(90deg, #ffffff 0%, #5865F2 50%, #ffffff 100%)'
        : 'linear-gradient(90deg, #000000 0%, #5865F2 50%, #000000 100%)';

    const MotionComponent = motion[as];

    return (
        <MotionComponent
            className={className}
            animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
                repeatDelay: 4
            }}
            style={{
                backgroundSize: '200% 100%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundImage: gradient,
            }}
        >
            {text}
        </MotionComponent>
    );
};
