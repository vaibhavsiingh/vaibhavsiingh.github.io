import { useEffect, useState } from "react";

const LINES = [
    "VS-BIOS v2.0  (c) Vaibhav Singh",
    "CPU: caffeine-powered @ 3.0 cups/day ........ [ OK ]",
    "Memory test: warming up the KV cache ........ [ OK ]",
    "Mounting /dev/projects ...................... [ OK ]",
    "Loading kernel modules: cuda, ebpf, xv6 ..... [ OK ]",
    "Starting portfolio.service ...................",
];

/** A ~1 second fake boot screen, shown once per browser session. */
export function BootLoader({ onDone }: { onDone: () => void }) {
    const [shown, setShown] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setShown((n) => n + 1), 140);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        if (shown > LINES.length + 1) onDone();
    }, [shown, onDone]);

    return (
        <div className="boot" role="status" aria-label="Loading">
            {LINES.slice(0, shown).map((l) => {
                const ok = l.endsWith("[ OK ]");
                return (
                    <div key={l}>
                        {ok ? l.slice(0, -6) : l}
                        {ok && <span className="ok">[ OK ]</span>}
                    </div>
                );
            })}
            {shown > LINES.length && <div className="ok">ready. welcome :)</div>}
        </div>
    );
}
