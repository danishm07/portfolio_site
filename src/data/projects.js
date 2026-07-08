export const aboutMe = {
  id: 'about',
  no: null,
  title: 'About Me',
  medium: null,
  art: '/art/about.jpg',
  body: `Hi, I'm Danish. I'm currently a computer science undergrad working as an AI intern, but if I **really** had to introduce myself, it would be as an engineer that wants to tell stories.

I started making things as a little kid and never really looked back. Writing stories, being on my middle school's Lego Robotics team, building Unity games for my friends, a voice-activated mock-JARVIS — each one was just an excuse to build and understand something I thought was cool. I realized I have a hard time taking things at face value, and have to know exactly how they work and why they matter, which can both make things take much longer than they need to and produce better work that I'm proud of.

That's pulled me into some interesting experiences since. Spending months trying to find where guilt lives in a language model. Joining my school's startup accelerator at the start of freshman year having no idea what to do. Deriving PPO agents by hand **after** the working implementation because not understanding the working code just feels wrong. Researching how people talk to build a voice pipeline that holds conversations rather than simulating them.

The best way to explain my way of building is just making things that are "sound". Things that are robust, technically elegant and work smoothly. But at the same time, things that are worth looking at. Beauty on top of the functionality, where everything needs to be considered and matter, in a way that makes people want to come back to it like they do a Monet painting or a really wicked cup of coffee.

I'm interested in how anything learns anything, and what it means to "understand". The internal geometry of language models, RL agents, self rising robots, and the neuroscience connection between all of them and us as humans. Outside of work, I enjoy reading, playing piano, going down rabbit holes on the internet, and playing soccer (COYG).`,
  links: [
    { label: 'GitHub', url: 'https://github.com/danishm07' },
    { label: 'Resume', url: '/resume.pdf' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/danish-mohammed-2b959b1a6' },
  ],
  tech: null,
  github: null,
};

export const projects = [
  {
    id: 'saelit',
    no: '001',
    title: 'The Shape of Feeling',
    medium: 'Mechanistic interpretability · 2026',
    art: '/art/001.jpg',
    body: `The question I wanted to ask was whether emotion had a specific structure inside a language model, or whether it's just pattern-matching words with nothing underneath.

Most of the project is a record of things not working. CAA looked solid until the similarity matrix came back with joy and dread pointing in nearly the same direction. Logit Lens showed 90-100% divergence across every emotion pair, which looked real until a neutral control showed that any two different sentences diverge that much regardless of content. The SAE filter passed 502 features, most of which were tracking how the corpus was written rather than what it meant. I shifted from all of emotion to going deep on understanding how "guilt" as a concept is geometrically structured in Gemma-2-2B.

What's left after all of that was six causally verified features, connected through one central one, overlapping with other emotions as well. This was confirmed by forcing them active on prompts with no textual reason to invoke guilt, and watching guilt-shaped content appear anyway. The Ising correction revealed they form a chain rather than a cluster, with one hub feature most of the coordination runs through. The somatic test found the body-language signature leans toward shame more than guilt, which is consistent with how human psychology research describes the two emotions' overlap, though whether that means anything deep about the model or just reflects patterns in training text is unclear for now.

The most useful thing I learned was that each check was motivated by the previous result feeling slightly off, and following that feeling every time was the only thing that led anywhere real. The other thing I learned was to distrust my own tools. I'd been leaning on LLMs to help interpret results, and at some point realized they were making me feel more confident than I should have been. Learning to sit with uncertainty, go deep on reading real research and constantly checking everything myself made the eventual findings feel actually earned.`,
    tech: ['Gemma-2-2B', 'GemmaScope SAEs', 'CAA', 'Logit Lens', 'PyTorch', 'Neuronpedia'],
    github: 'https://github.com/danishmohammed/sae-lit',
    writeup: 'https://danishm07.github.io/shape_of_feeling/',
    role: 'Independent research',
    period: 'March – June 2026',
  },
  {
    id: 'kaplan',
    no: '002',
    title: 'Talon (Kaplan Institute)',
    medium: 'AI recruiting · Production engineering · 2026',
    art: '/art/002.jpg',
    body: `I joined the Kaplan Institute's startup accelerator, won a hackathon for an AI interviewer, and the venture head brought me on to build a platform where employers find students. I was one of two engineers on this project.


The core om my work was a real-time agentic voice pipeline: LiveKit and AWS Nova Sonic conducting interviews grounded in a student's vectorized profile and employer questions, stateful enough to hold a real conversation. Face tracking, timestamped storage so employers could replay specific moments, a full interview room UI with live transcription. The backend ran on FastAPI, Pinecone, and PostgreSQL. I built most of the architecture and spent a lot of time on the UI.

My most memorable moment is when an hour before the first stakeholder call, I was at a train station stitching together APIs on my MacBook, building a proof of concept that shouldn't have worked...but it did. 


By the time I left: 1,000+ student profiles, real AI interviews with companies such as Grainger and Boeing, and onboarding with around 20 or so other employers. I learned how to build under pressure and tight deadlines, meet demands, innovate under architectural constraints and talk to users.`,
    tech: ['LiveKit', 'AWS Nova Sonic', 'Bedrock', 'Pinecone', 'FastAPI', 'PostgreSQL', 'React', 'Cognito'],
    github: null,
    writeup: null,
    role: 'One of two engineers',
    period: 'Feb – May 2026',
  },
  {
    id: 'aarete',
    no: '003',
    title: 'AArete',
    medium: 'AI internship · 2026',
    art: '/art/003.jpg',
    body: `Building production agent pipelines at a management consulting firm is teaching me how to build tools where accuracy and speed are valued above all else, and what it means to build them for people who cannot tolerate them being wrong.

The core project I'm working on is an end-to-end Statement of Work generation pipeline, with LangGraph orchestrating Claude Sonnet and Haiku over AWS Bedrock Knowledge Bases, ingesting client documents, retrieving relevant context and producing firm-specific SOWs, exposed firm-wide as an MCP tool. Getting it fast enough to be usable meant building caching and parallelized processing nodes. Getting it accurate enough to be trusted meant building evaluation infrastructure from historical SOW documents as a train/test set, an LLM-as-judge scoring harness, and constant iteration on prompts and node logic. The feedback loop from "a real consultant will use this output" makes you much more careful about what you ship. Free coffee is also a very nice perk.

Beyond the technical, I'm also learning how to work with fast-paced teams. On the consulting side, I'm finding that talking to people — other team members, clients — is really interesting, especially when you try to see from their various perspectives.`,
    tech: ['LangGraph', 'AWS Bedrock', 'Claude Sonnet/Haiku', 'AgentCore', 'MCP', 'EC2', 'Textract'],
    github: null,
    writeup: null,
    role: 'AI & Data Science Intern',
    period: 'Jun 2026 – present',
  },
  {
    id: 'tomea',
    no: '004',
    title: 'Tomea',
    medium: 'Agentic systems · 2025–2026',
    art: '/art/004.jpg',
    body: `The idea started simple: give the system an ArXiv paper ID, get back a working PyTorch implementation. The problem is that LLM-generated code fails constantly and in ways that are hard to predict, which I found out the hard way: tensor shape mismatches, CUDA conflicts, wrong assumptions about API signatures. You can't just retry.

The Synthesize-Execute-Heal loop was the orchestration I worked the most on: one agent generates the implementation, a separate heuristic agent reads the runtime error, diagnoses the failure mode, and patches it. Different harnesses for different paper types. Scaled to Modal serverless GPUs so benchmarks could run in parallel. Tested on transformer variants, diffusion models and RL algorithms.

I was mostly stressed out the whole time, if I'm honest. Building the right harnesses for different paper types was the real headbutting part — figuring out how to evaluate a diffusion model implementation versus an RL one requires different logic entirely. I never fully solved it. But the synthesize-execute-heal structure is real and it works, and learning to build that loop on Modal infrastructure was worth the stress.

This project introduced me to the venture head at IIT/The Kaplan Institute, who'd become a close friend and mentor. I learned how to reach out to real researchers and engineers, and ended up talking with people at AI2 and HuggingFace about constant improvements and whether what I was building was actually useful. It didn't become the research tool I'd hoped it would. But it taught me more than most things that did work out, and it was just fun to see how far I could take it.`,
    tech: ['Python', 'PyTorch', 'LangChain', 'Modal', 'ArXiv API', 'Rich TUI'],
    github: 'https://github.com/danishm07/tomea',
    writeup: null,
    role: 'Independent project',
    period: 'Fall 2025 – Feb 2026',
  },
  {
    id: 'marlts',
    no: '005',
    title: 'MARLTS',
    medium: 'Reinforcement learning · 2025',
    art: '/art/005.jpg',
    body: `While building the trading system was very interesting, the part I honed in on was that I didn't understand PPO well enough. I had to derive it by hand to fix that.

I started with a working implementation. Agents trained, graphs went up, Sharpe ratio improved against the baselines. But I kept having the feeling that I was running code I didn't actually understand. So I sat down and worked through the clipping, the advantage estimate, why the surrogate objective is bounded the way it is. Wrote it out. The handwritten derivation is on GitHub because that felt like the real work.

The multi-agent environment itself was interesting too — a market maker, a mean-reversion agent, a golden ratio agent, and the PPO agent, all trading against each other on AAPL data going back 8 years. Watching how they each behaved under different conditions taught me more about how RL agents actually learn than the Sharpe numbers did. The graphs going up and down was really fun too.`,
    tech: ['Python', 'PyTorch', 'NumPy', 'PPO'],
    github: 'https://github.com/danishm07/MARLTS',
    writeup: null,
    role: 'Independent project',
    period: 'Fall 2025',
  },
];

export const cards = [aboutMe, ...projects];

export function getCardById(id) {
  return cards.find((c) => c.id === id);
}

export function getProjectBySlug(slug) {
  return projects.find((p) => p.id === slug);
}
