import { useCallback, useEffect, useState } from "react";
import Lenis from "lenis";

import { BootLoader } from "./components/BootLoader";
import { Cursor } from "./components/Cursor";
import { Nav } from "./components/Nav";
import { Snake } from "./components/Snake";
import { Terminal } from "./components/Terminal";
import { gsap, reducedMotion, ScrollTrigger } from "./lib/motion";
import { About } from "./sections/About";
import { Contact } from "./sections/Contact";
import { Experience } from "./sections/Experience";
import { Hero } from "./sections/Hero";
import { Others } from "./sections/Others";
import { Skills } from "./sections/Skills";
import { Work } from "./sections/Work";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

function firstVisit() {
    try {
        if (sessionStorage.getItem("booted")) return false;
        sessionStorage.setItem("booted", "1");
    } catch {
        // storage blocked; just show the boot screen
    }
    return true;
}

const shouldBoot = !reducedMotion && firstVisit();

export function App() {
    const [booting, setBooting] = useState(shouldBoot);
    const [terminal, setTerminal] = useState(false);
    const [snake, setSnake] = useState(false);
    const closeSnake = useCallback(() => setSnake(false), []);
    const doneBooting = useCallback(() => setBooting(false), []);

    useEffect(() => {
        // fonts change the height of everything; re-measure scroll triggers once they're in
        document.fonts.ready.then(() => ScrollTrigger.refresh());
        window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
    }, []);

    useEffect(() => {
        if (reducedMotion) return;
        const lenis = new Lenis({ anchors: true, lerp: 0.1 });
        lenis.on("scroll", ScrollTrigger.update);
        const raf = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(raf);
        gsap.ticker.lagSmoothing(0);
        return () => {
            gsap.ticker.remove(raf);
            lenis.destroy();
        };
    }, []);

    useEffect(() => {
        let seq: string[] = [];
        const onKey = (e: KeyboardEvent) => {
            const typing = (e.target as HTMLElement).closest("input, textarea");
            if (e.key === "`" || e.key === "~") {
                if (typing) return;
                e.preventDefault();
                setTerminal((t) => !t);
                return;
            }
            if (typing) return;
            seq = [...seq, e.key.length === 1 ? e.key.toLowerCase() : e.key].slice(-KONAMI.length);
            if (seq.join() === KONAMI.join()) {
                seq = [];
                setSnake(true);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    return (
        <>
            {booting && <BootLoader onDone={doneBooting} />}
            <Cursor />
            <Nav onTerminal={() => setTerminal((t) => !t)} />
            <main>
                <Hero />
                <About />
                <Work />
                <Others />
                <Experience />
                <Skills />
            </main>
            <Contact />
            {terminal && <Terminal onClose={() => setTerminal(false)} onSnake={() => setSnake(true)} />}
            {snake && <Snake onClose={closeSnake} />}
        </>
    );
}
