'use client';

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { InteractiveNebulaShader } from './liquid-shader';

// ===================== HERO =====================
interface HeroProps {
    title: string;
    description: string;
    badgeText?: string;
    badgeLabel?: string;
    ctaButtons?: Array<{ text: string; href: string; primary?: boolean }>;
    microDetails?: Array<string>;
    height?: string;
    className?: string;
}

export default function NebulaHero({
    title,
    description,
    badgeText = "Gemini 3 Pro Integrado",
    badgeLabel = "Inteligência Artificial",
    ctaButtons = [],
    microDetails = [],
    height = "h-screen",
    className = ""
}: HeroProps) {
    const sectionRef = useRef<HTMLElement | null>(null);
    const headerRef = useRef<HTMLHeadingElement | null>(null);
    const paraRef = useRef<HTMLParagraphElement | null>(null);
    const ctaRef = useRef<HTMLDivElement | null>(null);
    const badgeRef = useRef<HTMLDivElement | null>(null);
    const microRef = useRef<HTMLUListElement | null>(null);

    useGSAP(
        () => {
            if (!headerRef.current) return;

            // Initial States
            gsap.set([headerRef.current, paraRef.current, ctaRef.current, badgeRef.current, microRef.current], {
                autoAlpha: 0,
                y: 20,
                filter: 'blur(10px)'
            });

            const tl = gsap.timeline({
                defaults: { ease: 'power3.out' },
                delay: 0.5
            });

            // Badge
            if (badgeRef.current) {
                tl.to(badgeRef.current, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.8 });
            }

            // Title
            tl.to(headerRef.current, {
                autoAlpha: 1,
                y: 0,
                filter: 'blur(0px)',
                duration: 1.0
            }, '-=0.6');

            // Description
            if (paraRef.current) {
                tl.to(paraRef.current, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.8 }, '-=0.8');
            }

            // Buttons
            if (ctaRef.current) {
                tl.to(ctaRef.current, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.8 }, '-=0.7');
            }

            // Micro Details
            if (microRef.current) {
                tl.to(microRef.current, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.8 }, '-=0.7');
            }
        },
        { scope: sectionRef },
    );

    return (
        <section ref={sectionRef} className={`relative w-full overflow-hidden flex flex-col justify-center bg-transparent font-sans ${height} ${className}`}>
            {/* New Shader Background */}
            <InteractiveNebulaShader className="absolute inset-0 w-full h-full z-0" />

            <div className="relative mx-auto w-full max-w-7xl flex flex-col items-start gap-4 px-6 sm:gap-6 md:px-10 lg:px-16 py-20 z-10">
                <div ref={badgeRef} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md invisible">
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-indigo-400">{badgeLabel}</span>
                    <span className="h-1 w-1 rounded-full bg-white/40" />
                    <span className="text-xs font-light tracking-tight text-white/90">{badgeText}</span>
                </div>

                <h1 ref={headerRef} className="max-w-4xl text-left text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl invisible">
                    {title}
                </h1>

                <p ref={paraRef} className="max-w-2xl text-left text-base font-light leading-relaxed tracking-tight text-white/70 sm:text-lg invisible">
                    {description}
                </p>

                <div ref={ctaRef} className="flex flex-wrap items-center gap-4 pt-4 invisible">
                    {ctaButtons.map((button, index) => (
                        <a
                            key={index}
                            href={button.href}
                            className={`rounded-2xl px-10 py-5 text-sm font-semibold tracking-tight transition-all duration-300 transform active:scale-95 border border-white/10 ${button.primary
                                ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-500/20"
                                : "bg-white/5 text-white/90 backdrop-blur-xl hover:bg-white/10"
                                }`}
                        >
                            {button.text}
                        </a>
                    ))}
                </div>

                <ul ref={microRef} className="mt-8 flex flex-wrap gap-x-10 gap-y-4 text-xs font-light tracking-widest text-white/40 uppercase invisible">
                    {microDetails.map((detail, index) => (
                        <li key={index} className="flex items-center gap-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                            {detail}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent z-10" />
        </section>
    );
}
