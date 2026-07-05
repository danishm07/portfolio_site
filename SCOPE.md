# Danish Mohammed — Portfolio Site Spec
*Author/scientist notes + elegant gallery. Nolan precision, Wes Anderson composition. Modern minimal.*

---

## Stack

- **Framework:** Next.js 14 (App Router)
- **Animation:** GSAP 3 + ScrollTrigger + Draggable (CDN or npm)
- **Carousel physics:** Vanilla JS + CSS 3D transforms (no library — full control)
- **Cursor effect:** Plain `<canvas>` API
- **Fonts:** Google Fonts — `Playfair Display` (serif, name + catalogue titles) + `DM Sans` (everything else)
- **Styling:** CSS Modules or plain CSS — no Tailwind
- **Hosting:** Vercel

No Three.js. No WebGL. No Framer Motion. The complexity lives in the interactions and curation, not the render pipeline.

---

## Palette

```
--cream:     #EDE7D9   /* background, always */
--ink:       #18160F   /* primary text */
--dust:      #9A9488   /* secondary text, nav */
--rule:      #C8C2B4   /* hairlines, borders */
--sage:      #6B826A   /* accent — used only on hover states and catalogue numbers */
```

One accent color. Used sparingly. Never decorative.

---

## Typography

```
Playfair Display — name, catalogue titles, modal project titles
  weights: 400, 400 italic

DM Sans — everything else: nav, metadata, descriptions, chips
  weights: 300, 400, 500

Monospace fallback for code fragments: IBM Plex Mono 300
```

The contrast between Playfair and DM Sans IS the personality. Don't introduce a third face.

---

## Page Structure

Single page. No routing except `/` and dynamic project slugs for OG/share metadata.

```
/
├── <Nav />               — fixed top, fades in on load
├── <Hero />              — name, descriptor, cursor-code canvas
├── <Carousel />          — 3D perspective card strip, full viewport height
└── <Footer />            — sparse: location, year, links
```

Project detail is a **card expansion** — the clicked card morphs into a full-screen overlay. No page navigation.

---

## Nav

```
Position: fixed, top 0, full width
Left:  "Danish Mohammed" — DM Sans 400, 10px, letter-spacing 0.14em, uppercase
Right: "GitHub"  "Resume"  "Email" — same spec, color: --dust

Height: 52px
Border-bottom: none (the page is already structured, no need to frame it twice)
Background: transparent, but blurs to rgba(237,231,217,0.88) + backdrop-filter: blur(12px) on scroll
```

---

## Hero Section

```
Height: 40vh minimum, centered vertically
Background: --cream
```

### Name block
```
"Danish"        — Playfair Display italic 400, ~52px, color: --ink
"Mohammed"      — Playfair Display 400 (upright), ~52px, color: --ink
                  The italic/upright split is the single typographic risk.
                  Two words, two weights. Intentional.

Below name:
  — thin horizontal rule, 28px wide, color: --rule, centered
  — "AI Engineer  ·  Chicago  ·  IIT Dec 2027"
    DM Sans 300, 10px, letter-spacing 0.16em, uppercase, color: --dust
```

### Cursor-code canvas
```
Position: absolute, inset 0, z-index 1 (behind text, z-index 2)
Behavior:
  - Columns of scrolling code lines (IBM Plex Mono 300, 8px)
  - Each column scrolls at slightly different speed
  - Lines are INVISIBLE except within a ~120px radius of the cursor
  - Reveal uses smooth ease: t*t*(3-2*t) falloff
  - Color when revealed: --sage at max 40% opacity
  - Cursor position lerped at 0.09 for lag/weight feel
  - On mouseleave: cursor snaps to -9999,-9999 (code disappears)

Code lines pool (real lines from actual projects):
  guilt_features = [13305, 11883]
  ising_chain.fit(activations)
  bootstrap_ci(n=1000)
  steering_vec = acts[layer]
  pearson_r = corr(f1, f2)
  ∇θ J(θ) = E[∇log π · A]
  sharpe = μ / σ
  livekit.connect(url, token)
  nova_sonic.stream(chunk)
  vec = bedrock.embed(text)
  mcp_server.register(fn)
  synthesize(paper_id)
  heal(error, traceback)
  #include <raylib.h>
  vec3 cel = floor(c*4.)/4.
  async def worker(self):
  optimizer.step()
  agent.run(task, ctx)
  rag_chain.invoke(question)
  await queue.join()
```

Hero fades in on load with GSAP: name chars stagger up from y:8 opacity:0, duration 0.9s, stagger 0.04s, ease "power3.out". Canvas fades in after name, delay 1.2s.

---

## Carousel

This is the core of the page. Full viewport height section below the hero.

### Physics model
*Reference: Codrops "Building a 3D Infinite Carousel" (Nov 2025)*

```js
// Key constants — tune these for the right feel
const MAX_ROTATION = 18   // deg — subtle, not Madrepunk aggressive
const MAX_DEPTH = 100     // px translateZ
const MIN_SCALE = 0.84    // side cards slightly smaller
const SCALE_RANGE = 0.16  // scale boost at center
const GAP = 36            // px between cards
const FRICTION = 0.88     // velocity decay — slightly heavy, deliberate
const WHEEL_SENS = 0.5
const DRAG_SENS = 1.0
```

Cards are positioned along X axis. Active card (index 0 from center) gets:
```css
transform: perspective(1100px) rotateY(0deg) translateZ(0px) scale(1.0);
opacity: 1;
```

Adjacent cards (±1):
```css
transform: perspective(1100px) rotateY(±18deg) translateZ(-100px) scale(0.84);
opacity: 0.55;
```

Far cards (±2, ±3): continue the progression. Cards beyond ±2 are hidden (opacity 0, pointer-events none).

Input: mouse wheel, trackpad, click-drag. Touch events for mobile.
Loop: infinite — cards wrap around. 6 cards = indices 0–5, mod math handles wrapping.

### Card anatomy

Each card: 320px wide × 420px tall at 1440px viewport. Scales proportionally.

```
┌─────────────────────────────┐
│                             │
│                             │
│      [Art image — fills     │
│       top 65% of card]      │
│       object-fit: cover     │
│                             │
│                             │
├─────────────────────────────┤  ← 0.5px --rule line
│  Cat. no. 001               │  DM Sans 300, 8px, --sage, letter-spacing 0.16em
│                             │
│  The Shape of Feeling       │  Playfair Display 400, 17px, --ink
│  Mechanistic interp · 2026  │  DM Sans 300, 10px, --dust
│                             │
└─────────────────────────────┘
```

Card background: --cream. Border: 0.5px solid --rule.
On hover (active card only): border-color transitions to --sage over 0.3s. No scale change on hover — the 3D transform already creates hierarchy.

### The art piece images

Placeholder: solid --dust rectangles. You fill in the actual artworks later.
Each image should be ~800×600px minimum, portrait or square preferred.
Store in `/public/art/` — `001.jpg`, `002.jpg`, etc.

### Projects data

```js
// /src/data/projects.js
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
]
```

---

## Card Expansion (Click Interaction)

*This is the "Option B" we settled on — card morphs into full-screen detail.*

### Mechanism
Use GSAP + `getBoundingClientRect()`. No Framer Motion layoutId — pure GSAP for performance and control.

On click:
1. Get card's current `getBoundingClientRect()` — store x, y, width, height
2. Create/reveal the `<DetailOverlay />` component, initially positioned and sized to match the card exactly (using fixed positioning)
3. GSAP `gsap.to()` animates the overlay from card dimensions to `{ top:0, left:0, width:'100vw', height:'100vh' }` with `duration: 0.55`, `ease: 'power3.inOut'`
4. Simultaneously: art image scales/translates to fill top half, text content fades in with stagger after expand completes
5. Carousel behind dims to opacity 0.15

On close (click backdrop or press Escape):
1. Reverse the animation — overlay shrinks back to card position
2. Carousel returns to full opacity
3. Overlay removed from DOM

### Detail overlay layout

```
┌──────────────────────────────────────────────────────┐
│  ╳ Close                                    [GitHub ↗]│  nav strip, DM Sans 300 9px
├──────────────────────────────────────────────────────┤
│                                                        │
│              [Art image — top ~45vh]                   │
│              object-fit: cover, full width             │
│                                                        │
├──────────────────────────────────────────────────────┤  ← 0.5px --rule
│  Cat. no. 001                                          │  DM Sans 300, 8px, --sage
│                                                        │
│  The Shape of Feeling                                  │  Playfair Display 400, 32px
│  Mechanistic interpretability · Spring/Summer 2026     │  DM Sans 300, 11px, --dust
│                                                        │
│  [rule]                                                │
│                                                        │
│  Research into how guilt is represented inside         │  Playfair Display 400 italic
│  Gemma-2-2B. Iterated through CAA, Logit Lens,         │  16px, --ink, line-height 1.85
│  and GemmaScope SAEs — building on each failure...     │  max-width: 560px
│                                                        │
│  [Gemma-2-2B] [GemmaScope SAEs] [CAA] [Logit Lens]    │  DM Sans 300, 8px chips
│               [PyTorch] [Neuronpedia]                  │  border: 0.5px --rule
│                                                        │
│  If demo images/video exist — they go here             │
│                                                        │
└──────────────────────────────────────────────────────┘
```

Max content width: 720px, centered. Padding: 2rem sides on mobile, auto on desktop.
Overlay background: --cream. No modal shadow — it IS the page now.

---

## Footer

```
Height: 64px
Layout: three columns — left, center, right
Left:   "Chicago, IL · 2026"   — DM Sans 300 9px --dust
Center: nothing (or a very thin horizontal rule 40px wide, --rule)
Right:  "GitHub · Resume · Email"   — DM Sans 300 9px --dust, spaced 1.5rem
```

---

## Animation System — Complete Sequence

### Page load
```
t=0.0s  Canvas fades in (opacity 0→1, duration 0.8s)
t=0.2s  Nav items fade in, staggered left→right (opacity 0→1, y: -4→0, duration 0.6s)
t=0.4s  "Danish" fades up (opacity 0→1, y: 6→0, duration 0.9s, ease power3.out)
t=0.55s "Mohammed" fades up (same, slight stagger)
t=0.7s  Rule line scales in (scaleX 0→1, duration 0.4s, ease power2.out)
t=0.85s Descriptor line fades in (opacity 0→1, duration 0.5s)
t=1.1s  Carousel cards fade in with stagger (each card: opacity 0→1, y: 20→0, duration 0.7s, stagger 0.08s)
```

### Scroll from hero to carousel
ScrollTrigger: as hero leaves viewport, hero content fades to opacity 0.4. Subtle, not jarring.

### Carousel idle
Active card has a barely perceptible float: `gsap.to(activeCard, { y: -4, duration: 2.5, yoyo: true, repeat: -1, ease: 'sine.inOut' })`. Stops when user interacts.

---

## Responsive

### Desktop (≥1200px)
Cards: 320×420px. Three visible. Spec as written above.

### Tablet (768–1199px)
Cards: 260×340px. Three visible (side cards more clipped).
Cursor-code canvas: reduce radius to 90px.

### Mobile (≤767px)
Carousel becomes a horizontal snap-scroll (CSS scroll-snap, no 3D transform).
Cards: 80vw × auto. One card visible at a time.
Cursor-code canvas: disabled (no mouse).
Card expansion: slides up from bottom (like a bottom sheet) instead of expanding in place.

---

## File Structure

```
/
├── src/
│   ├── app/
│   │   ├── layout.js         — fonts, meta, global CSS import
│   │   ├── page.js           — renders <Hero /> + <Carousel /> + <Footer />
│   │   └── globals.css       — CSS variables, resets, base typography
│   ├── components/
│   │   ├── Nav.jsx
│   │   ├── Hero.jsx          — name block + canvas cursor effect
│   │   ├── Carousel.jsx      — 3D carousel + drag/wheel logic
│   │   ├── Card.jsx          — individual carousel card
│   │   ├── DetailOverlay.jsx — expanding card detail view
│   │   └── Footer.jsx
│   ├── data/
│   │   └── projects.js       — project data array (above)
│   ├── hooks/
│   │   └── useCarousel.js    — carousel state, physics, input handling
│   └── lib/
│       └── cursorCode.js     — canvas cursor-code animation
├── public/
│   └── art/
│       ├── 001.jpg           — placeholder until you add real art
│       ├── 002.jpg
│       └── ...
└── package.json
```

---

## Build Order for Claude Code

Do these in order. Don't skip ahead.

**Phase 1 — Foundation (30 min)**
1. `npx create-next-app@latest portfolio --app --no-tailwind`
2. Set up `globals.css` with CSS variables (palette above) and font imports
3. Build `<Nav />` — static, no animation yet
4. Build `<Hero />` — name block only, no canvas yet
5. Verify fonts render correctly at target sizes

**Phase 2 — Cursor canvas (45 min)**
6. Build `cursorCode.js` as a standalone module
7. Attach to `<Hero />` component
8. Tune: column spacing, font size, reveal radius, lerp speed, opacity curve
9. This is the first "does it feel right" checkpoint. Don't move on until it does.

**Phase 3 — Carousel (2–3 hours)**
10. Build `useCarousel.js` hook — state: `[offset, velocity]`, drag/wheel handlers, friction loop via `requestAnimationFrame`
11. Build `<Carousel />` — render cards with CSS perspective, compute transforms from offset
12. Build `<Card />` — placeholder grey rect first, verify 3D math is correct
13. Add art images to cards
14. Add labels (catalogue number, title, medium)
15. Tune physics constants until it feels deliberate and heavy, not floaty

**Phase 4 — Card expansion (2 hours)**
16. Build `<DetailOverlay />` — static layout first, verify content renders correctly
17. Wire up GSAP expand animation from card rect → fullscreen
18. Wire up close: reverse animation, remove overlay
19. Add escape key handler
20. Test on multiple projects

**Phase 5 — Polish (1 hour)**
21. Add page load animation sequence (GSAP timeline)
22. Carousel idle float on active card
23. Scroll-triggered hero fade
24. Responsive: mobile snap-scroll + bottom sheet
25. Meta tags, OG image, favicon

---

## Things to Decide Before Building

**The art pieces.** You need 6 images in `/public/art/` before Phase 3 looks right. Start with color-matched placeholders (a grey rectangle with the catalogue number) and swap in real art when you've chosen it. The art is curatorial — choose slowly.

**The demo images/video per project.** Goes in the detail overlay. If you have screenshots, renders, or recordings from any project, they go here. Even one good image per project makes the overlay feel real.

**The "Shape of Feeling" title.** Confirm this is the final name for the sae-lit project before it's in the data file.

**GitHub links.** Some projects (Aarete internship) have no GitHub link. `github: null` hides the link in the overlay — already handled in the data schema above.

---

## What Makes This Distinctly Yours

The cursor-code effect is not a portfolio template — it's a statement about how you think. Code as ambient material, invisible until you look for it.

The art curation will make or break the "author with taste" signal. A wrong choice (too obvious, too decorative) undermines it. A right choice (Käthe Kollwitz for guilt research, August Sander for the interview platform) earns it.

The Playfair italic/upright name split is the one typographic risk. If it feels wrong in the browser, go full upright italic or full upright — don't compromise to something in between.

The catalogue numbers (`Cat. no. 001`) do quiet work. They frame the portfolio as a collection, not a resume. Keep them.