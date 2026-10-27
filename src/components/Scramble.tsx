import { useRef } from "react";

const GLYPHS = "!<>-_\\/[]{}=+*^?#01";

/** Hook returning a function that scrambles an element's text and decodes it back. */
export function useScramble() {
    const frame = useRef(0);
    return (el: HTMLElement | null, text: string) => {
        if (!el) return;
        cancelAnimationFrame(frame.current);
        let i = 0;
        const total = text.length;
        const step = () => {
            i += Math.max(1, total / 24);
            el.textContent = text
                .split("")
                .map((ch, k) => (k < i || ch === " " ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
                .join("");
            if (i < total) frame.current = requestAnimationFrame(step);
        };
        step();
    };
}
