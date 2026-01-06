# Chatooly Design System Migration Guide

## Overview

This guide explains the Chatooly CDN v2.0 design system architecture and best practices for building future-proof tools that won't break when the design system changes.

## Design System Architecture

### Two-Layer System

Chatooly CDN v2.0 uses a dual-layer approach:

1. **Explicit Classes (Recommended)** - Direct component classes like `.chatooly-btn`, `.chatooly-input`
2. **Universal Fallback (Legacy Support)** - Automatic styling for plain HTML elements

```
┌─────────────────────────────────────────┐
│  YOUR TOOL HTML                         │
├─────────────────────────────────────────┤
│  Option 1: <button class="chatooly-btn">│  ← RECOMMENDED (Future-proof)
│  Option 2: <button>                     │  ← WORKS (Legacy fallback)
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  CHATOOLY CDN STYLING LAYERS            │
├─────────────────────────────────────────┤
│  1. Explicit Classes (components.css)   │  ← Direct styling
│  2. Universal Fallback (legacy-compat)  │  ← Auto-styling for plain elements
└─────────────────────────────────────────┘
```

## Why Use Explicit Classes?

### ✅ Benefits of Explicit Classes

1. **Future-Proof**: Won't break when design system updates
2. **Clear Intent**: Code explicitly shows Chatooly styling
3. **Performance**: No selector complexity overhead
4. **Maintainability**: Easy to understand and modify
5. **Guaranteed Compatibility**: Will work in all CDN versions (v2.0+)

### ⚠️ Risks of Plain HTML Elements

1. **Fallback Dependency**: Relies on universal fallback layer
2. **Future Deprecation**: Fallback may be removed in v3.0+
3. **Implicit Behavior**: Harder to understand where styles come from
4. **Potential Breaking Changes**: Design system updates may affect fallback behavior

## Migration Patterns

### Buttons

```html
<!-- ❌ OLD (relies on fallback) -->
<button>Export PNG</button>

<!-- ✅ NEW (explicit class) -->
<button class="chatooly-btn">Export PNG</button>
```

### Text Inputs

```html
<!-- ❌ OLD -->
<input type="text" placeholder="Enter name">

<!-- ✅ NEW (with structured wrapper) -->
<div class="chatooly-input-group">
    <label class="chatooly-input-label" for="name-input">Name</label>
    <input type="text" class="chatooly-input" id="name-input" placeholder="Enter name">
</div>
```

### Dropdowns

```html
<!-- ❌ OLD -->
<select>
    <option>PNG</option>
    <option>JPG</option>
</select>

<!-- ✅ NEW -->
<div class="chatooly-input-group">
    <label class="chatooly-input-label" for="format-select">Format</label>
    <select class="chatooly-select" id="format-select">
        <option>PNG</option>
        <option>JPG</option>
    </select>
</div>
```

### Range Sliders

```html
<!-- ❌ OLD -->
<input type="range" min="0" max="100" value="50">

<!-- ✅ NEW (with value display) -->
<div class="chatooly-slider-group">
    <label class="chatooly-slider-label">
        <span>Opacity</span>
        <span class="chatooly-slider-value" id="opacity-value">50</span>
    </label>
    <input type="range" class="chatooly-slider" id="opacity-slider" min="0" max="100" value="50">
</div>
```

### Toggle Switches

```html
<!-- ❌ OLD (checkbox approach) -->
<input type="checkbox" id="toggle">
<label for="toggle">Enable Feature</label>

<!-- ✅ NEW (proper toggle component) -->
<div class="chatooly-toggle-group">
    <button type="button"
            class="chatooly-toggle"
            id="feature-toggle"
            role="switch"
            aria-pressed="false">
        <span class="chatooly-toggle-slider"></span>
    </button>
    <label class="chatooly-toggle-label" for="feature-toggle">Enable Feature</label>
</div>
```

### Color Pickers

```html
<!-- ❌ OLD -->
<input type="color" value="#ff0000">

<!-- ✅ NEW -->
<div class="chatooly-color-group">
    <label class="chatooly-color-label" for="bg-color">Background Color</label>
    <input type="color" class="chatooly-color-input" id="bg-color" value="#ff0000">
</div>
```

### Collapsible Sections

```html
<!-- ✅ NEW (recommended structure) -->
<div class="chatooly-section-card">
    <h3 class="chatooly-section-header">🎨 Advanced Settings</h3>
    <div class="chatooly-section-content">
        <!-- Your controls here -->
    </div>
</div>
```

## Complete Component Reference

### Available Explicit Classes

```css
/* Form Controls */
.chatooly-btn              /* Primary button */
.chatooly-input            /* Text/number/email inputs */
.chatooly-select           /* Dropdown selects */
.chatooly-textarea         /* Multi-line text */
.chatooly-slider           /* Range input */
.chatooly-toggle           /* Switch control */
.chatooly-color-input      /* Color picker */

/* Form Structure */
.chatooly-input-group      /* Input + label wrapper */
.chatooly-input-label      /* Label for inputs */
.chatooly-slider-group     /* Slider + value display wrapper */
.chatooly-slider-label     /* Slider label */
.chatooly-slider-value     /* Slider current value display */
.chatooly-toggle-group     /* Toggle + label wrapper */
.chatooly-toggle-label     /* Toggle label */
.chatooly-toggle-slider    /* Toggle inner slider element */
.chatooly-color-group      /* Color picker wrapper */
.chatooly-color-label      /* Color picker label */

/* Layout */
.chatooly-section-card     /* Collapsible section container */
.chatooly-section-header   /* Section title */
.chatooly-section-content  /* Section content area */
.chatooly-app-container    /* Full app layout */
.chatooly-controls-panel   /* Left sidebar */
.chatooly-preview-panel    /* Right canvas area */
```

## Migration Checklist

### For Existing Tools (Optional)

- [ ] Review all HTML form controls
- [ ] Add explicit `.chatooly-*` classes to buttons
- [ ] Add explicit `.chatooly-*` classes to inputs
- [ ] Add explicit `.chatooly-*` classes to selects
- [ ] Add explicit `.chatooly-*` classes to sliders
- [ ] Wrap controls in structured groups (`.chatooly-input-group`, etc.)
- [ ] Test tool still works correctly
- [ ] Verify exports still function

### For New Tools (Mandatory)

- [x] Use `index-v2.html` template with explicit classes
- [x] Apply `.chatooly-btn` to ALL buttons
- [x] Apply `.chatooly-input` to ALL text inputs
- [x] Apply `.chatooly-select` to ALL dropdowns
- [x] Apply `.chatooly-slider` to ALL range inputs
- [x] Apply `.chatooly-toggle` to ALL switch controls
- [x] Apply `.chatooly-color-input` to ALL color pickers
- [x] Use structured wrappers (`.chatooly-input-group`, etc.)
- [x] Test tool functionality
- [x] Verify exports work correctly

## Timeline

### Current (v2.0)

- ✅ Both explicit classes AND plain HTML elements work
- ✅ Universal fallback provides automatic styling
- ✅ No breaking changes for existing tools
- ✅ New tools SHOULD use explicit classes

### Future (v2.1 - v2.9)

- ⚠️ Deprecation warnings for plain HTML elements (console)
- ⚠️ Documentation emphasizes explicit classes
- ⚠️ Migration guides and tools provided
- ✅ Both approaches still work (no breaking changes)

### Breaking Change (v3.0+)

- ❌ Universal fallback removed from CDN
- ❌ Plain HTML elements no longer auto-styled
- ✅ Explicit classes continue working normally
- ⚠️ Tools using plain HTML will need migration

## Testing Your Migration

### Visual Testing

1. View your tool in the preview panel
2. Verify all controls render correctly:
   - Buttons have gray-green background
   - Inputs have green-beige background
   - Selects have proper styling
   - Sliders have custom appearance
   - Toggles display correctly
3. Test all control interactions
4. Verify dark theme consistency

### Export Testing

1. Click export button (📥)
2. Test PNG export at 1x, 2x, 4x resolutions
3. Verify exported images show correct content
4. Check that controls aren't included in exports

### Compatibility Testing

1. Test in Chrome, Firefox, Safari
2. Test on mobile devices
3. Verify responsive behavior
4. Check console for errors

## Resources

- **Live CSS Variables**: [https://raw.githubusercontent.com/yaelren/chatooly-cdn/main/css/variables.css](https://raw.githubusercontent.com/yaelren/chatooly-cdn/main/css/variables.css)
- **Live Components**: [https://raw.githubusercontent.com/yaelren/chatooly-cdn/main/css/components.css](https://raw.githubusercontent.com/yaelren/chatooly-cdn/main/css/components.css)
- **Legacy Fallback Documentation**: [chatooly-cdn/css/README-COMPAT.md](https://github.com/yaelren/chatooly-cdn/blob/main/css/README-COMPAT.md)
- **Template v2.0**: `index-v2.html` (explicit classes example)

## Questions?

If you have questions about migrating to explicit classes or the design system architecture, check:

1. `START_HERE.md` - Full implementation guide
2. `CLAUDE.md` - AI assistant instructions
3. `.cursorrules` - Development verification checklist
4. [Chatooly CDN Compatibility Report](https://github.com/yaelren/chatooly-cdn/blob/main/COMPATIBILITY_REPORT.md)

---

**Last Updated**: November 6, 2025
**Version**: Chatooly CDN v2.0.0
