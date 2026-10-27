import { profile } from "../content";

type Props = { onTerminal: () => void };

export function Nav({ onTerminal }: Props) {
    return (
        <nav className="nav">
            <a className="nav-logo" href="#top" aria-label="Back to top">
                VS
            </a>
            <div className="nav-links">
                <a href="#work">work</a>
                <a href="#experience" className="hide-sm">
                    experience
                </a>
                <a href="#contact">contact</a>
                {profile.resume && (
                    <a href={profile.resume} target="_blank" rel="noreferrer">
                        resume
                    </a>
                )}
                <button type="button" onClick={onTerminal} aria-label="Open terminal">
                    &gt;_
                </button>
            </div>
        </nav>
    );
}
