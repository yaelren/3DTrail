---
name: library-docs
description: Fetch accurate library documentation before implementing features. Use when building animations, particles, 3D graphics, charts, or any feature that uses p5.js, Three.js, GSAP, Chart.js, or canvas APIs.
---

# Library Documentation Lookup

## When to Use This Skill

Invoke this BEFORE writing code when implementing:
- Animations (GSAP, p5.js)
- Particles, generative art (p5.js)
- 3D graphics (Three.js)
- Charts, data visualization (Chart.js)
- Any canvas API you're uncertain about

## How to Use

1. Use `mcp__context7__resolve-library-id` with the library name (e.g., "p5.js", "three.js", "gsap")
2. Use `mcp__context7__get-library-docs` with the resolved ID and the topic you need

## Examples

| User Request | Library | Topic to Fetch |
|--------------|---------|----------------|
| "Make it rain particles" | p5.js | particles, vectors |
| "Add smooth animations" | GSAP | timeline, tweens |
| "I want a 3D rotating cube" | Three.js | BoxGeometry, mesh, rotation |
| "Show data as a pie chart" | Chart.js | pie chart |
| "Make the shapes bounce" | p5.js | velocity, physics |

## Why This Matters

- Training data may be outdated - Context7 has current APIs
- Prevents wrong method signatures and deprecated patterns
- Gets accurate parameter options and usage examples
- Results in working code the first time

## Important

After fetching library docs, still follow all Chatooly rules:
- Canvas must have `id="chatooly-canvas"`
- Implement `renderHighResolution` for exports
- Use `chatooly-*` CSS classes for controls
- Connect background controls to `Chatooly.backgroundManager`
