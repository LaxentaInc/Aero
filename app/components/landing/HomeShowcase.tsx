"use client";

import Image from "next/image";

export const HomeShowcase = ({ theme }: { theme: "dark" | "light" }) => {
    return (
        <section className="py-16 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/5 bg-black/5">
                    {/* Placeholder image, using KoiLogo as fallback since we don't have a giant dashboard screenshot, 
                        or we can just skip the image and use a gradient box for now. Let's use KoiLogo centered */}
                    <div className={`w-full aspect-[16/9] flex items-center justify-center p-12
                        ${theme === "dark" ? "bg-[#0f1419]" : "bg-gray-100"}`}>
                        <Image
                            src="/KoiLogo.png"
                            alt="Aero interface"
                            width={1920}
                            height={1080}
                            className="w-full max-w-2xl h-auto object-contain drop-shadow-2xl"
                            quality={95}
                            priority
                        />
                    </div>
                    <div className={`absolute inset-0 bg-gradient-to-t to-transparent pointer-events-none
                        ${theme === "dark" ? "from-black/30" : "from-white/20"}`}
                    />
                </div>

                <p className={`text-center mt-6 text-sm font-mono ${theme === "dark" ? "text-white/50" : "text-black/50"}`}>
                    Lightning fast dashboard · granular module controls · live protection <br />
                    <span className="text-xs text-white/50">more features coming soon... :3</span>
                </p>
            </div>
        </section>
    );
};
