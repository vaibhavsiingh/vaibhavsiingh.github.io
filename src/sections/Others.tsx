import { useEffect, useRef, useState } from "react";

import { useScramble } from "../components/Scramble";
import { others, type MiniProject } from "../content";
import { isTouch } from "../lib/motion";

export function Others() {
    const peek = useRef<HTMLDivElement>(null);
    const [hovered, setHovered] = useState<MiniProject | null>(null);
    const scramble = useScramble();

    useEffect(() => {
        if (isTouch) return;
        const pos = { x: 0, y: 0, tx: 0, ty: 0 };
        let raf = 0;
        const onMove = (e: PointerEvent) => {
            pos.tx = e.clientX;
            pos.ty = e.clientY;
        };
        const tick = () => {
            pos.x += (pos.tx - pos.x) * 0.15;
            pos.y += (pos.ty - pos.y) * 0.15;
            if (peek.current) peek.current.style.left = `${pos.x}px`;
            if (peek.current) peek.current.style.top = `${pos.y}px`;
            raf = requestAnimationFrame(tick);
        };
        window.addEventListener("pointermove", onMove);
        raf = requestAnimationFrame(tick);
        return () => {
            window.removeEventListener("pointermove", onMove);
            cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <section className="section" id="more" data-accent="var(--coral)">
            <div className="label">{"// other_projects"}</div>
            <h2 className="display section-title">
                and more<span className="dot">.</span>
            </h2>
            <div className="rows" onMouseLeave={() => setHovered(null)}>
                {others.map((p) => {
                    const Tag = p.link ? "a" : "div";
                    return (
                        <Tag
                            key={p.title}
                            className="row"
                            {...(p.link ? { href: p.link, target: "_blank", rel: "noreferrer" } : {})}
                            onMouseEnter={(e) => {
                                setHovered(p);
                                scramble(e.currentTarget.querySelector(".row-title"), p.title);
                            }}
                        >
                            <span className="row-title">{p.title}</span>
                            <span className="row-note">{p.note}</span>
                            <span className="row-arrow">{p.link ? "↗" : "·"}</span>
                        </Tag>
                    );
                })}
            </div>
            {!isTouch && (
                <div className={`peek${hovered ? " on" : ""}`} ref={peek} aria-hidden>
                    <div className="display" style={{ fontSize: "1.3rem" }}>
                        {hovered?.title}
                    </div>
                    <div className="tags">
                        {hovered?.tags.map((t) => (
                            <span className="tag" key={t}>
                                {t}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
