# Library Selection & Setup

## 🎯 Library Selection Guide

Claude Code automatically selects the best library:

| **Tool Type** | **Library** | **CDN** |
|--------------|------------|---------|
| **Animations** | GSAP | `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js` |
| **Creative Coding** | p5.js | `https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js` |
| **Vector Graphics** | Paper.js | `https://cdnjs.cloudflare.com/ajax/libs/paper.js/0.12.17/paper-full.min.js` |
| **3D Graphics** | Three.js | `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js` |
| **Data Visualization** | Chart.js | `https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js` |
| **Image Processing** | Canvas API | Native |

## Library-Specific Setup

### Three.js (CRITICAL):
```javascript
const renderer = new THREE.WebGLRenderer({ 
    canvas: document.getElementById('chatooly-canvas'),
    antialias: true, 
    preserveDrawingBuffer: true  // REQUIRED for exports
});
```

### p5.js (CRITICAL - MUST USE INSTANCE MODE):

**⚠️ WARNING**: p5.js in global mode auto-creates its own canvas, causing duplicate canvas issues. You MUST use instance mode and bind to the existing `#chatooly-canvas` element.

```javascript
// ========== CORRECT: Instance Mode ==========
const sketch = (p) => {
    p.setup = function() {
        // Get the existing chatooly-canvas element
        const existingCanvas = document.getElementById('chatooly-canvas');

        // Create p5 canvas and parent it to the container
        const canvas = p.createCanvas(1920, 1080);
        canvas.parent('chatooly-container');

        // Remove the p5-created canvas and bind p5 to the existing one
        if (existingCanvas) {
            existingCanvas.width = 1920;
            existingCanvas.height = 1080;
            if (canvas.elt !== existingCanvas) {
                canvas.elt.remove();
            }
            p._renderer = new p5.Renderer2D(existingCanvas, p, true);
            p._renderer.resize(1920, 1080);
        }

        // Initialize background manager
        const canvasElement = document.getElementById('chatooly-canvas');
        if (window.Chatooly && window.Chatooly.backgroundManager) {
            Chatooly.backgroundManager.init(canvasElement);
        }
    };

    p.draw = function() {
        p.clear();
        // Your drawing code using p.* methods
    };
};

// Initialize p5 in instance mode
let p5Instance = new p5(sketch);
```

**Key Rules for p5.js Instance Mode:**
- All p5 functions need `p.` prefix: `p.fill()`, `p.circle()`, `p.random()`, etc.
- Global variables like `width`, `height` become `p.width`, `p.height`
- Classes that use p5 functions must receive the `p` instance as a parameter
- Store `p5Instance` globally for external access (UI controls, exports)

**❌ WRONG - Global Mode (Creates duplicate canvas):**
```javascript
// DO NOT USE THIS PATTERN
function setup() {
    let canvas = createCanvas(800, 600);
    canvas.parent('chatooly-canvas');
}
```

### GSAP:
```javascript
// Target elements within chatooly-canvas
gsap.to('#chatooly-canvas .element', {duration: 2, x: 100});
```

### Paper.js:
```javascript
paper.install(window);
paper.setup('chatooly-canvas');
```

### Chart.js:
```javascript
const ctx = document.getElementById('chatooly-canvas').getContext('2d');
const chart = new Chart(ctx, config);
```