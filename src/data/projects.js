export const projects = [
  {
    id: 'saelit',
    no: '001',
    title: 'The Shape of Feeling',
    medium: 'Mechanistic interpretability · 2026',
    art: '/art/001.jpg',
    body: `Research into how guilt is represented inside Gemma-2-2B.
Iterated through CAA, Logit Lens, and GemmaScope SAEs — building on each failure.
Found six causally verified features connected in an Ising chain structure,
confirmed via bootstrap CIs and causal steering experiments.`,
    tech: ['Gemma-2-2B', 'GemmaScope SAEs', 'CAA', 'Logit Lens', 'PyTorch', 'Neuronpedia'],
    github: 'https://github.com/...',
    demo: null,
  },
  {
    id: 'kaplan',
    no: '002',
    title: 'AI Interview Platform',
    medium: 'Production engineering · 2026',
    art: '/art/002.jpg',
    body: `Real-time agentic voice pipeline conducting interviews from a student's
vectorized profile and employer questions — stateful, natural, deployed.
Face tracking, timestamped employer replay, full interview room UI.
1,000+ student profiles. Real interviews with Grainger and Boeing.`,
    tech: ['LiveKit', 'AWS Nova Sonic', 'Bedrock', 'pgvector', 'FastAPI', 'React'],
    github: 'https://github.com/...',
    demo: null,
  },
  {
    id: 'aarete',
    no: '003',
    title: 'Agent Infrastructure',
    medium: 'Internship · AWS Bedrock · 2026',
    art: '/art/003.jpg',
    body: `Agent pipelines at AArete for consulting use cases.
Core project: SOW document generation grounded in stored AWS Knowledge Base context.
Custom MCP servers for firm-wide Claude integration.`,
    tech: ['Bedrock', 'AgentCore', 'LangGraph', 'MCP', 'EC2', 'Textract'],
    github: null,
    demo: null,
  },
  {
    id: 'marlts',
    no: '004',
    title: 'MARLTS',
    medium: 'Reinforcement learning · 2025',
    art: '/art/004.jpg',
    body: `Multi-Agent RL Trading System.
PPO implemented from scratch with hand-derived policy gradients.
Trained on 8 years of market data.
Beat momentum and mean-reversion baselines on Sharpe ratio.`,
    tech: ['PyTorch', 'PPO', 'Policy Gradients', 'Python'],
    github: 'https://github.com/...',
    demo: null,
  },
  {
    id: 'wbengine',
    no: '005',
    title: 'wbengine',
    medium: 'Creative systems · 2025',
    art: '/art/005.jpg',
    body: `Rendering engine built for a specific aesthetic —
cel shading, halftone, ink fog shaders.
Python interface via pybind11.
LLM scene director via OpenRouter: describe a scene, watch it render.`,
    tech: ['C++', 'Raylib', 'GLSL', 'pybind11', 'OpenRouter'],
    github: 'https://github.com/...',
    demo: null,
  },
  {
    id: 'tomea',
    no: '006',
    title: 'Tomea',
    medium: 'Agentic systems · 2025',
    art: '/art/006.jpg',
    body: `ArXiv paper ID in, working PyTorch implementation out.
Synthesize-Execute-Heal loop — generates code, diagnoses runtime failures, patches.
Scaled to Modal serverless GPUs.`,
    tech: ['PyTorch', 'Modal', 'ArXiv API', 'LLM agents', 'Python'],
    github: 'https://github.com/...',
    demo: null,
  },
];

export function getProjectBySlug(slug) {
  return projects.find((p) => p.id === slug);
}
