import { useEffect, useRef, useState } from "react";

const N = 24;
const CELL = 20;

/** The Konami-code reward. Arrow keys / WASD to move, Esc to quit. */
export function Snake({ onClose }: { onClose: () => void }) {
    const canvas = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [best, setBest] = useState(0);

    useEffect(() => {
        const ctx = canvas.current!.getContext("2d")!;
        let snake = [{ x: 12, y: 12 }];
        let dir = { x: 1, y: 0 };
        let queued = dir;
        let food = { x: 5, y: 5 };
        let points = 0;

        const placeFood = () => {
            do food = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) };
            while (snake.some((s) => s.x === food.x && s.y === food.y));
        };

        const dot = (x: number, y: number, color: string, r = CELL * 0.38) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x * CELL + CELL / 2, y * CELL + CELL / 2, r, 0, Math.PI * 2);
            ctx.fill();
        };

        const step = () => {
            dir = queued;
            const head = { x: (snake[0].x + dir.x + N) % N, y: (snake[0].y + dir.y + N) % N };
            if (snake.some((s) => s.x === head.x && s.y === head.y)) {
                setBest((b) => Math.max(b, points));
                snake = [{ x: 12, y: 12 }];
                points = 0;
                setScore(0);
                return;
            }
            snake.unshift(head);
            if (head.x === food.x && head.y === food.y) {
                points++;
                setScore(points);
                placeFood();
            } else snake.pop();

            ctx.fillStyle = "#0f0e0d";
            ctx.fillRect(0, 0, N * CELL, N * CELL);
            for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) dot(x, y, "#1d1c1a", 1.5);
            dot(food.x, food.y, "#ff5c5c", CELL * 0.45);
            snake.forEach((s, i) => dot(s.x, s.y, i === 0 ? "#f0ebe6" : "#4b69f0"));
        };

        const keys: Record<string, { x: number; y: number }> = {
            ArrowUp: { x: 0, y: -1 },
            w: { x: 0, y: -1 },
            ArrowDown: { x: 0, y: 1 },
            s: { x: 0, y: 1 },
            ArrowLeft: { x: -1, y: 0 },
            a: { x: -1, y: 0 },
            ArrowRight: { x: 1, y: 0 },
            d: { x: 1, y: 0 },
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") return onClose();
            const d = keys[e.key];
            if (!d) return;
            e.preventDefault();
            if (d.x !== -dir.x || d.y !== -dir.y) queued = d;
        };

        placeFood();
        const id = setInterval(step, 90);
        window.addEventListener("keydown", onKey);
        return () => {
            clearInterval(id);
            window.removeEventListener("keydown", onKey);
        };
    }, [onClose]);

    return (
        <div className="snake" role="dialog" aria-label="Snake game" onClick={onClose}>
            <div onClick={(e) => e.stopPropagation()}>
                <div className="snake-hud">
                    <span>score {score} · best {best}</span>
                    <span>arrows / wasd · esc to quit</span>
                </div>
                <canvas ref={canvas} width={N * CELL} height={N * CELL} />
            </div>
        </div>
    );
}
