# Background System Implementation

## 🚨 CRITICAL - MANDATORY FOR ALL TOOLS

**Every Chatooly tool MUST connect the background UI controls to the canvas background system. This is NOT optional.**

## Overview
The Chatooly template provides background control HTML by default. **Your job is to connect these controls to the `Chatooly.backgroundManager` API.**

**This is a REQUIRED implementation step - do not skip this!**

## 🤖 For AI Agents: Implementation Checklist

**Before marking a tool as complete, verify ALL of these:**

- [ ] `Chatooly.backgroundManager.init(canvas)` called during initialization
- [ ] Transparent checkbox connected with event listener
- [ ] Color picker connected with event listener
- [ ] Image upload connected with event listener
- [ ] Clear button (X) connected with event listener
- [ ] Fit dropdown connected with event listener
- [ ] Background renders FIRST in render loop (before tool content)
- [ ] Background included in `renderHighResolution()` export function
- [ ] Tested with: solid color background, transparent background, image background
- [ ] Tested that background appears in PNG exports
- [ ] **🔴 FOR THREE.JS TOOLS:** Complete `updateBackground()` function implemented with CanvasTexture creation
- [ ] **🔴 FOR THREE.JS TOOLS:** Background image uploads are tested and visible (not just colors)
- [ ] **🔴 FOR THREE.JS TOOLS:** `updateBackground()` called in ALL background event listeners
- [ ] **🔴 FOR THREE.JS TOOLS:** Texture disposal implemented to prevent memory leaks

**If ANY checkbox is unchecked, the implementation is incomplete.**

**⚠️ COMMON MISTAKE:** Many agents skip background image implementation for Three.js because they only implement solid color/transparency. This causes user frustration when image uploads don't work. READ THE COMPLETE THREE.JS SECTION BELOW!

## What's Already Provided

#### 1. Background Controls HTML (in index.html)
These controls are already in the template:
- ✅ Transparent checkbox (`#transparent-bg`)
- ✅ Color picker (`#bg-color`)
- ✅ Image upload (`#bg-image`)
- ✅ Remove button (`#clear-bg-image`) - X button, hidden by default
- ✅ Fit dropdown (`#bg-fit`) - hidden until image uploaded

**Don't create these - they're already there!**

#### 2. Background Manager API (CDN)
`Chatooly.backgroundManager` provides all background logic:
- Color and transparency management
- Image loading and fit calculations
- Canvas rendering helpers
- CSS generation for DOM tools

#### 3. Background CSS (CDN)
Automatic styling for:
- Checkered transparency pattern
- Red X button with hover effects
- Image wrapper layout

### Implementation Steps

#### Step 1: Initialize Background Manager

```javascript
// In your initialization code
const canvas = document.getElementById('chatooly-canvas');
Chatooly.backgroundManager.init(canvas);
```

#### Step 2: Connect Event Listeners

Wire up the HTML controls:

```javascript
// Transparent Background
document.getElementById('transparent-bg').addEventListener('change', (e) => {
    Chatooly.backgroundManager.setTransparent(e.target.checked);
    // Hide color picker when transparent
    document.getElementById('bg-color-group').style.display =
        e.target.checked ? 'none' : 'block';
    render();
});

// Background Color
document.getElementById('bg-color').addEventListener('input', (e) => {
    Chatooly.backgroundManager.setBackgroundColor(e.target.value);
    render();
});

// Background Image Upload
document.getElementById('bg-image').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        await Chatooly.backgroundManager.setBackgroundImage(file);
        // Show X button and fit dropdown
        document.getElementById('clear-bg-image').style.display = 'block';
        document.getElementById('bg-fit-group').style.display = 'block';
        render();
    } catch (error) {
        alert('Failed to load image: ' + error.message);
    }
});

// Clear Image (X Button)
document.getElementById('clear-bg-image').addEventListener('click', () => {
    Chatooly.backgroundManager.clearBackgroundImage();
    // Hide X button and fit dropdown
    document.getElementById('clear-bg-image').style.display = 'none';
    document.getElementById('bg-fit-group').style.display = 'none';
    document.getElementById('bg-image').value = '';
    render();
});

// Image Fit Mode
document.getElementById('bg-fit').addEventListener('change', (e) => {
    Chatooly.backgroundManager.setFit(e.target.value);
    render();
});
```

#### Step 3: Render Background

Choose based on your framework:

##### Canvas API:
```javascript
function render() {
    // Draw background FIRST
    Chatooly.backgroundManager.drawToCanvas(ctx, canvas.width, canvas.height);
    // Your content on top...
}
```

##### p5.js:
```javascript
function draw() {
    const bg = Chatooly.backgroundManager.getBackgroundState();

    if (bg.bgTransparent) {
        clear();
    } else if (bg.bgImage) {
        const dims = Chatooly.backgroundManager.calculateImageDimensions(width, height);
        image(bg.bgImage, dims.offsetX, dims.offsetY, dims.drawWidth, dims.drawHeight);
    } else {
        background(bg.bgColor);
    }
    // Your drawing...
}
```

##### Three.js (🚨 CRITICAL - COMPLETE IMPLEMENTATION REQUIRED):

**⚠️ Three.js requires special handling for background images because WebGL cannot directly render HTML Image elements. You MUST create a CanvasTexture for background images.**

```javascript
// Background texture for images (declare at top level)
let backgroundTexture = null;

// Update background for Three.js
function updateBackground() {
    if (!window.Chatooly || !window.Chatooly.backgroundManager) return;

    const bg = Chatooly.backgroundManager.getBackgroundState();

    // Handle transparent background
    if (bg.bgTransparent) {
        renderer.setClearAlpha(0);
        scene.background = null;
        // Clean up old texture
        if (backgroundTexture) {
            backgroundTexture.dispose();
            backgroundTexture = null;
        }
        return;
    }

    // Handle background image - CRITICAL: Must use CanvasTexture
    if (bg.bgImage && bg.bgImageURL) {
        // Remove old texture if it exists
        if (backgroundTexture) {
            backgroundTexture.dispose();
            backgroundTexture = null;
        }

        // Get canvas dimensions
        const canvasWidth = renderer.domElement.width;
        const canvasHeight = renderer.domElement.height;
        const dims = Chatooly.backgroundManager.calculateImageDimensions(canvasWidth, canvasHeight);

        // Create canvas texture with properly fitted image
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvasWidth;
        tempCanvas.height = canvasHeight;
        const ctx = tempCanvas.getContext('2d');

        // Fill background with solid color first (for areas not covered by image)
        ctx.fillStyle = bg.bgColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Draw image with fit mode
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, dims.offsetX, dims.offsetY, dims.drawWidth, dims.drawHeight);

            // Create Three.js texture from canvas
            backgroundTexture = new THREE.CanvasTexture(tempCanvas);
            backgroundTexture.needsUpdate = true;
            scene.background = backgroundTexture;

            // Set clear color to match
            const color = new THREE.Color(bg.bgColor);
            renderer.setClearColor(color, 1);
            renderer.setClearAlpha(1);
        };
        img.onerror = () => {
            console.error('Failed to load background image');
            // Fallback to solid color
            const fallbackColor = new THREE.Color(bg.bgColor);
            renderer.setClearColor(fallbackColor, 1);
            renderer.setClearAlpha(1);
            scene.background = null;
        };
        img.src = bg.bgImageURL;
    } else {
        // Solid color background
        const color = new THREE.Color(bg.bgColor);
        renderer.setClearColor(color, 1);
        renderer.setClearAlpha(1);
        scene.background = null;

        // Clean up old texture
        if (backgroundTexture) {
            backgroundTexture.dispose();
            backgroundTexture = null;
        }
    }
}

// Call this in your event listeners
updateBackground();
```

**🔴 CRITICAL for Three.js tools:**
- You MUST implement the complete `updateBackground()` function above
- Background images require creating a CanvasTexture - DO NOT skip this step
- Call `updateBackground()` in ALL background control event listeners
- Call `updateBackground()` after canvas resize events
- Always dispose old textures to prevent memory leaks

##### DOM-based:
```javascript
const bgCSS = Chatooly.backgroundManager.getBackgroundCSS();
document.getElementById('chatooly-canvas').style.background = bgCSS;
```

#### Step 4: Export Support (MANDATORY)

Include background in high-res export:

```javascript
window.renderHighResolution = function(targetCanvas, scale) {
    const exportCtx = targetCanvas.getContext('2d');
    targetCanvas.width = canvas.width * scale;
    targetCanvas.height = canvas.height * scale;
    exportCtx.scale(scale, scale);

    // Draw background at export resolution
    Chatooly.backgroundManager.drawToCanvas(exportCtx, canvas.width, canvas.height);

    // Your content...
};
```

## Background Manager API Reference

### Methods

**`init(canvasElement)`**
Initialize with your canvas element.

**`setBackgroundColor(color)`**
Set color (hex string like "#CCFD50").

**`setTransparent(transparent)`**
Enable/disable transparency (boolean).

**`setBackgroundImage(file)`**
Load image from File object. Returns Promise.

**`clearBackgroundImage()`**
Remove background image.

**`setFit(mode)`**
Set fit mode: `'cover'`, `'contain'`, or `'fill'`.

**`getBackgroundState()`**
Returns:
```javascript
{
    bgColor: string,
    bgTransparent: boolean,
    bgImage: Image | null,
    bgImageURL: string | null,
    bgFit: 'cover' | 'contain' | 'fill'
}
```

**`calculateImageDimensions(canvasWidth, canvasHeight)`**
Returns:
```javascript
{
    drawWidth: number,
    drawHeight: number,
    offsetX: number,
    offsetY: number
}
```

**`drawToCanvas(ctx, canvasWidth, canvasHeight)`**
Draw background to 2D context.

**`getBackgroundCSS()`**
Generate CSS background string.

**`reset()`**
Reset to defaults.

## Testing Checklist

- [ ] Transparent checkbox shows checkered pattern
- [ ] Color picker changes background
- [ ] Image upload works
- [ ] X button appears when image uploaded
- [ ] X button clears image and hides dropdown
- [ ] Fit dropdown appears with image
- [ ] Fill/Fit/Stretch modes all work
- [ ] Color picker hides when transparent
- [ ] Background in PNG exports

## Troubleshooting

**Background not visible?**
- Call `drawToCanvas()` or apply CSS
- Draw background BEFORE your content

**Image not showing?**
- Check fit mode setting
- Check console for errors
- Verify image format

**Export missing background?**
- Include background in `renderHighResolution()`
- Draw background FIRST in export

**🔴 Three.js Specific Issues:**

**Background image upload doesn't show anything?**
- You probably only implemented solid color/transparency handling
- You MUST implement the complete `updateBackground()` function with CanvasTexture creation
- See the Three.js section above for the COMPLETE implementation
- Background images in Three.js require creating a 2D canvas texture - this is not optional

**Three.js background is black instead of the selected color?**
- Make sure you're using `new THREE.Color(bg.bgColor)` to convert hex to Three.js color
- Call `renderer.setClearColor(color, 1)` with the converted color

**Memory leak when changing background images?**
- You forgot to dispose old textures
- Always call `backgroundTexture.dispose()` before creating a new texture
- See texture disposal in the Three.js implementation above

**Background doesn't update when canvas resizes?**
- Call `updateBackground()` in your canvas resize event handler
- The CanvasTexture needs to be recreated with new dimensions
