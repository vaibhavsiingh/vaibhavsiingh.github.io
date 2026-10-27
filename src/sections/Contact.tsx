import { useEffect, useRef } from "react";

import { profile } from "../content";
import { isTouch, reducedMotion } from "../lib/motion";

/** Little sparks that follow the cursor around the contact section. */
function useTrail(section: React.RefObject<HTMLElement | null>, canvas: React.RefObject<HTMLCanvasElement | null>) {
    useEffect(() => {
        const host = section.current;
        const c = canvas.current;
        if (!host || !c || isTouch || reducedMotion) return;
        const ctx = c.getContext("2d")!;
        const colors = ["#4b69f0", "#ff5c5c", "#c6f432", "#b48cff"];
        type P = { x: number; y: number; vx: number; vy: number; life: number; color: string };
        const ps: P[] = [];
        let raf = 0;
        let running = false;

        const resize = () => {
            const dpr = Math.min(2, window.devicePixelRatio);
            c.width = host.clientWidth * dpr;
            c.height = host.clientHeight * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        const draw = () => {
            ctx.clearRect(0, 0, c.width, c.height);
            for (let i = ps.length - 1; i >= 0; i--) {
                const p = ps[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.05;
                p.life -= 0.02;
                if (p.life <= 0) {
                    ps.splice(i, 1);
                    continue;
                }
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, 4, 4);
            }
            running = ps.length > 0;
            if (running) raf = requestAnimationFrame(draw);
        };
        const onMove = (e: PointerEvent) => {
            const r = host.getBoundingClientRect();
            for (let i = 0; i < 2; i++) {
                ps.push({
                    x: e.clientX - r.left,
                    y: e.clientY - r.top,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2 - 0.5,
                    life: 1,
                    color: colors[Math.floor(Math.random() * colors.length)],
                });
            }
            if (!running) {
                running = true;
                raf = requestAnimationFrame(draw);
            }
        };
        resize();
        window.addEventListener("resize", resize);
        host.addEventListener("pointermove", onMove);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
            host.removeEventListener("pointermove", onMove);
        };
    }, [section, canvas]);
}

export function Contact() {
    const section = useRef<HTMLElement>(null);
    const canvas = useRef<HTMLCanvasElement>(null);
    useTrail(section, canvas);
    const phrase = ["LET'S TALK", "✺"];

    return (
        <footer className="contact" id="contact" ref={section} data-accent="var(--coral)">
            <canvas className="trail" ref={canvas} aria-hidden />
            <div className="marquee" aria-label="Let's talk">
                <div className="marquee-track" aria-hidden>
                    {Array.from({ length: 4 }).flatMap((_, i) =>
                        phrase.map((w, k) => (
                            <span key={`${i}-${k}`} className={k === 1 ? "star" : ""}>
                                {w}
                            </span>
                        )),
                    )}
                </div>
            </div>
            <div className="contact-body">
                <div>
                    <div className="label" style={{ marginBottom: 12 }}>
                        {"// internships, research, or just to argue about tabs vs spaces"}
                    </div>
                    <a className="contact-mail" href={`mailto:${profile.email}`}>
                        {profile.email}
                    </a>
                </div>
                <div className="contact-links">
                    <a href={profile.github} target="_blank" rel="noreferrer">
                        github ↗
                    </a>
                    <a href={profile.linkedin} target="_blank" rel="noreferrer">
                        linkedin ↗
                    </a>
                    {profile.resume && (
                        <a href={profile.resume} target="_blank" rel="noreferrer">
                            resume ↗
                        </a>
                    )}
                </div>
            </div>
            <div className="footer">
                <span>© {new Date().getFullYear()} {profile.name}</span>
                <span className="keys-hint">press ~ for a terminal · ↑↑↓↓←→←→BA for a secret</span>
            </div>
        </footer>
    );
}
