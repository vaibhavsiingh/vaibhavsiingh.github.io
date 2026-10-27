import { lazy, Suspense, useEffect, useRef, useState } from "react";

import { Sticker } from "../components/Sticker";
import { profile } from "../content";
import { isSmallScreen, reducedMotion, ScrollTrigger } from "../lib/motion";
import type { HeroState } from "../three/ParticleField";

const HeroCanvas = lazy(() => import("../three/HeroCanvas"));

function webglAvailable() {
    try {
        const c = document.createElement("canvas");
        return !!c.getContext("webgl2");
    } catch {
        return false;
    }
}

const ramp = (a: number, b: number, x: number) => Math.min(1, Math.max(0, (x - a) / (b - a)));

export function Hero() {
    const section = useRef<HTMLElement>(null);
    const intro = useRef<HTMLDivElement>(null);
    const metal = useRef<HTMLHeadingElement>(null);
    const state = useRef<HeroState>({ progress: 0 });
    const [active, setActive] = useState(true);
    const [ready, setReady] = useState(false);
    const [use3d] = useState(() => !reducedMotion && webglAvailable());
    const audio = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // sample the name only once the display font has loaded
        document.fonts.load('800 100px "Bricolage Grotesque Variable"').finally(() => setReady(true));
    }, []);

    useEffect(() => {
        if (!section.current) return;
        const st = ScrollTrigger.create({
            trigger: section.current,
            start: "top top",
            end: "bottom bottom",
            onUpdate: (self) => {
                const p = self.progress;
                state.current.progress = p;
                if (intro.current) intro.current.style.opacity = String(1 - ramp(0.02, 0.12, p));
                if (metal.current) {
                    const o = ramp(0.48, 0.62, p) * (1 - ramp(0.9, 1, p));
                    metal.current.style.opacity = String(o);
                    metal.current.style.transform = `translate(-50%, ${(1 - o) * 30}px)`;
                }
            },
            onToggle: (self) => setActive(self.isActive),
        });
        return () => st.kill();
    }, []);

    const sayName = () => {
        audio.current ??= new Audio(profile.audio);
        audio.current.currentTime = 0;
        void audio.current.play();
    };

    return (
        <section className="hero" ref={section} id="top" data-accent="var(--blue)">
            <div className="hero-sticky">
                <h1 className="sr-only">{profile.name}</h1>
                {use3d ? (
                    ready && (
                        <Suspense fallback={null}>
                            <HeroCanvas
                                state={state}
                                active={active}
                                count={isSmallScreen ? 5000 : 11000}
                                word={profile.first}
                            />
                        </Suspense>
                    )
                ) : (
                    <div className="hero-fallback display" aria-hidden>
                        {profile.first}
                    </div>
                )}

                <h2 className="hero-metal display" ref={metal}>
                    i live close
                    <br />
                    to the <em>metal.</em>
                </h2>

                <div className="hero-overlay" ref={intro}>
                    <div className="hero-hi">{"// hi, i'm"}</div>
                    <div className="hero-bottom">
                        <div>
                            <p className="hero-tagline">{profile.tagline}</p>
                            <div className="label">{profile.role}</div>
                        </div>
                        <Sticker tone="blue" tilt={5} onTap={sayName} label="Play name pronunciation">
                            🔊 {profile.pronunciation}
                        </Sticker>
                        <div className="hero-scroll">scroll to boot ↓</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
