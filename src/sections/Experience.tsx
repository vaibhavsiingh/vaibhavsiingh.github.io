import { useEffect, useRef } from "react";

import { experience } from "../content";
import { gsap, reducedMotion, ScrollTrigger } from "../lib/motion";

export function Experience() {
    const wrap = useRef<HTMLDivElement>(null);
    const fill = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!wrap.current) return;
        const jobs = Array.from(wrap.current.querySelectorAll<HTMLElement>(".job"));
        if (reducedMotion) {
            jobs.forEach((j) => j.classList.add("lit"));
            gsap.set(fill.current, { scaleY: 1 });
            return;
        }
        const ctx = gsap.context(() => {
            gsap.to(fill.current, {
                scaleY: 1,
                ease: "none",
                scrollTrigger: { trigger: wrap.current, start: "top 60%", end: "bottom 60%", scrub: true },
            });
            jobs.forEach((job) => {
                ScrollTrigger.create({
                    trigger: job,
                    start: "top 60%",
                    onEnter: () => job.classList.add("lit"),
                    onLeaveBack: () => job.classList.remove("lit"),
                });
                gsap.from(job, {
                    x: 60,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power3.out",
                    scrollTrigger: { trigger: job, start: "top 85%" },
                });
            });
        }, wrap);
        return () => ctx.revert();
    }, []);

    return (
        <section className="section" id="experience" data-accent="var(--lime)">
            <div className="label">{"// experience.log"}</div>
            <h2 className="display section-title">
                where i've been<span className="dot">.</span>
            </h2>
            <div className="timeline" ref={wrap}>
                <div className="trace">
                    <div className="trace-fill" ref={fill} />
                </div>
                {experience.map((j) => (
                    <div className="job" key={j.org + j.role}>
                        <div className="job-when">{j.when}</div>
                        <h3 className="display job-org">
                            {j.org}
                            {j.badge && <span className="sticker">{j.badge}</span>}
                        </h3>
                        <div className="job-role">{j.role}</div>
                        <div className="job-where">{j.where}</div>
                        <ul>
                            {j.points.map((p) => (
                                <li key={p}>{p}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
}
