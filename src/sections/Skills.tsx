import { useEffect, useRef } from "react";
import Matter from "matter-js";

import { skills } from "../content";
import { reducedMotion } from "../lib/motion";

const COLORS = ["var(--lime)", "var(--coral)", "var(--blue)", "var(--violet)", "var(--ink)"];

export function Skills() {
    const box = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = box.current;
        if (reducedMotion || !root) return;

        const { Engine, Bodies, Body, Composite, Constraint } = Matter;
        const engine = Engine.create({ gravity: { x: 0, y: 1.2 } });
        const els = Array.from(root.querySelectorAll<HTMLElement>(".block"));
        let W = root.clientWidth;
        let H = root.clientHeight;
        const T = 200;

        const walls = [
            Bodies.rectangle(W / 2, H + T / 2, W * 3, T, { isStatic: true }),
            Bodies.rectangle(-T / 2, H / 2, T, H * 4, { isStatic: true }),
            Bodies.rectangle(W + T / 2, H / 2, T, H * 4, { isStatic: true }),
        ];
        Composite.add(engine.world, walls);

        const bodies = els.map((el, i) => {
            const w = el.offsetWidth;
            const h = el.offsetHeight;
            const b = Bodies.rectangle(40 + Math.random() * (W - 80), -60 - i * 70, w, h, {
                chamfer: { radius: 4 },
                restitution: 0.35,
                friction: 0.3,
                angle: (Math.random() - 0.5) * 0.8,
            });
            return b;
        });

        let started = false;
        let visible = false;
        let raf = 0;
        let grab: Matter.Constraint | null = null;

        const tick = () => {
            Engine.update(engine, 1000 / 60);
            bodies.forEach((b, i) => {
                const el = els[i];
                el.style.transform = `translate(${b.position.x - el.offsetWidth / 2}px, ${
                    b.position.y - el.offsetHeight / 2
                }px) rotate(${b.angle}rad)`;
            });
            if (visible) raf = requestAnimationFrame(tick);
        };

        const io = new IntersectionObserver(
            ([entry]) => {
                visible = entry.isIntersecting;
                if (visible && !started) {
                    started = true;
                    Composite.add(engine.world, bodies);
                }
                cancelAnimationFrame(raf);
                if (visible && started) raf = requestAnimationFrame(tick);
            },
            { threshold: 0.3 },
        );
        io.observe(root);

        const local = (e: PointerEvent) => {
            const r = root.getBoundingClientRect();
            return { x: e.clientX - r.left, y: e.clientY - r.top };
        };

        const onDown = (e: PointerEvent) => {
            const i = els.indexOf(e.target as HTMLElement);
            if (i < 0) return;
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            const p = local(e);
            const b = bodies[i];
            grab = Constraint.create({
                pointA: p,
                bodyB: b,
                pointB: Matter.Vector.rotate({ x: p.x - b.position.x, y: p.y - b.position.y }, -b.angle),
                stiffness: 0.2,
                damping: 0.1,
            });
            Composite.add(engine.world, grab);
        };
        const onMove = (e: PointerEvent) => {
            if (grab) grab.pointA = local(e);
        };
        const onUp = () => {
            if (grab) Composite.remove(engine.world, grab);
            grab = null;
        };

        // throw everything up in the air on double click, for fun
        const onDouble = () =>
            bodies.forEach((b) =>
                Body.setVelocity(b, { x: (Math.random() - 0.5) * 20, y: -15 - Math.random() * 10 }),
            );

        const onResize = () => {
            W = root.clientWidth;
            H = root.clientHeight;
            Body.setPosition(walls[0], { x: W / 2, y: H + T / 2 });
            Body.setPosition(walls[2], { x: W + T / 2, y: H / 2 });
        };

        root.addEventListener("pointerdown", onDown);
        root.addEventListener("pointermove", onMove);
        root.addEventListener("pointerup", onUp);
        root.addEventListener("pointercancel", onUp);
        root.addEventListener("dblclick", onDouble);
        window.addEventListener("resize", onResize);
        return () => {
            io.disconnect();
            cancelAnimationFrame(raf);
            root.removeEventListener("pointerdown", onDown);
            root.removeEventListener("pointermove", onMove);
            root.removeEventListener("pointerup", onUp);
            root.removeEventListener("pointercancel", onUp);
            root.removeEventListener("dblclick", onDouble);
            window.removeEventListener("resize", onResize);
            Engine.clear(engine);
        };
    }, []);

    return (
        <section className="section" id="skills" data-accent="var(--violet)">
            <div className="label">{"// skills"}</div>
            <h2 className="display section-title">
                my toolbox<span className="dot">.</span>
            </h2>
            <div className={`playground${reducedMotion ? " static" : ""}`} ref={box}>
                {!reducedMotion && (
                    <div className="playground-hint label">drag 'em, throw 'em. double-click for chaos.</div>
                )}
                {skills.map((s, i) => (
                    <div
                        key={s}
                        className="block"
                        style={{
                            background: COLORS[i % COLORS.length],
                            color: COLORS[i % COLORS.length] === "var(--blue)" ? "var(--ink)" : undefined,
                            touchAction: "none",
                            transform: reducedMotion ? undefined : "translate(-999px, -999px)",
                        }}
                    >
                        {s}
                    </div>
                ))}
            </div>
        </section>
    );
}
