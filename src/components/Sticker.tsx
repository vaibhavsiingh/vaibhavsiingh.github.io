import { useRef, type CSSProperties, type ReactNode } from "react";

type Props = {
    children: ReactNode;
    tone?: "lime" | "blue" | "coral" | "violet";
    tilt?: number;
    style?: CSSProperties;
    onTap?: () => void;
    label?: string;
};

/** A pill you can drag around the page. A click without dragging calls `onTap`. */
export function Sticker({ children, tone = "lime", tilt = -6, style, onTap, label }: Props) {
    const el = useRef<HTMLButtonElement>(null);
    const drag = useRef({ x: 0, y: 0, ox: 0, oy: 0, moved: false, active: false });

    const apply = (scale = 1) => {
        const d = drag.current;
        if (el.current) el.current.style.transform = `translate(${d.x}px, ${d.y}px) rotate(${tilt}deg) scale(${scale})`;
    };

    return (
        <button
            ref={el}
            type="button"
            aria-label={label}
            className={`sticker ${tone === "lime" ? "" : tone}`}
            style={{ transform: `rotate(${tilt}deg)`, ...style }}
            onPointerDown={(e) => {
                const d = drag.current;
                d.active = true;
                d.moved = false;
                d.ox = e.clientX - d.x;
                d.oy = e.clientY - d.y;
                e.currentTarget.setPointerCapture(e.pointerId);
                apply(1.08);
            }}
            onPointerMove={(e) => {
                const d = drag.current;
                if (!d.active) return;
                const nx = e.clientX - d.ox;
                const ny = e.clientY - d.oy;
                if (Math.abs(nx - d.x) + Math.abs(ny - d.y) > 2) d.moved = true;
                d.x = nx;
                d.y = ny;
                apply(1.08);
            }}
            onPointerUp={() => {
                drag.current.active = false;
                apply();
            }}
            onClick={() => {
                if (!drag.current.moved) onTap?.();
            }}
        >
            {children}
        </button>
    );
}
