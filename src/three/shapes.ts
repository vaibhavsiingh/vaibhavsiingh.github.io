// Point-cloud generators for the hero: the name (as text) and a circuit board.
// Both return `count` points so the particles can morph between them 1:1.

type Rng = () => number;

export function rng(seed = 7): Rng {
    let s = seed >>> 0;
    return () => {
        s = (s + 0x6d2b79f5) >>> 0;
        let t = s;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** Points filling the glyphs of `text`, normalised so the text is 1 unit wide and centred. */
export function sampleText(text: string, count: number, font: string, random: Rng): Float32Array {
    const W = 1400;
    const H = 360;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let size = 300;
    ctx.font = `800 ${size}px ${font}`;
    const measured = ctx.measureText(text).width;
    size = Math.floor(size * Math.min(1, (W * 0.96) / measured));
    ctx.font = `800 ${size}px ${font}`;
    ctx.fillText(text, W / 2, H / 2);

    const data = ctx.getImageData(0, 0, W, H).data;
    const filled: number[] = [];
    let minX = W;
    let maxX = 0;
    for (let y = 0; y < H; y += 2) {
        for (let x = 0; x < W; x += 2) {
            if (data[(y * W + x) * 4 + 3] > 128) {
                filled.push(x, y);
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
            }
        }
    }

    const width = Math.max(1, maxX - minX);
    const cx = (minX + maxX) / 2;
    const out = new Float32Array(count * 3);
    const n = filled.length / 2;
    for (let i = 0; i < count; i++) {
        const k = Math.floor(random() * n) * 2;
        out[i * 3] = (filled[k] - cx + (random() - 0.5) * 2) / width;
        out[i * 3 + 1] = -(filled[k + 1] - H / 2 + (random() - 0.5) * 2) / width;
        out[i * 3 + 2] = (random() - 0.5) * 0.01;
    }
    return out;
}

type Seg = { a: [number, number]; b: [number, number] };
type Trace = { segs: Seg[]; length: number; signal: boolean; phase: number };

function polyline(points: [number, number][], signal: boolean, phase = 0): Trace {
    const segs: Seg[] = [];
    let length = 0;
    for (let i = 0; i < points.length - 1; i++) {
        segs.push({ a: points[i], b: points[i + 1] });
        length += Math.hypot(points[i + 1][0] - points[i][0], points[i + 1][1] - points[i][1]);
    }
    return { segs, length, signal, phase };
}

function rect(cx: number, cy: number, w: number, h: number): Trace {
    return polyline(
        [
            [cx - w / 2, cy - h / 2],
            [cx + w / 2, cy - h / 2],
            [cx + w / 2, cy + h / 2],
            [cx - w / 2, cy + h / 2],
            [cx - w / 2, cy - h / 2],
        ],
        false,
    );
}

function ring(cx: number, cy: number, r: number): Trace {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 12; i++) {
        const t = (i / 12) * Math.PI * 2;
        pts.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r]);
    }
    return polyline(pts, false);
}

export type Circuit = {
    positions: Float32Array;
    /** Distance along the trace, 0..1, for the travelling signal. -1 for non-signal points. */
    along: Float32Array;
    /** Per-trace offset so signals on different traces are out of sync. */
    phase: Float32Array;
};

/**
 * A board roughly 2 units wide x 1.2 tall: a central chip with pins, traces routed
 * outward with 45° bends ending in vias, and a few small components.
 */
export function buildCircuit(count: number, random: Rng): Circuit {
    const traces: Trace[] = [];
    const chipW = 0.42;
    const chipH = 0.3;
    traces.push(rect(0, 0, chipW, chipH));
    traces.push(rect(0, 0, chipW * 0.62, chipH * 0.5));

    const pins = 7;
    const BX = 1;
    const BY = 0.6;
    for (let i = 0; i < pins; i++) {
        const t = (i + 0.5) / pins - 0.5;
        // top and bottom edges
        for (const dir of [1, -1]) {
            const x0 = t * chipW * 0.9;
            const y0 = (dir * chipH) / 2;
            const up = 0.06 + random() * 0.12;
            const bend = (random() - 0.5) * 0.5 + t * 1.2;
            const y1 = y0 + dir * up;
            const x2 = x0 + bend;
            const y2 = y1 + dir * Math.abs(bend);
            const y3 = dir * (BY * (0.7 + random() * 0.3));
            const pts: [number, number][] = [
                [x0, y0],
                [x0, y1],
                [x2, Math.abs(y2) < Math.abs(y3) ? y2 : y3],
                [x2, y3],
            ];
            traces.push(polyline(pts, true, random()));
            traces.push(ring(x2, y3, 0.014));
        }
        // left and right edges
        for (const dir of [1, -1]) {
            const y0 = t * chipH * 0.9;
            const x0 = (dir * chipW) / 2;
            const out = 0.05 + random() * 0.1;
            const bend = (random() - 0.5) * 0.3 + t * 0.6;
            const x1 = x0 + dir * out;
            const y2 = Math.max(-BY * 0.9, Math.min(BY * 0.9, y0 + bend));
            const x2 = x1 + dir * Math.abs(bend);
            const x3 = dir * (BX * (0.75 + random() * 0.25));
            traces.push(
                polyline(
                    [
                        [x0, y0],
                        [x1, y0],
                        [x2, y2],
                        [x3, y2],
                    ],
                    true,
                    random(),
                ),
            );
            traces.push(ring(x3, y2, 0.014));
        }
    }

    // a few passive components (little rectangles) scattered near the edges
    for (let i = 0; i < 10; i++) {
        const x = (random() - 0.5) * 1.8;
        const y = (random() > 0.5 ? 1 : -1) * (0.3 + random() * 0.25);
        if (Math.abs(x) < chipW && Math.abs(y) < chipH) continue;
        traces.push(rect(x, y, 0.06, 0.025));
    }

    const total = traces.reduce((s, t) => s + t.length, 0);
    const positions = new Float32Array(count * 3);
    const along = new Float32Array(count);
    const phase = new Float32Array(count);
    let idx = 0;
    // small share of points sprinkled inside the chip body so it reads as solid
    const fillCount = Math.floor(count * 0.08);
    const traceCount = count - fillCount;

    for (const tr of traces) {
        const n = Math.max(2, Math.round((tr.length / total) * traceCount));
        for (let j = 0; j < n && idx < traceCount; j++) {
            let d = random() * tr.length;
            const u = d / tr.length;
            for (const s of tr.segs) {
                const len = Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]);
                if (d <= len || s === tr.segs[tr.segs.length - 1]) {
                    const f = len > 0 ? Math.min(1, d / len) : 0;
                    positions[idx * 3] = s.a[0] + (s.b[0] - s.a[0]) * f + (random() - 0.5) * 0.004;
                    positions[idx * 3 + 1] = s.a[1] + (s.b[1] - s.a[1]) * f + (random() - 0.5) * 0.004;
                    positions[idx * 3 + 2] = 0;
                    along[idx] = tr.signal ? u : -1;
                    phase[idx] = tr.phase;
                    break;
                }
                d -= len;
            }
            idx++;
        }
    }
    while (idx < count) {
        positions[idx * 3] = (random() - 0.5) * chipW * 0.95;
        positions[idx * 3 + 1] = (random() - 0.5) * chipH * 0.95;
        positions[idx * 3 + 2] = (random() - 0.5) * 0.02;
        along[idx] = -1;
        idx++;
    }
    return { positions, along, phase };
}
