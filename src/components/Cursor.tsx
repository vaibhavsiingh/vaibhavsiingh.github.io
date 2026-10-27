import { useEffect, useRef } from "react";

import { isTouch } from "../lib/motion";

/** A blob that trails the pointer, grows over links and takes the current section's accent colour. */
export function Cursor() {
    const dot = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isTouch) return;
        document.body.classList.add("has-cursor");
        const pos = { x: -100, y: -100, tx: -100, ty: -100 };
        let raf = 0;
        let lastAccent = "";

        const onMove = (e: PointerEvent) => {
            pos.tx = e.clientX;
            pos.ty = e.clientY;
            const t = e.target as HTMLElement;
            dot.current?.classList.toggle("big", !!t.closest("a, button, .block, .row"));
            const accent = t.closest<HTMLElement>("[data-accent]")?.dataset.accent ?? "var(--blue)";
            if (accent !== lastAccent && dot.current) {
                lastAccent = accent;
                dot.current.style.background = accent;
            }
        };
        const tick = () => {
            pos.x += (pos.tx - pos.x) * 0.22;
            pos.y += (pos.ty - pos.y) * 0.22;
            if (dot.current) dot.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
            raf = requestAnimationFrame(tick);
        };
        window.addEventListener("pointermove", onMove);
        raf = requestAnimationFrame(tick);
        return () => {
            document.body.classList.remove("has-cursor");
            window.removeEventListener("pointermove", onMove);
            cancelAnimationFrame(raf);
        };
    }, []);

    if (isTouch) return null;
    return <div className="cursor" ref={dot} aria-hidden />;
}
