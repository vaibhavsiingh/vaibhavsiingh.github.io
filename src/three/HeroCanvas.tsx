import { Canvas } from "@react-three/fiber";
import type { RefObject } from "react";

import { ParticleField, type HeroState } from "./ParticleField";

type Props = { state: RefObject<HeroState>; active: boolean; count: number; word: string };

export default function HeroCanvas({ state, active, count, word }: Props) {
    return (
        <Canvas
            className="hero-canvas"
            camera={{ position: [0, 0, 10], fov: 35 }}
            dpr={[1, 1.75]}
            frameloop={active ? "always" : "never"}
            gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        >
            <ParticleField state={state} count={count} word={word} />
        </Canvas>
    );
}
