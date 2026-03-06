"use client";

import { useTheme } from "@/app/contexts/ThemeContext";
import { HeroSection } from "@/app/components/landing/HeroSection";
import { FeaturesSection } from "@/app/components/landing/FeaturesSection";
import { ShowcaseCard } from "@/app/components/landing/ShowcaseCard";
import { HomeShowcase } from "@/app/components/landing/HomeShowcase";
import { ComparisonTable } from "@/app/components/landing/ComparisonTable";
import { PlannedOpenSource } from "@/app/components/landing/PlannedOpenSource";
import { CommunityReviews } from "@/app/components/landing/CommunityReviews";
import { FAQSection } from "@/app/components/landing/FAQSection";
import { BottomCTA } from "@/app/components/landing/BottomCTA";
import { Footer } from "@/app/components/Footer";

// We keep the protection hook from dashboard if needed, or remove it. 
// We'll just define a simple version or omit it since it's the landing page.
import { useEffect } from "react";

const useProtection = () => {
    useEffect(() => {
        const preventDefaultKeys = (e: KeyboardEvent) => {
            if (
                (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'u' || e.key === 'U')) ||
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && e.key === 'i') ||
                (e.ctrlKey && e.shiftKey && e.key === 'I')
            ) {
                e.preventDefault();
                return false;
            }
        };

        const preventContextMenu = (e: Event) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.closest('.allow-select')) {
                return;
            }
            e.preventDefault();
            return false;
        };

        document.addEventListener('contextmenu', preventContextMenu);
        document.addEventListener('keydown', preventDefaultKeys);

        const images = document.getElementsByTagName('img');
        Array.from(images).forEach(img => {
            img.addEventListener('dragstart', (e) => e.preventDefault());
            img.setAttribute('draggable', 'false');
        });

        return () => {
            document.removeEventListener('contextmenu', preventContextMenu);
            document.removeEventListener('keydown', preventDefaultKeys);
            Array.from(images).forEach(img => {
                img.removeEventListener('dragstart', (e) => e.preventDefault());
            });
        };
    }, [])
};

export default function Home() {
    const { theme } = useTheme();

    useProtection();

    return (
        <div className={`relative min-h-screen select-none ${theme === "dark" ? "bg-[#0a0a0a] text-white" : "bg-white text-black"}`}>

            <HeroSection theme={theme} />

            <FeaturesSection theme={theme} />

            <ShowcaseCard
                title="DASHBOARD"
                description="Manage your server's security from anywhere. Access real-time logs, configure thresholds, and override actions via a beautiful web interface."
                badge="WEB · REAL-TIME · LOGS"
                imageSrc="/MillenniumEvent.png"
                index={0}
                theme={theme}
            />

            <ShowcaseCard
                title="ANTI-NUKE"
                description="Zero compromises. Detects mass channel deletions, mass kicks, and rogue admins. Automatically stops the attack and restores deleted channels instantly."
                badge="AUTO-RESTORE · INSTANT"
                imageSrc="/MillenniumEvent.png"
                index={1}
                theme={theme}
            />

            <ShowcaseCard
                title="GRANULAR CONTROL"
                description="Don't want to ban? Just timeout. Need limits? Set exact thresholds. Separate limits for bots and humans to give you total control over how security is handled."
                badge="THRESHOLDS · PUNISHMENTS"
                imageSrcs={["/MillenniumEvent.png", "/MillenniumEvent.png"]} // replace with real shots if needed
                index={2}
                theme={theme}
                layout="vertical"
                imageFit="contain"
            />

            <HomeShowcase theme={theme} />

            <ComparisonTable theme={theme} />

            <CommunityReviews theme={theme} />

            <PlannedOpenSource theme={theme} />

            <FAQSection theme={theme} />

            <BottomCTA theme={theme} />

            <Footer theme={theme} />

        </div>
    );
}