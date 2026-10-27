// All site copy lives here. Edit this file to update the portfolio.

export const profile = {
    name: "Vaibhav Singh",
    first: "VAIBHAV",
    pronunciation: "/vai-bhav/",
    audio: "/assets/name-pro.mp3",
    photo: "/assets/VS.webp",
    photoFallback: "/assets/VS.jpg",
    email: "vaibhavsingh84334@gmail.com",
    github: "https://github.com/vaibhavsiingh",
    linkedin: "https://www.linkedin.com/in/vaibhav-singh-iitb/",
    // Leave empty to hide the resume button.
    resume: "",
    tagline: "I make computers go fast. Sometimes they even listen.",
    role: "CS @ IIT Bombay · systems · LLM inference",
};

export const about =
    "I'm a CS undergrad at IIT Bombay who likes living close to the metal. I write kernels (the OS kind and the CUDA kind), squeeze LLMs until they run faster, build compilers, and occasionally convince packets to skip the kernel entirely. When I'm not doing that, I'm doing Codeforces.";

export const stats = [
    { value: "AIR 100", label: "JEE Advanced, out of 250k+" },
    { value: "8.85", label: "CGPA · Honors in CSE" },
    { value: "1723", label: "Codeforces Expert" },
    { value: "1 of 14", label: "Jane Street SEE, India" },
];

export type Project = {
    part: string;
    title: string;
    blurb: string;
    stat: { value: string; label: string };
    points: string[];
    tags: string[];
    link?: string;
    color: string;
};

export const featured: Project[] = [
    {
        part: "SPEC-DEC / 2026",
        title: "Speculative Decoding",
        blurb: "A tiny model guesses, a big model checks. Everyone goes home early.",
        stat: { value: "3.5×", label: "faster than baseline" },
        points: [
            "Fine-tuned Qwen2.5-0.5B as a draft model for Qwen2.5-7B, 92% token acceptance",
            "Plugged into a custom KV-cache pipeline for a 3.5× end-to-end gain",
        ],
        tags: ["PyTorch", "LLMs", "KV cache"],
        link: "https://github.com/vaibhavsiingh/distill-spec-decode",
        color: "var(--blue)",
    },
    {
        part: "XDP-LB / 2026",
        title: "Kernel-Bypass Load Balancer",
        blurb: "Packets get forwarded before the kernel even knows they arrived.",
        stat: { value: "~10s ns", label: "per packet" },
        points: [
            "Layer-4 LB in eBPF/XDP with Maglev consistent hashing on the 5-tuple",
            "Direct Server Return, plus a userspace control plane doing health checks and live BPF map updates",
        ],
        tags: ["C", "eBPF", "XDP", "libbpf"],
        link: "https://github.com/vaibhavsiingh/xdp-load-balancer",
        color: "var(--coral)",
    },
    {
        part: "CUDA-LLM / 2026",
        title: "LLM Inference in CUDA",
        blurb: "Hand-rolled GEMM and FlashAttention kernels, because cuBLAS can't have all the fun.",
        stat: { value: "1.87×", label: "faster token generation" },
        points: [
            "Tiled, coalesced matmul kernels matching cuBLAS performance",
            "IO-aware FlashAttention kernel, plus KV caching and prefix reuse in nanoGPT",
        ],
        tags: ["CUDA", "C++", "nanoGPT"],
        link: "https://github.com/vaibhavsiingh/sysml-assignments",
        color: "var(--lime)",
    },
    {
        part: "PQ-IDX / 2026",
        title: "Parquet Indexing for Postgres",
        blurb: "A global B+ tree over a data lake, so queries stop reading every file ever written.",
        stat: { value: "B+", label: "tree over Parquet" },
        points: [
            "Custom PostgreSQL extension with a global secondary index over Parquet files",
            "Index-aware FDW execution with zone-map pruning and async background indexing",
        ],
        tags: ["C", "PostgreSQL", "FDW", "Parquet"],
        link: "https://github.com/vaibhavsiingh/parquet-indexing",
        color: "var(--violet)",
    },
    {
        part: "SCLP / 2026",
        title: "Compiler for a C-like Language",
        blurb: "Text goes in, MIPS assembly comes out. Usually the right MIPS assembly.",
        stat: { value: "C → MIPS", label: "end to end" },
        points: [
            "Flex/Bison front end with type checking and scope resolution",
            "Multi-stage IR lowering down to register-level ops and working MIPS codegen",
        ],
        tags: ["C", "Flex", "Bison", "MIPS"],
        link: "https://github.com/vaibhavsiingh/sclp",
        color: "var(--blue)",
    },
    {
        part: "XV6 / 2025",
        title: "Hacking on xv6",
        blurb: "Teaching a tiny Unix new tricks: COW fork, demand paging and threads.",
        stat: { value: "0", label: "kernel panics (eventually)" },
        points: [
            "Copy-on-write fork and demand-paged virtual memory",
            "Kernel threads, semaphores, barriers and a priority + time-slice scheduler",
        ],
        tags: ["C", "OS", "Concurrency"],
        link: "https://github.com/vaibhavsiingh/os-lab-work",
        color: "var(--coral)",
    },
];

export type MiniProject = { title: string; note: string; tags: string[]; link?: string };

export const others: MiniProject[] = [
    {
        title: "Multithreaded Plagiarism Detector",
        note: "Rolling hashes + k-grams over thousands of submissions",
        tags: ["C++", "Threads"],
        link: "https://github.com/vaibhavsiingh/plagiarism_checker",
    },
    {
        title: "Optimal 3D Bin Packing",
        note: "MILP + heuristics for FedEx cargo. 2nd place, Inter IIT Tech Meet",
        tags: ["Python", "Gurobi"],
    },
    {
        title: "Link-State Protocol Emulator",
        note: "C++ TCP oracle + Java async UDP nodes, flooding and convergence",
        tags: ["C++", "Java", "Networking"],
        link: "https://github.com/vaibhavsiingh/link-state-emulator",
    },
    {
        title: "Web Server Performance Modeling",
        note: "Discrete-event simulator + an ANN trained on 1400 runs",
        tags: ["Python", "Queueing"],
        link: "https://github.com/vaibhavsiingh/webserver-performance-analysis",
    },
    {
        title: "Cryptographic Hardware Security",
        note: "PRESENT cipher in Verilog, CPA and fault attacks on AES",
        tags: ["Verilog", "Side channels"],
    },
    {
        title: "Multi-Scale Object Detection (FPN)",
        note: "Feature Pyramid Network backbone on Faster R-CNN",
        tags: ["PyTorch", "Vision"],
    },
    {
        title: "2-VASS Reachability",
        note: "A PSPACE-complete problem, made less painful with NNLS",
        tags: ["Python", "Theory"],
        link: "https://github.com/vaibhavsiingh/2-VASS-Reachability",
    },
    {
        title: "Agentic Code Benchmark",
        note: "Evaluating how coding agents recover from failure",
        tags: ["LLMs", "Eval"],
        link: "https://github.com/vaibhavsiingh/agentic-code-benchmark",
    },
    {
        title: "polycheck-runner",
        note: "VS Code extension for a polyregular model checker",
        tags: ["TypeScript"],
        link: "https://github.com/vaibhavsiingh/polycheck-runner",
    },
    {
        title: "Brainf*ck Interpreter",
        note: "Eight instructions, infinite suffering",
        tags: ["C"],
        link: "https://github.com/vaibhavsiingh/BF-interpreter",
    },
];

export type Job = { when: string; org: string; role: string; where: string; points: string[]; badge?: string };

export const experience: Job[] = [
    {
        when: "May – Jul 2026",
        org: "Goldman Sachs",
        role: "Software Engineering Intern",
        where: "Bengaluru · Electronic Trading",
        badge: "PPO 🎉",
        points: [
            "Built an LLM pipeline that classifies code changes for trading-control scoping",
            "Master-worker concurrency model cut latency by 90%",
            "Zero false negatives across 50+ controls, 85% less manual scoping",
        ],
    },
    {
        when: "May 2026 – now",
        org: "IIT Bombay",
        role: "Research · Sparse Attention for LLM Inference",
        where: "with Prof. Mythili Vutukuru",
        points: [
            "Sparse attention kernels with KV-cache offloading: 1.8× over dense",
            "Hacked vLLM's attention backend: 40% less GPU memory, 4× longer context",
        ],
    },
    {
        when: "Dec 2025",
        org: "Jane Street",
        role: "SEE Program · Software Engineering",
        where: "Hong Kong",
        badge: "1 of 14",
        points: ["Picked as one of 14 students in India. Learned OCaml and to love functional programming"],
    },
    {
        when: "Oct 2025 – Jul 2026",
        org: "Placement Cell, IIT Bombay",
        role: "Software Developer",
        where: "Mumbai",
        points: ["Kept the placement portal alive for 2,000+ students and 400+ companies during peak season"],
    },
    {
        when: "May – Jul 2025",
        org: "University of Warsaw",
        role: "Research · Compressed String Processing",
        where: "Poland · with Mikołaj Bojańczyk",
        points: ["Ran DFA/SST logic directly on compressed strings: 2–2.5× throughput, still linear time"],
    },
    {
        when: "2023 – 2027",
        org: "IIT Bombay",
        role: "B.Tech, Computer Science & Engineering",
        where: "Honors in CSE · Minor in ML & Data Science",
        points: ["CGPA 8.85 / 10", "TA for CSO606 and CS101 · Institute Student Mentor"],
    },
];

export const skills = [
    "C/C++",
    "Python",
    "CUDA",
    "Haskell",
    "OCaml",
    "SQL",
    "Verilog",
    "Bash",
    "JavaScript",
    "TypeScript",
    "Java",
    "Assembly",
    "MIPS",
    "Flex/Bison",
    "PyTorch",
    "TensorFlow",
    "scikit-learn",
    "Pandas",
    "SciPy",
    "Matplotlib",
    "Jupyter",
    "vLLM",
    "eBPF/XDP",
    "libbpf",
    "PostgreSQL",
    "Linux",
    "GDB",
    "perf",
    "Docker",
    "Git",
    "Gurobi",
    "LaTeX",
    "React",
    "three.js",
    "SageMath",
    "Wireshark",
    "NumPy",
];

export const stickers = ["ask me about Warsaw", "currently: sparse attention", "it works on my machine"];
