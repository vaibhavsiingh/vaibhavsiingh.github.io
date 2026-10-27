import { useEffect, useRef } from "react";

import { Sticker } from "../components/Sticker";
import { about, profile, stats, stickers } from "../content";
import { reducedMotion, ScrollTrigger } from "../lib/motion";

export function About() {
    const text = useRef<HTMLParagraphElement>(null);
    const words = about.split(" ");

    useEffect(() => {
        if (reducedMotion || !text.current) return;
        const spans = Array.from(text.current.querySelectorAll<HTMLSpanElement>(".w"));
        const st = ScrollTrigger.create({
            trigger: text.current,
            start: "top 80%",
            end: "bottom 45%",
            onUpdate: (self) => {
                const lit = self.progress * spans.length;
                spans.forEach((s, i) => (s.style.opacity = i < lit ? "1" : "0.15"));
            },
        });
        return () => st.kill();
    }, []);

    return (
        <section className="section" id="about" data-accent="var(--lime)">
            <div className="label">{"// about_me"}</div>
            <h2 className="display section-title">
                hello<span className="dot">.</span>
            </h2>
            <div className="about-grid">
                <p className="about-text" ref={text}>
                    {words.map((w, i) => (
                        <span key={i} className="w">
                            {w}{" "}
                        </span>
                    ))}
                </p>
                <div className="about-photo-wrap">
                    <picture>
                        <source srcSet={profile.photo} type="image/webp" />
                        <img className="about-photo" src={profile.photoFallback} alt={profile.name} loading="lazy" />
                    </picture>
                    <Sticker tilt={-8} style={{ top: -18, right: -12 }}>
                        {stickers[0]}
                    </Sticker>
                    <Sticker tone="coral" tilt={6} style={{ bottom: 36, left: -24 }}>
                        {stickers[1]}
                    </Sticker>
                    <Sticker tone="violet" tilt={-3} style={{ bottom: -20, right: 8 }}>
                        {stickers[2]}
                    </Sticker>
                </div>
            </div>
            <div className="stats">
                {stats.map((s) => (
                    <div className="stat" key={s.label}>
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}
