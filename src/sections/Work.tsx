import { useEffect, useRef, useState, type CSSProperties } from "react";

import { useScramble } from "../components/Scramble";
import { featured, type Project } from "../content";
import { reducedMotion, ScrollTrigger } from "../lib/motion";

const WIDE = "(min-width: 861px)";

function useWide() {
    const [wide, setWide] = useState(() => window.matchMedia(WIDE).matches);
    useEffect(() => {
        const mq = window.matchMedia(WIDE);
        const on = () => setWide(mq.matches);
        mq.addEventListener("change", on);
        return () => mq.removeEventListener("change", on);
    }, []);
    return wide;
}

/** Counts the leading number of a stat like "3.5×" or "~10s ns" up from zero; leaves others as is. */
function CountUp({ value }: { value: string }) {
    const el = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const m = value.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
        if (!m || reducedMotion || !el.current) return;
        const [, pre, num, post] = m;
        const target = parseFloat(num);
        const decimals = num.split(".")[1]?.length ?? 0;
        const start = performance.now();
        let raf = 0;
        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / 700);
            const eased = 1 - Math.pow(1 - t, 3);
            if (el.current) el.current.textContent = pre + (target * eased).toFixed(decimals) + post;
            if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [value]);
    return (
        <div className="v" ref={el}>
            {value}
        </div>
    );
}

function Chip({ project }: { project: Project }) {
    const pins = Array.from({ length: 6 }, (_, i) => 22 + i * 11.2);
    return (
        <div className="chip" aria-hidden>
            <svg viewBox="0 0 100 100">
                {pins.map((p) => (
                    <g key={p} stroke="var(--bg)" strokeWidth="2.4">
                        <line x1={p} y1="2" x2={p} y2="16" />
                        <line x1={p} y1="84" x2={p} y2="98" />
                        <line x1="2" y1={p} x2="16" y2={p} />
                        <line x1="84" y1={p} x2="98" y2={p} />
                    </g>
                ))}
                <rect x="14" y="14" width="72" height="72" fill="var(--bg)" />
                <circle cx="22" cy="22" r="2.4" fill="var(--ink-dim)" />
            </svg>
            <div className="chip-stat">
                <CountUp value={project.stat.value} />
                <div className="l">{project.stat.label}</div>
            </div>
        </div>
    );
}

/** The detail view of one project: used in the sticky panel on desktop and as a card on mobile. */
function Detail({ project, index, scrambleTitle }: { project: Project; index: number; scrambleTitle?: boolean }) {
    const title = useRef<HTMLHeadingElement>(null);
    const scramble = useScramble();

    useEffect(() => {
        if (scrambleTitle && !reducedMotion) scramble(title.current, project.title);
    }, [project, scrambleTitle]);

    return (
        <div className="detail">
            <div className="card-part">
                <span>{project.part}</span>
                <span>
                    {String(index + 1).padStart(2, "0")} / {String(featured.length).padStart(2, "0")}
                </span>
            </div>
            <div className="detail-top">
                <div>
                    <h3 className="display card-title" ref={title}>
                        {project.title}
                    </h3>
                    <p className="card-blurb">{project.blurb}</p>
                </div>
                <Chip project={project} />
            </div>
            <ul>
                {project.points.map((p) => (
                    <li key={p}>{p}</li>
                ))}
            </ul>
            <div className="detail-foot">
                <div className="tags">
                    {project.tags.map((t) => (
                        <span className="tag" key={t}>
                            {t}
                        </span>
                    ))}
                </div>
                {project.link && (
                    <a className="card-link" href={project.link} target="_blank" rel="noreferrer">
                        see the code ↗
                    </a>
                )}
            </div>
        </div>
    );
}

const panelStyle = (p: Project) =>
    ({ "--card": p.color, color: p.color === "var(--blue)" ? "var(--ink)" : "var(--bg)" }) as CSSProperties;

export function Work() {
    const wide = useWide();
    const list = useRef<HTMLOListElement>(null);
    const [active, setActive] = useState(0);

    useEffect(() => {
        if (!wide || !list.current) return;
        const items = Array.from(list.current.querySelectorAll<HTMLElement>(".index-item"));
        const triggers = items.map((item, i) =>
            ScrollTrigger.create({
                trigger: item,
                start: "top 55%",
                end: "bottom 55%",
                onToggle: (self) => self.isActive && setActive(i),
            }),
        );
        return () => triggers.forEach((t) => t.kill());
    }, [wide]);

    const project = featured[active];

    return (
        <section className="section" id="work" data-accent="var(--coral)">
            <div className="label">{"// featured_projects"}</div>
            <h2 className="display section-title">
                stuff i built<span className="dot">.</span>
            </h2>

            {wide ? (
                <div className="work-index">
                    <ol className="index-list" ref={list}>
                        {featured.map((p, i) => (
                            <li
                                key={p.title}
                                className={`index-item${i === active ? " on" : ""}`}
                                style={{ "--card": p.color } as CSSProperties}
                                onMouseEnter={() => setActive(i)}
                            >
                                <span className="index-num">{String(i + 1).padStart(2, "0")}</span>
                                <span className="index-title display">{p.title}</span>
                            </li>
                        ))}
                    </ol>
                    <div className="panel-wrap">
                        <div className="panel" style={panelStyle(project)}>
                            {/* keyed so the content re-runs its entrance animation on every switch */}
                            <div className="panel-inner" key={active}>
                                <Detail project={project} index={active} scrambleTitle />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="work-cards">
                    {featured.map((p, i) => (
                        <div className="panel" key={p.title} style={panelStyle(p)}>
                            <Detail project={p} index={i} />
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
