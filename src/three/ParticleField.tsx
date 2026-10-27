import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { buildCircuit, rng, sampleText } from "./shapes";

const vertex = /* glsl */ `
uniform float uTime;
uniform float uMorph;
uniform float uSignal;
uniform float uTextScale;
uniform float uCircuitScale;
uniform float uPixelRatio;
uniform float uSize;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform float uMouseScale;

attribute vec3 aText;
attribute vec3 aCircuit;
attribute float aAlong;
attribute float aPhase;
attribute vec4 aRand;

varying float vGlow;
varying float vMorph;
varying float vAlpha;

void main() {
    vec3 t = aText * uTextScale;
    t.xy += vec2(sin(uTime * 0.9 + aRand.x * 6.283), cos(uTime * 0.7 + aRand.y * 6.283)) * 0.004 * uTextScale;
    vec3 c = aCircuit * uCircuitScale;

    // staggered morph so particles leave the name at slightly different times
    float m = smoothstep(0.0, 1.0, clamp((uMorph - aRand.w * 0.3) / 0.7, 0.0, 1.0));
    vec3 p = mix(t, c, m);
    vec3 dir = normalize(aRand.xyz - 0.5 + 1e-4);
    p += dir * sin(m * 3.14159) * (0.8 + aRand.w * 1.6);

    vec4 world = modelMatrix * vec4(p, 1.0);

    // push particles away from the cursor; they spring back as it leaves
    vec2 d = world.xy - uMouse;
    float r = 0.67 * uMouseScale;
    float force = exp(-dot(d, d) / (r * r)) * uMouseStrength;
    world.xy += normalize(d + 1e-5) * force * (0.35 + aRand.z * 0.5) * uMouseScale;
    world.z += force * (aRand.x - 0.3) * 0.8 * uMouseScale;

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;

    float glow = 0.0;
    if (aAlong >= 0.0) {
        float head = fract(uTime * 0.28 + aPhase) * 1.5 - 0.25;
        float k = head - aAlong;
        glow = (k > 0.0 && k < 0.2) ? 1.0 - k / 0.2 : 0.0;
        glow *= glow * m * uSignal;
    }
    vGlow = glow;
    vMorph = m;
    vAlpha = 0.45 + 0.55 * aRand.z;

    gl_PointSize = uSize * (0.6 + aRand.w * 0.8) * (1.0 + glow * 1.8) * uPixelRatio / -mv.z;
}
`;

const fragment = /* glsl */ `
uniform vec3 uInk;
uniform vec3 uBlue;
uniform vec3 uTrace;

varying float vGlow;
varying float vMorph;
varying float vAlpha;

void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    float a = smoothstep(0.5, 0.05, r);
    vec3 base = mix(uInk, uTrace, vMorph);
    vec3 col = mix(base, uBlue * 1.4 + 0.25, vGlow);
    gl_FragColor = vec4(col, a * vAlpha * (0.75 + vGlow));
}
`;

export type HeroState = { progress: number };

type Props = {
    count: number;
    word: string;
    state: RefObject<HeroState>;
};

export function ParticleField({ count, word, state }: Props) {
    const points = useRef<THREE.Points>(null);
    const material = useRef<THREE.ShaderMaterial>(null);
    const { viewport, gl } = useThree();
    const mouse = useRef({ target: new THREE.Vector2(99, 99), current: new THREE.Vector2(99, 99), strength: 0 });

    const geometry = useMemo(() => {
        const random = rng(11);
        const text = sampleText(word, count, '"Bricolage Grotesque Variable", sans-serif', random);
        const circuit = buildCircuit(count, random);

        // shuffle pairing so the morph looks like an explosion rather than a slide
        const order = Array.from({ length: count }, (_, i) => i);
        for (let i = count - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [order[i], order[j]] = [order[j], order[i]];
        }
        const circ = new Float32Array(count * 3);
        const along = new Float32Array(count);
        const phase = new Float32Array(count);
        const rand = new Float32Array(count * 4);
        for (let i = 0; i < count; i++) {
            const o = order[i];
            circ.set(circuit.positions.subarray(o * 3, o * 3 + 3), i * 3);
            along[i] = circuit.along[o];
            phase[i] = circuit.phase[o];
            for (let k = 0; k < 4; k++) rand[i * 4 + k] = random();
        }

        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(text, 3));
        g.setAttribute("aText", new THREE.BufferAttribute(text, 3));
        g.setAttribute("aCircuit", new THREE.BufferAttribute(circ, 3));
        g.setAttribute("aAlong", new THREE.BufferAttribute(along, 1));
        g.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
        g.setAttribute("aRand", new THREE.BufferAttribute(rand, 4));
        // positions are computed in the shader, so skip frustum culling
        g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 100);
        return g;
    }, [count, word]);

    useEffect(() => () => geometry.dispose(), [geometry]);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uMorph: { value: 0 },
            uSignal: { value: 0 },
            uTextScale: { value: 1 },
            uCircuitScale: { value: 1 },
            uPixelRatio: { value: 1 },
            uSize: { value: 52 },
            uMouse: { value: new THREE.Vector2(99, 99) },
            uMouseStrength: { value: 0 },
            uMouseScale: { value: 1 },
            uInk: { value: new THREE.Color("#f0ebe6") },
            uBlue: { value: new THREE.Color("#4b69f0") },
            uTrace: { value: new THREE.Color("#5a6fc0") },
        }),
        [],
    );

    useEffect(() => {
        const onMove = (e: PointerEvent) => {
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = -(e.clientY / window.innerHeight) * 2 + 1;
            mouse.current.target.set(x, y);
            mouse.current.strength = 1;
        };
        const onLeave = () => (mouse.current.strength = 0);
        const onUp = (e: PointerEvent) => e.pointerType === "touch" && onLeave();
        window.addEventListener("pointermove", onMove);
        document.addEventListener("pointerleave", onLeave);
        window.addEventListener("pointerup", onUp);
        return () => {
            window.removeEventListener("pointermove", onMove);
            document.removeEventListener("pointerleave", onLeave);
            window.removeEventListener("pointerup", onUp);
        };
    }, []);

    useFrame((_, delta) => {
        const u = material.current?.uniforms;
        if (!u || !points.current) return;
        const p = state.current?.progress ?? 0;
        const smooth = (a: number, b: number, x: number) => {
            const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
            return t * t * (3 - 2 * t);
        };

        u.uTime.value += delta;
        u.uMorph.value = THREE.MathUtils.damp(u.uMorph.value, smooth(0.06, 0.45, p), 6, delta);
        u.uSignal.value = smooth(0.3, 0.55, p);
        u.uPixelRatio.value = gl.getPixelRatio();
        u.uTextScale.value = Math.min(viewport.width * 0.88, 11);
        // cursor influence is tuned for a ~9 unit wide name; shrink it on narrow screens
        u.uMouseScale.value = Math.min(1, u.uTextScale.value / 9);
        u.uCircuitScale.value = Math.min(viewport.width * 0.45, viewport.height * 0.62);

        const tilt = smooth(0.45, 0.95, p);
        const g = points.current;
        g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -tilt * 0.95, 5, delta);
        g.rotation.z = THREE.MathUtils.damp(g.rotation.z, tilt * 0.35, 5, delta);
        g.rotation.y = Math.sin(u.uTime.value * 0.25) * 0.06 * (1 - tilt * 0.5);
        g.position.y = THREE.MathUtils.damp(g.position.y, -tilt * viewport.height * 0.12, 5, delta);

        const m = mouse.current;
        m.current.lerp(m.target, 1 - Math.exp(-delta * 10));
        (u.uMouse.value as THREE.Vector2).set((m.current.x * viewport.width) / 2, (m.current.y * viewport.height) / 2);
        u.uMouseStrength.value = THREE.MathUtils.damp(u.uMouseStrength.value, m.strength, 4, delta);
    });

    return (
        <points ref={points} geometry={geometry}>
            <shaderMaterial
                ref={material}
                vertexShader={vertex}
                fragmentShader={fragment}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}
