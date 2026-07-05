SMALL
------
1. The gap between name and carousel. That white space between "IIT DEC 2027" and the top of the carousel card is killing the composition. The carousel should feel like it belongs to the same page as the name, not like a separate section below the fold. Either bring the carousel up so the top of the cards are visible while the name is still reading, or reduce the hero height significantly so name + carousel coexist in one viewport without scrolling.
2. The card proportions. The card is very wide and short right now — almost landscape. The spec says 320×420 (portrait). Portrait cards feel like paintings. Landscape cards feel like slides. Get that ratio right and the gallery feeling returns immediately.
3. The side cards are too clipped. You can barely see them — just a sliver on each edge. Show more of the adjacent cards, maybe 30–35% visible on each side. That's what creates the "there's more to explore" feeling that makes a carousel worth having.
4. The label section. "CAT. NO. 004 / MARLTS / Reinforcement learning · 2025" is right but the weight is off — MARLTS is too heavy/bold relative to everything else. In the spec it's Playfair Display 400, not bold. Check that the font weight isn't defaulting to 700 somewhere.
5. The code in the walls. It's working but it's too dense — it reads as a texture rather than a secret. Make it: smaller font (7px not 9px), wider column spacing, and reduce the max opacity on reveal to about 35%. It should feel like something you notice on your third second on the page, not immediately.





BIG
----
1. Animated perspective floor grid behind the carousel. Pure CSS — a 1-point perspective grid receding toward a vanishing point at the horizon, very low opacity ~6%, warm sepia color. Gives the carousel a surface to sit on. The cards stop floating and start resting. Takes 20 lines of CSS. This alone would change the feel dramatically.
2. Perlin noise ink-wash texture on the background canvas. Behind everything, a very slowly evolving noise field rendered in warm tones. Not moving fast enough to be distracting — more like watching paper absorb ink. p5.js or plain canvas with a noise function. This is Sumi, essentially — the project you already have instincts about.
3. The Codrops reactive gradient approach — but inverted for your palette. Instead of bright colors pulled from images, extract the muted tone of each art piece as the card becomes active and paint it as a very soft radial glow behind the active card. So when you're on the sae-lit card the background breathes with that painting's dominant color. Subtle. Only 10–15% opacity. Gives the space "pop" without adding actual color noise.