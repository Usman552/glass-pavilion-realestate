# The Glass Pavilion — Luxury Real Estate Landing Page

A cinematic, scroll-driven single-page website for a fictional luxury residence, presented by the fictional agency **Ashworth & Vane**. Built with plain HTML, CSS and JavaScript — no build step, no framework.

> All imagery is placeholder photography from Unsplash. Swap in your own (see [Replacing images](#replacing-images)).

## Tech stack

| Layer | Tool |
|---|---|
| Markup / styling | HTML5, CSS3 (custom properties, `clip-path`, grid, `clamp()` fluid type) |
| Animation | [GSAP 3.12.5](https://gsap.com/) + ScrollTrigger |
| Smooth scrolling | [Lenis 1.1.13](https://lenis.darkroom.engineering/) wired to GSAP's ticker |
| Fonts | Cormorant Garamond (display), Inter (UI) via Google Fonts |
| Images | Unsplash (placeholders), injected from a config in `main.js` |

Libraries load from CDNs with pinned versions, so an internet connection is required.

## Run locally

No install needed. Serve the folder with any static server:

```bash
# Python
python -m http.server 5173

# or Node
npx serve .
```

Then open <http://localhost:5173>. (Opening `index.html` directly with `file://` also works, but a server is recommended.)

## Features

**Experience**
- Preloader with a 0–100% counter that waits for the hero image, then lifts away into the hero intro
- Smooth, lerp-based scrolling (Lenis) in sync with ScrollTrigger
- Scroll progress bar, custom cursor ring with contextual labels ("Explore", "Discover"), magnetic buttons
- Header that hides on scroll down / returns on scroll up, with scroll-spy highlighting of the current section
- Full-screen mobile menu

**Sections**
1. **Hero** — pinned; the entrance image wipes in as you scroll
2. **The House** — pinned room sequence (Living, Kitchen, Staircase, Terrace) with clip-path wipes, parallax and word-by-word captions
3. **Statement** — scroll-scrubbed headline, parallax image card
4. **Marquee** — outline text loop that speeds up and reverses with scroll velocity
5. **Interiors** — pinned horizontal-scroll gallery with inner parallax and a progress line
6. **The View** — three glass panes slide apart to reveal the title
7. **After dark** — layered, parallaxing editorial images
8. **The Grounds** — amenity index with hover line-draw
9. **Specifications** — count-up numbers
10. **Private Viewing** — floating-label form with validation and a success state
11. **Footer** — links and back-to-top

**Quality**
- Responsive: desktop gets the pinned/horizontal cinematic version; mobile gets a simplified vertical version
- `prefers-reduced-motion` respected — everything falls back to a static, fully readable layout
- If GSAP fails to load, the page degrades to the static layout instead of hiding content
- Accessible basics: skip link, semantic landmarks, focus styles, ARIA on the menu and form errors
- Performance: no animated blur filters, lazy-loaded images, hero image preload

## Project structure

```
index.html   Markup for all sections, menu, loader and footer
style.css    Design tokens, layout, and the animated/desktop variants
main.js      Image config, Lenis + GSAP/ScrollTrigger setup, all animations, form logic
```

How the layout is organised: the base CSS is a complete static stacked layout. `main.js` adds `fx-motion` (any animated mode) and `fx-desktop` (pinned / horizontal mode) to `<html>`, and CSS rules scoped to those classes switch on the cinematic version. Animations are created inside `gsap.matchMedia()` so desktop, mobile and reduced-motion each get the right set and clean up on resize.

## Customising

### Replacing images
Edit the `IMAGES` array at the top of `main.js`. Each `key` matches a `data-img="key"` attribute in `index.html`:

```js
{ key: 'hero', src: 'images/hero.jpg', alt: 'Describe the photo' }
```

### Colours and type
Change the tokens at the top of `style.css` (`--bg`, `--gold`, `--serif`, `--sans`, …).

### Contact form
The submit handler in `main.js` (`initForm`) validates and shows a success state but does not send anything. Replace the `TODO` with a `fetch()` call to your backend or a form service.

## Deploy

It is a static site — drop the folder on GitHub Pages, Netlify, Vercel or any static host. No build command.

## License / credits

Code: free to use and adapt. Photography © respective Unsplash photographers; replace before any real use. "Ashworth & Vane" and "The Glass Pavilion" are fictional.
