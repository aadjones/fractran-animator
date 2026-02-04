# Mobile Design Feasibility Notes

## The Honest Answer

**The educational chapters work fine on mobile. The full simulator (Sandbox/Explorer) doesn't—and that's okay.**

This is an inherently visual, spatial teaching tool. The core insight of FRACTRAN (watching dots move between prime columns) requires seeing multiple columns simultaneously. On mobile, that spatial relationship collapses.

## What Works on Mobile

### Chapters 1-7 ✅
- Linear prose + embedded widgets
- Content is max-width constrained (2xl)
- Already stacks naturally
- Widgets in chapters use simple programs (1-3 rules, 3-5 columns)
- These fit comfortably on mobile

### Landing Page ✅
- Clean button list
- Already mobile-friendly

### Controls ✅
- Play/pause, scrubber, speed slider all work on touch
- Full-width timeline scrubber is actually better on mobile

## What Doesn't Work

### RegisterBoard with 6+ Columns
Conway's PRIMEGAME shows 10+ prime columns. Even at minimum density (`w-14`), that's 560px+ of columns. An iPhone 14 is 390px wide.

**Options:**
1. **Horizontal scroll** — Breaks the "see everything at once" insight
2. **Tabbed columns** — Destroys the mental model
3. **Smaller beads** — Already at 1.5px on mobile; unreadable
4. **Vertical stacking** — Loses column comparison entirely

None of these preserve what makes the visualization valuable.

### Bead Editing (Right-Click Pattern)
Current: left-click adds, right-click removes.

Mobile alternatives:
- Long-press menu (slower)
- Swipe to delete (non-discoverable)
- Toggle mode (add/remove switch) — probably best option

This is solvable, but adds friction.

### Sandbox Layout
Desktop: program editor alongside register board (see both).
Mobile: stacked (scroll between them).

The whole point of Sandbox is rapid experimentation: tweak rule → see effect. Stacking breaks that tight feedback loop.

### Header Navigation (7 Chapter Dots)
168px of dots + back button + title = cramped on 390px screen.
Could collapse to dropdown, but that's another tap.

## Recommendation

### Don't Force It

The site has a clear information architecture:
- **Chapters** = guided learning (mobile-friendly)
- **Sandbox/Explorer** = freeform experimentation (desktop-first)

Rather than degrading the Sandbox experience on mobile, lean into this split:

1. **Make chapters excellent on mobile** (they nearly are already)
2. **Gate Sandbox/Explorer on mobile** with a friendly message:
   > "The full simulator works best on a larger screen. Chapters 1-7 work great on mobile!"
3. **Let the educational content stand alone** — users can complete the full learning experience on mobile, then come back on desktop for experimentation

### Minimal Mobile Fixes (Worth Doing)

| Fix | Effort | Impact |
|-----|--------|--------|
| Test chapters on actual phones | Low | Catch real issues |
| Replace header dots with dropdown on mobile | Low | Less cramped |
| Add horizontal scroll to RegisterBoard | Low | At least viewable |
| Add "desktop recommended" badge to Sandbox | Trivial | Sets expectations |

### Not Worth the Effort

| Idea | Why Not |
|------|---------|
| Full Sandbox mobile redesign | High effort, fundamentally worse experience |
| Touch gesture system for beads | Complex, adds cognitive load |
| "Mobile mode" with simplified visualizations | Different product entirely |

## Design Principle

> **Build something good that works on desktop, rather than something mediocre that works everywhere.**

The visualization's educational power comes from its clarity. Cramping it onto mobile reduces that clarity. Let the constraint guide the product: this is a "sit down at your computer and learn something beautiful" experience.

## If You Change Your Mind Later

The codebase has good bones for mobile adaptation:
- Already using Tailwind with mobile-first breakpoints
- RegisterBoard has 3-tier density system
- Layouts use flex-wrap and responsive gaps

If mobile becomes a hard requirement, start with:
1. Replace right-click with toggle mode for bead editing
2. Add horizontal scroll + "pinch to zoom" to RegisterBoard
3. Build a separate `MobileSandbox` route with stripped-down features
4. Accept that 10+ column programs won't fit — limit mobile to simpler programs

But these are engineering answers to what might be a product question: **Is mobile the right channel for this content?**

The answer is probably: "No, and that's fine."
