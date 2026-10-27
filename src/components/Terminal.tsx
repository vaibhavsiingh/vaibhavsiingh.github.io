import { useEffect, useRef, useState } from "react";

import { experience, featured, profile, skills } from "../content";

type Line = { kind: "cmd" | "out"; text: string };

const HELP = `available commands:
  whoami        who is this guy
  ls            list featured projects
  open <n>      open project n on GitHub
  experience    where i've worked
  skills        what i use
  contact       how to reach me
  sudo hire     you know what this does
  snake         play snake
  clear         clear the screen
  exit          close the terminal`;

export function Terminal({ onClose, onSnake }: { onClose: () => void; onSnake: () => void }) {
    const [lines, setLines] = useState<Line[]>([{ kind: "out", text: "vsh 1.0, type 'help' to get started." }]);
    const [value, setValue] = useState("");
    const history = useRef<string[]>([]);
    const cursor = useRef(0);
    const input = useRef<HTMLInputElement>(null);
    const out = useRef<HTMLDivElement>(null);

    useEffect(() => {
        input.current?.focus();
    }, []);
    useEffect(() => {
        out.current?.scrollTo(0, out.current.scrollHeight);
    }, [lines]);

    const run = (raw: string) => {
        const cmd = raw.trim();
        const [name, ...args] = cmd.split(/\s+/);
        const say = (text: string) => setLines((l) => [...l, { kind: "cmd", text: `$ ${raw}` }, { kind: "out", text }]);
        if (cmd) history.current.push(cmd);
        cursor.current = history.current.length;

        switch (name) {
            case "":
                return setLines((l) => [...l, { kind: "cmd", text: "$" }]);
            case "help":
                return say(HELP);
            case "whoami":
                return say(`${profile.name}. ${profile.role}.\n${profile.tagline}`);
            case "ls":
                return say(featured.map((p, i) => `${i + 1}  ${p.title}`).join("\n"));
            case "open": {
                const p = featured[Number(args[0]) - 1];
                if (!p?.link) return say("usage: open <n>   (see `ls`)");
                window.open(p.link, "_blank", "noreferrer");
                return say(`opening ${p.title}...`);
            }
            case "experience":
                return say(experience.map((j) => `${j.when.padEnd(22)}${j.org}`).join("\n"));
            case "skills":
                return say(skills.join(", "));
            case "contact":
                return say(`mail:     ${profile.email}\ngithub:   ${profile.github}\nlinkedin: ${profile.linkedin}`);
            case "sudo":
                if (args.join(" ").startsWith("hire")) {
                    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent("We'd like to hire you")}`;
                    return say("[sudo] permission granted. opening your mail client... 🎉");
                }
                return say("nice try.");
            case "rm":
                return say("rm: refusing to delete my own portfolio, thanks.");
            case "snake":
                onClose();
                return onSnake();
            case "clear":
                return setLines([]);
            case "exit":
                return onClose();
            default:
                return say(`vsh: command not found: ${name}. try 'help'.`);
        }
    };

    return (
        <div className="term" role="dialog" aria-label="Terminal">
            <div className="term-bar">
                <span>vaibhav@portfolio: ~</span>
                <button type="button" onClick={onClose} aria-label="Close terminal">
                    ×
                </button>
            </div>
            <div className="term-out" ref={out}>
                {lines.map((l, i) => (
                    <div key={i} className={l.kind === "cmd" ? "cmd" : ""}>
                        {l.text}
                    </div>
                ))}
            </div>
            <form
                className="term-in"
                onSubmit={(e) => {
                    e.preventDefault();
                    run(value);
                    setValue("");
                }}
            >
                <span>$</span>
                <input
                    ref={input}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                        const h = history.current;
                        if (e.key === "Escape") onClose();
                        if (e.key === "ArrowUp" && cursor.current > 0) setValue(h[--cursor.current]);
                        if (e.key === "ArrowDown") {
                            cursor.current = Math.min(h.length, cursor.current + 1);
                            setValue(h[cursor.current] ?? "");
                        }
                    }}
                    aria-label="Terminal input"
                    autoComplete="off"
                    spellCheck={false}
                />
            </form>
        </div>
    );
}
