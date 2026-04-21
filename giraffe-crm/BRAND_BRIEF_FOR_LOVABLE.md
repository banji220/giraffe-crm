# Giraffe CRM — Brand Brief for Lovable

Use this as the design foundation for the landing page at `crm.holygiraffe.com`.
The app at `app.holygiraffe.com` uses the same design system. They must feel like one product.

---

## 1. Identity

- **Product name:** Giraffe CRM
- **Wordmark:** "Giraffe!" — always in the brand warm yellow (see below)
- **Logo:** `/public/logo.png` (a stylized giraffe-G mark, works on light and dark backgrounds)
- **Tagline:** "Knock, Quote, Close." or "Every Door Counts."
- **What it is:** Field sales CRM for door-to-door window cleaning. Not enterprise SaaS — a conversion engine for one-person crews.

---

## 2. Color Palette (MANDATORY — do not invent new colors)

All colors use OKLCH color space. Use these exact values:

### Core tokens (light mode)
| Token             | Value                          | Use                       |
|-------------------|--------------------------------|---------------------------|
| Background        | `oklch(0.97 0.005 80)`        | Page background           |
| Foreground        | `oklch(0.15 0.02 50)`         | Primary text, borders     |
| Card              | `oklch(0.99 0.003 80)`        | Card surfaces             |
| Primary           | `oklch(0.65 0.22 45)`         | CTA buttons, links, ring  |
| Primary foreground| `oklch(0.99 0.005 80)`        | Text on primary buttons   |
| Secondary         | `oklch(0.93 0.02 80)`         | Secondary surfaces        |
| Muted             | `oklch(0.93 0.015 80)`        | Disabled / subtle bg      |
| Muted foreground  | `oklch(0.5 0.03 50)`          | Secondary text            |
| Accent            | `oklch(0.85 0.15 85)`         | Highlights, hover states  |
| Destructive       | `oklch(0.577 0.245 27.325)`   | Errors, delete actions    |
| Border            | `oklch(0.15 0.02 50)`         | All borders (same as fg)  |

### Heatmap gradient (for visual accents, charts, decorative elements)
| Level | Value                    | Feel           |
|-------|--------------------------|----------------|
| 0     | `oklch(0.88 0.005 80)`  | Inactive gray  |
| 1     | `oklch(0.91 0.09 98)`   | Hint of warmth |
| 2     | `oklch(0.82 0.14 78)`   | **Brand yellow — use for wordmark** |
| 3     | `oklch(0.72 0.18 58)`   | Strong amber   |
| 4     | `oklch(0.6 0.22 42)`    | Deep orange    |
| 5     | `oklch(0.48 0.26 28)`   | Elite / fire   |

### Dark mode tokens (for sections with dark backgrounds)
| Token             | Value                          |
|-------------------|--------------------------------|
| Background        | `oklch(0.13 0.015 50)`        |
| Foreground        | `oklch(0.95 0.01 80)`         |
| Card              | `oklch(0.17 0.02 50)`         |
| Primary           | `oklch(0.7 0.2 50)`           |
| Muted             | `oklch(0.22 0.02 50)`         |
| Border            | `oklch(0.95 0.01 80 / 20%)`   |

---

## 3. Typography

| Role     | Font             | Weight     | Style                            |
|----------|------------------|------------|----------------------------------|
| Display  | Space Grotesk    | 700 Bold   | Tight tracking (-0.02em)         |
| Body     | Space Grotesk    | 400        | Normal tracking                  |
| Mono     | Space Mono       | 400 / 700  | Labels, stats, data, code        |
| Labels   | Space Mono       | 700 Bold   | UPPERCASE, tracking-widest       |

**Load from Google Fonts:**
```
Space Grotesk: 300..700
Space Mono: 400, 700
```

---

## 4. Shape Language

| Property           | Value     | Notes                                    |
|--------------------|-----------|------------------------------------------|
| Border radius      | **0px**   | Brutalist — sharp corners everywhere     |
| Border width       | 2px       | Thick visible borders, like print design |
| Button style       | Solid bg + 2px border | No rounded pills — rectangular |
| Card style         | 2px border, no shadow | Clean, no drop-shadow clutter  |
| Dividers           | `border-b-4 border-foreground` | Thick, deliberate      |

---

## 5. Visual Personality

- **Clean Brutalism** — sharp, bold, deliberate. No soft gradients, no rounded corners.
- **Warm, not cold** — the oklch palette is warm amber, not cold gray. It should feel like sunlight on a clipboard, not a sterile dashboard.
- **Monospace data** — any numbers, stats, counters, or labels use Space Mono in uppercase with wide tracking.
- **Dense hierarchy** — big bold headings, small mono labels. Two sizes, not five.

---

## 6. Landing Page Sections (suggested)

1. **Hero** — "Knock, Quote, Close." headline + CTA to sign up / sign in. Use the heatmap gradient as a decorative element (a 365-day contribution grid with sample data).

2. **Problem** — "Your CRM wasn't built for the doorstep." Short, punchy copy. Dark section (use dark mode tokens).

3. **How it works** — 3 steps: Knock → Quote → Close. Each with a bold number (Space Mono), a title (Space Grotesk Bold), a one-liner. No icons needed — typography IS the decoration.

4. **The Heatmap** — Show the contribution grid. "See your year. Every knock counted." This is the product's signature visual — make it prominent.

5. **CTA** — "Start knocking." Button → `app.holygiraffe.com/login`

6. **Footer** — Minimal. Logo, copyright, link to app.

---

## 7. Do NOT

- Use rounded corners or pill shapes
- Use emojis as decoration
- Add a chatbot or intercom widget
- Use stock photos
- Use more than 2 font families
- Use Tailwind's default gray palette (use the oklch tokens)
- Add animations that loop infinitely on the main content (marquee on footer is OK)
- Invent colors outside the palette above

---

## 8. Assets

- Logo: ask me to upload, or reference the giraffe-G mark
- Screenshot of the app: I'll provide once the redesign ships
- Heatmap component: can be embedded as a static visual or built with CSS grid + the heatmap level colors above

---

**This brief is the source of truth. If Lovable suggests a color, font, or shape that isn't listed here, override it.**
