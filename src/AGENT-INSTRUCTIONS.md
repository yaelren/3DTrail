# Chatooly Template - AI Agent Instructions

## 🤖 For AI Agents Building Chatooly Tools

This document provides critical instructions for AI agents (Claude, GPT-4, etc.) when creating new Chatooly tools.

---

## 🎯 Golden Rules

1. **ALWAYS READ `index.html` FIRST** - All component patterns are documented in HTML comments
2. **NEVER IMPROVISE CSS CLASSES** - Only use classes documented in this template
3. **COPY EXACT PATTERNS** - Don't try to simplify or "improve" the structure
4. **TEST AGAINST CDN DEMO** - Compare output to https://yaelren.github.io/chatooly-cdn/sv-tools-example.html

---

## 📋 Required Component Patterns

### ✅ Sections (Collapsible Groups)

```html
<div class="chatooly-section-card" data-section="section-name">
    <h3 class="chatooly-section-header">✨ Section Name</h3>
    <div class="chatooly-section-content">
        <!-- Controls here -->
    </div>
</div>
```

**Collapsible Behavior:**
- Sections are automatically collapsible when clicked
- `data-section` attribute is optional but recommended for JS targeting
- CSS automatically adds down arrow (▼) that rotates when collapsed
- Add `collapsed` class to start section collapsed: `<div class="chatooly-section-card collapsed">`

**Common Mistakes:**
- ❌ `<h3 class="section-header">` (missing `chatooly-` prefix)
- ❌ Manually adding `<span>▼</span>` arrows (handled by CSS automatically)
- ❌ Forgetting `chatooly-section-card` wrapper

---

### ✅ Toggle Switches (Not Checkboxes!)

```html
<div class="chatooly-toggle-group">
    <button type="button"
            class="chatooly-toggle"
            id="my-toggle"
            role="switch"
            aria-pressed="false">
        <span class="chatooly-toggle-slider"></span>
    </button>
    <label class="chatooly-toggle-label" for="my-toggle">Feature Name</label>
</div>
```

**Why not checkboxes?**
CDN provides styled toggle buttons that match the design system. Plain checkboxes look wrong.

**Common Mistakes:**
- ❌ `<input type="checkbox">` - Don't use native checkboxes for toggles
- ❌ Missing `role="switch"` and `aria-pressed` attributes
- ❌ Forgetting the `<span class="chatooly-toggle-slider"></span>` inner element

---

### ✅ Color Pickers

```html
<div class="chatooly-color-group">
    <label class="chatooly-color-label" for="my-color">Color</label>
    <input type="color" class="chatooly-color-input" id="my-color" value="#ff0000">
</div>
```

**Common Mistakes:**
- ❌ Using `chatooly-control-group` instead of `chatooly-color-group`
- ❌ Missing the `-color-` prefix on classes

---

### ✅ Sliders (Range Inputs)

```html
<div class="chatooly-slider-group">
    <div class="chatooly-slider-label">
        <span>Size</span>
        <span class="chatooly-slider-value" id="my-slider-value">50</span>
    </div>
    <input type="range" class="chatooly-slider" id="my-slider" min="0" max="100" value="50">
</div>
```

**Important:**
- Use `chatooly-slider-group` as container
- Label wrapper is `chatooly-slider-label` containing both label text and value
- Add `chatooly-slider` class to `<input type="range">`
- Value display uses `chatooly-slider-value` class inside the label div

**Common Mistakes:**
- ❌ Using `chatooly-control-row` or `chatooly-control-group` instead of `chatooly-slider-group`
- ❌ Missing `chatooly-slider-label` wrapper div
- ❌ Using `chatooly-control-slider` instead of `chatooly-slider`

---

### ✅ Dropdowns (Select Elements)

```html
<div class="chatooly-input-group">
    <label class="chatooly-input-label" for="my-select">Options</label>
    <select class="chatooly-select" id="my-select">
        <option value="a">Option A</option>
        <option value="b">Option B</option>
    </select>
</div>
```

**Common Mistakes:**
- ❌ Missing `chatooly-select` class on `<select>`
- ❌ Using `chatooly-control-group` instead of `chatooly-input-group`

---

### ✅ Text Inputs

```html
<div class="chatooly-input-group">
    <label class="chatooly-input-label" for="my-input">Text</label>
    <input type="text" class="chatooly-input" id="my-input" value="" placeholder="Enter text...">
</div>
```

---

### ✅ File Uploads (Upload Areas)

```html
<div class="chatooly-upload-area" style="height: 100px;">
    <div class="chatooly-upload-icon">
        <svg viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.94444 0L11 3V11.4048C10.9998 11.5627 10.9358 11.7141 10.822 11.8257C10.7083 11.9373 10.554 12 10.3932 12H0.606833C0.446342 11.9989 0.292733 11.9359 0.179189 11.8245C0.0656443 11.7131 0.00128006 11.5624 0 11.4048V0.5952C0 0.2664 0.271944 0 0.606833 0H7.94444ZM6.11111 6H7.94444L5.5 3.6L3.05556 6H4.88889V8.4H6.11111V6Z" fill="var(--fill-0, #454545)"/>
        </svg>
    </div>
    <div class="chatooly-upload-text">Upload Image</div>
    <input type="file" class="chatooly-upload-input" accept="image/*">
</div>
```

**Important:**
- Use `chatooly-upload-area` as container (styled clickable area)
- Include `chatooly-upload-icon` with the standard upload SVG icon
- Add `chatooly-upload-text` for the label
- File input uses `chatooly-upload-input` class (hidden, triggered by clicking area)
- Set height inline: `style="height: 100px;"` (adjust as needed)

**Common Mistakes:**
- ❌ Using `chatooly-input-group` + `chatooly-input` for file uploads
- ❌ Missing the upload icon SVG
- ❌ Not using the proper upload area structure

---

## 📦 Class Name Quick Reference

| Element Type | Container | Label | Input |
|-------------|-----------|-------|-------|
| **Section** | `chatooly-section-card` + `data-section` | `chatooly-section-header` | `chatooly-section-content` |
| **Toggle** | `chatooly-toggle-group` | `chatooly-toggle-label` | `chatooly-toggle` + `chatooly-toggle-slider` |
| **Color** | `chatooly-color-group` | `chatooly-color-label` | `chatooly-color-input` |
| **Slider** | `chatooly-slider-group` | `chatooly-slider-label` (wrapper div) | `chatooly-slider` |
| **Select** | `chatooly-input-group` | `chatooly-input-label` | `chatooly-select` |
| **Text** | `chatooly-input-group` | `chatooly-input-label` | `chatooly-input` |
| **Upload** | `chatooly-upload-area` | `chatooly-upload-text` | `chatooly-upload-input` + `chatooly-upload-icon` |
| **Button** | N/A | N/A | `chatooly-btn` |

---

## 🚫 Common Anti-Patterns

### ❌ DO NOT USE THESE CLASSES (Old/Wrong Patterns)

```html
<!-- WRONG - Old template classes -->
<h3 class="section-header">Section <span class="section-toggle">▼</span></h3>
<div class="section-content">...</div>

<label><input type="checkbox" id="toggle"> Feature</label>

<div class="control-group">
    <label>Slider</label>
    <input type="range">
</div>

<!-- WRONG - Incorrect slider patterns -->
<div class="chatooly-control-row">
    <label>Slider</label>
    <input type="range" class="chatooly-control-slider">
</div>
```

### ✅ USE THESE INSTEAD (Current Template)

```html
<!-- CORRECT - Current template classes -->
<div class="chatooly-section-card">
    <h3 class="chatooly-section-header">Section</h3>
    <div class="chatooly-section-content">...</div>
</div>

<div class="chatooly-toggle-group">
    <button type="button" class="chatooly-toggle" id="toggle" role="switch" aria-pressed="false">
        <span class="chatooly-toggle-slider"></span>
    </button>
    <label class="chatooly-toggle-label" for="toggle">Feature</label>
</div>

<div class="chatooly-slider-group">
    <div class="chatooly-slider-label">
        <span>Slider</span>
        <span class="chatooly-slider-value">50</span>
    </div>
    <input type="range" class="chatooly-slider" min="0" max="100" value="50">
</div>

<div class="chatooly-color-group">
    <label class="chatooly-color-label">Color</label>
    <input type="color" class="chatooly-color-input">
</div>
```

---

## 🎨 Visual Design Principles

1. **All sections use cards** - White background, subtle border, rounded corners
2. **Toggle switches not checkboxes** - Modern iOS-style toggles
3. **Consistent spacing** - Defined by CDN CSS variables
4. **Collapsible sections** - Handled automatically by CDN JavaScript
5. **Responsive** - Mobile-friendly by default

---

## 🔍 Validation Checklist

Before delivering a tool to the user, verify:

- [ ] All sections use `chatooly-section-card` wrapper
- [ ] All toggles use `<button class="chatooly-toggle">` not checkboxes
- [ ] All color pickers use `chatooly-color-group` + `chatooly-color-input`
- [ ] All dropdowns have `chatooly-select` class
- [ ] All text/file inputs use `chatooly-input-group` + `chatooly-input`
- [ ] No local `style.css` file (CDN handles all styling)
- [ ] Canvas has `id="chatooly-canvas"`
- [ ] CDN script loaded: `https://yaelren.github.io/chatooly-cdn/js/core.min.js`
- [ ] **If using p5.js:** Uses instance mode (`new p5(sketch)`) and binds to existing canvas

---

## 🎨 p5.js Tools - CRITICAL Canvas Rules

**⚠️ IMPORTANT**: If using p5.js, you MUST use **instance mode** to avoid creating duplicate canvases.

See **[claude-rules/05-library-selection.md](claude-rules/05-library-selection.md)** for the complete p5.js instance mode pattern.

**Quick Summary:**
- p5.js global mode auto-creates a canvas, conflicting with `#chatooly-canvas`
- Use `new p5(sketch)` pattern instead of global `setup()`/`draw()` functions
- All p5 functions need `p.` prefix: `p.fill()`, `p.circle()`, `p.random()`
- Pass `p` instance to classes that use p5 functions
- Store `p5Instance` globally for external access (UI controls, exports)

---

## 📖 Additional Resources

- **CDN Demo**: https://yaelren.github.io/chatooly-cdn/component-demo.html
- **Template Source**: See `index.html` for complete annotated examples
- **CSS Variables**: https://raw.githubusercontent.com/yaelren/chatooly-cdn/main/css/variables.css
- **Components**: https://raw.githubusercontent.com/yaelren/chatooly-cdn/main/css/components.css

---

## 🤝 When in Doubt

1. Look at the example controls in `index.html`
2. Compare to the CDN demo tool
3. Copy the exact pattern, don't improvise
4. Ask the user if unsure about a specific control type

**Remember:** The goal is consistency across all Chatooly tools. Following these patterns ensures every tool looks professional and matches the design system.
