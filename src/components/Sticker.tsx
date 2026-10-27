import { useRef, type CSSProperties, type ReactNode } from "react";

type Props = {
    children: ReactNode;
    tone?: "lime" | "blue" | "coral" | "violet";
    tilt?: number;
    style?: CSSProperties;
    onTap?: () => void;
    label?: string;
};

// shared so whichever sticker was grabbed last sits on top of the others
let topZ = 20;

/** A pill you can drag around the page. A click without dragging calls `onTap`. */
export function Sticker({ children, tone = "lime", tilt = -6, style, onTap, label }: Props) {
    const el = useRef<HTMLButtonElement>(null);
    const drag = useRef({ x: 0, y: 0, ox: 0, oy: 0, sx: 0, sy: 0, moved: false, active: false });

    const apply = (scale = 1) => {
        const d = drag.current;
        if (el.current) el.current.style.transform = `translate(${d.x}px, ${d.y}px) rotate(${tilt}deg) scale(${scale})`;
    };

    const end = () => {
        if (!drag.current.active) return;
        drag.current.active = false;
        el.current?.classList.remove("dragging");
        apply();
    };

    return (
        <button
            ref={el}
            type="button"
            aria-label={label}
            className={`sticker ${tone === "lime" ? "" : tone}`}
            style={{ transform: `rotate(${tilt}deg)`, ...style }}
            onPointerDown={(e) => {
                if (e.button !== 0) return;
                const d = drag.current;
                d.active = true;
                d.moved = false;
                d.ox = e.clientX - d.x;
                d.oy = e.clientY - d.y;
                d.sx = e.clientX;
                d.sy = e.clientY;
                e.currentTarget.setPointerCapture(e.pointerId);
                e.currentTarget.style.zIndex = String(++topZ);
                e.currentTarget.classList.add("dragging");
                apply(1.08);
            }}
            onPointerMove={(e) => {
                const d = drag.current;
                if (!d.active) return;
                // a mouse with no buttons held means we missed the release; stop dragging
                if (e.pointerType === "mouse" && e.buttons === 0) return end();
                if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 4) d.moved = true;
                d.x = e.clientX - d.ox;
                d.y = e.clientY - d.oy;
                apply(1.08);
            }}
            onPointerUp={end}
            onPointerCancel={end}
            onLostPointerCapture={end}
            onClick={() => {
                if (!drag.current.moved) onTap?.();
            }}
        >
            {children}
        </button>
    );
}
