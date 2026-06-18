# AGENTS.md

## Project Identity

This is a brand-new standalone romantic birthday website for a girlfriend's birthday surprise.

Do not reference, reuse, import, or connect anything from any previous app, repo, backend, database, Firebase, Supabase, authentication system, admin panel, or mobile app. This project is completely independent.

## Core Product

The website has exactly three main sections:

1. 360 Panoramic Star Map
2. Anı Defteri / Memory Book
3. Games

Do not add a lock screen, login, register, backend, database, admin panel, timeline section, payment, or external app integration.

## Birthday Data

Use this birthday information in the star map section:

- Date: 24 June 2005
- Location: Ankara / Çubuk
- Display text: 24 Haziran 2005 · Ankara / Çubuk

## Tech Stack

Use Vite, React, TypeScript, and Tailwind CSS.

Do not add Phaser for V1. Build V1 mini-games with lightweight HTML canvas, React, and `requestAnimationFrame`. Avoid unnecessary dependencies.

## Design Direction

The website should feel romantic, dreamy, soft, premium, magical, personal, and mobile-first.

Use deep navy, night purple, soft pink, warm glow, stars, constellation lines, tasteful glassmorphism, rounded cards, subtle shadows, soft gradients, and romantic particles.

Avoid childish colors, cheap template look, corporate style, messy animations, excessive visual noise, hard-to-read text, and unfinished UI.

## Global Effects

Add a global falling hearts effect visible everywhere except when a game modal/window is open.

The effect must use `pointer-events: none`, must not block taps/clicks, and must stay performant on phones.

## Star Map

The first visible section must be a 360 panoramic star map experience.

It does not need to be scientifically exact astrology software, but it should feel like a premium romantic panoramic night sky inspired by 24 June 2005 and Ankara / Çubuk.

Prefer a lightweight canvas, CSS, or SVG implementation. Do not fetch external APIs or add astronomy libraries.

## Memory Book

The memory book must feel like a romantic digital scrapbook / polaroid-style memory book, not a plain gallery.

Memory data should be editable from `src/data/memories.ts`.

If images are missing, show elegant placeholders instead of broken images.

Expected optional image paths:

- `public/memories/memory-1.jpg`
- `public/memories/memory-2.jpg`
- `public/memories/memory-3.jpg`
- `public/memories/memory-4.jpg`
- `public/memories/memory-5.jpg`
- `public/memories/memory-6.jpg`

## Games

V1 must include three simple playable mini-games using canvas.

Game 1 is unlocked initially. Game 2 unlocks after Game 1 is completed. Game 3 unlocks after Game 2 is completed.

Persist game progress in `localStorage`.

Use only these original romantic game names in the UI:

1. Kalbe Doğru
2. Pasta Peşinde
3. Hediye Uçuşu

Do not use copyrighted game names in the UI.

Support optional player avatar path:

- `public/avatar/girlfriend-pixel.jpg`

If the avatar is missing, use a graceful fallback.

## UX Rules

The site must be mobile-first.

Modals must close reliably. Escape key should close modals on desktop. Background scroll should lock when a modal is open.

Buttons must be comfortably tappable on mobile. There must be no horizontal overflow on mobile, no broken image UI, and no console errors.

## Code Rules

Use TypeScript properly. Keep components readable. Use Tailwind cleanly. Avoid unnecessary dependencies.

Clean up event listeners and animation loops. Use `requestAnimationFrame` responsibly.

Prevent touch controls from scrolling the page during games where necessary.

## Verification

Before finishing implementation work, run:

```bash
npm install
npm run build
```
