import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export const reducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isTouch = typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;

export const isSmallScreen = typeof window !== "undefined" && window.innerWidth < 768;
