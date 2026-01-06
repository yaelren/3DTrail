# Chatooly Workflow & Setup

## 📁 PROJECT FILE STRUCTURE

**AI Agents: Follow this file organization strictly:**

```
chatooly-template/
├── index.html              # Main HTML structure
├── js/
│   ├── main.js            # Canvas/tool logic and rendering
│   ├── ui.js              # UI controls, collapsible sections, form interactions
│   └── chatooly-config.js # Tool configuration and metadata
```

### File Responsibilities:
- **`js/main.js`**: Canvas rendering, tool logic, game loops, animations, data processing, export functions
- **`js/ui.js`**: Collapsible sections, show/hide controls, form validation, UI state management, DOM interactions
- **`js/chatooly-config.js`**: Tool metadata only (name, category, tags, export settings)

### When to Use Which File:
- Adding canvas click handlers? → `js/main.js`
- Adding collapsible menu? → `js/ui.js`
- Adding slider that affects rendering? → Event listener in `js/ui.js`, render logic in `js/main.js`
- Changing tool name/category? → `js/chatooly-config.js`

## 🎯 When User Says "Let's Start" or "Build a Tool"

### Step 0: Verify Project Location
First, check if we're in the correct project folder:
- Look for `index.html`, `package.json`, and the `js` folder
- If these files aren't visible, we might be in the wrong folder
- Ask the user to navigate to their chatooly-template folder
- The correct folder should contain the template files

### Step 0.5: Design Discovery & Reference Gathering (CRITICAL!)

**🎨 BEFORE creating any todo lists or writing code**, gather design context:

#### Phase A: Ask for References and Design Materials

Ask the designer these questions:

1. **"Do you have any reference materials to share?"**
   - Screenshots or images of desired look/feel
   - Links to similar tools or inspirations (e.g., "like tool X on website Y")
   - Design mockups, wireframes, or Figma/Sketch files
   - Color palettes or style references
   - Example interactions or animations you want

2. **"Would you like to create a comprehensive design document first?"**
   - **If YES**: Proceed to Phase B (Create Design Document)
   - **If NO**: Proceed with conversational discovery, but document key points

#### Phase B: Create Comprehensive Design Document (If Requested)

If the user wants a structured design document, create a markdown file `design-spec.md` with:

```markdown
# [Tool Name] - Design Specification

## 1. Tool Concept & Goals
- Primary purpose
- Target users
- Core value proposition

## 2. Visual Design
- Color scheme (primary, secondary, accent colors)
- Typography choices
- Layout structure
- Visual style (minimalist, vibrant, technical, artistic, etc.)

## 3. Interaction Patterns
- User flow (how users interact with the tool)
- Input methods (mouse, keyboard, sliders, buttons, etc.)
- Real-time vs. generate-on-click
- Animation and transitions

## 4. Feature Requirements
- Must-have features
- Nice-to-have features
- Export options needed

## 5. Technical Considerations
- Canvas-based or DOM-based?
- Libraries needed (p5.js, Three.js, Paper.js, etc.)
- Performance requirements
- Mobile support needs

## 6. Reference Materials
- Link to reference images: [...]
- Link to inspiration tools: [...]
- Design files: [...]
```

#### Phase C: Process Reference Materials

For each reference provided:

1. **Images/Screenshots**:
   - Analyze layout and composition
   - Extract color schemes (use color picker if needed)
   - Note UI patterns and control placement
   - Identify canvas vs. DOM elements
   - Note any special effects or interactions

2. **Links to Other Tools**:
   - Test the referenced tool if accessible
   - Document key features and interactions
   - Note technical approach (what library they likely use)
   - Identify aspects user wants to emulate vs. improve

3. **Design Documents**:
   - Read thoroughly and extract requirements
   - Flag any ambiguities for clarification
   - Note technical specifications

#### Phase D: **CRITICAL VALIDATION** - Align Design with Chatooly Rules

**⚠️ THIS IS THE MOST IMPORTANT STEP - ALWAYS DO THIS!**

Before proceeding, validate EVERY design decision against Chatooly rules by reading ALL claude-rules files:

**Validation Checklist** (check against each rule file):

**01-core-rules.md:**
- [ ] All visual content will fit inside `#chatooly-canvas` container?
- [ ] Design doesn't require modifying CDN script?
- [ ] No custom export buttons needed (CDN provides this)?
- [ ] Canvas/visual area can be minimum 800x600px?
- [ ] Design uses CSS variables (not hardcoded colors/fonts)?

**02-workflow-setup.md:**
- [ ] Tool fits one of the standard categories (generators/visualizers/editors/utilities/games/art)?
- [ ] File structure will follow `main.js` (logic) + `ui.js` (controls) + `chatooly-config.js` (metadata)?

**03-canvas-resize.md:**
- [ ] If interactive (user clicks/drags), can elements scale when canvas resizes?
- [ ] Mouse interactions can use coordinate mapping?
- [ ] Design works across different aspect ratios (HD, Square, Portrait)?

**04-high-res-export.md:**
- [ ] Tool can re-render content at higher resolutions (2x, 4x)?
- [ ] Design preserves visual quality when scaled up?
- [ ] Effects/patterns can be regenerated, not just pixel-copied?

**05-library-selection.md:**
- [ ] Appropriate library selected for the design vision?
- [ ] Library integrates with `#chatooly-canvas` export container?
- [ ] For Three.js: Will include `preserveDrawingBuffer: true`?

**06-design-system.md:**
- [ ] Controls will use Chatooly CSS variables?
- [ ] Typography follows Lucida Console font system?
- [ ] Colors align with dark theme design system?

**07-publishing-troubleshooting.md:**
- [ ] Design is simple enough to implement in template structure?
- [ ] No complex dependencies that break publishing?

**08-background-system.md (CRITICAL - ALWAYS REQUIRED):**
- [ ] Background controls WILL be wired to `Chatooly.backgroundManager` API?
- [ ] All 6 event listeners will be connected (transparent, color, image, clear, fit)?
- [ ] Background will render FIRST in render loop (before tool content)?
- [ ] Transparent backgrounds supported in design?
- [ ] Background will be included in high-res export function?
- [ ] Background rendering tested with color, image, and transparency?

#### Phase E: Document Design Decisions & Flag Conflicts

**Create a Design Validation Summary:**

```markdown
## Design Validation Summary

### ✅ Chatooly-Compliant Decisions
- [List design aspects that align with rules]

### ⚠️ Design Adjustments Needed
- [List aspects that need modification to comply with rules]
- [Explain what changes are required and why]

### ❓ Clarifications Needed from User
- [List any design choices that conflict with Chatooly rules]
- [Ask user how they want to resolve conflicts]

### 📋 Implementation Notes
- [Key technical decisions based on design + rules]
- [Library selection rationale]
- [Special considerations for this tool]
```

**If conflicts found**, discuss with user BEFORE creating todo list:
- Explain which design elements conflict with Chatooly rules
- Propose alternative approaches that maintain design intent
- Get user approval on modified approach

#### Phase F: Ready to Proceed Checklist

Only proceed to Step 1 (Create Task List) when ALL are true:

- [ ] All reference materials gathered and analyzed
- [ ] Design document created (if user requested it)
- [ ] ALL 8 claude-rules files read and validated against design
- [ ] Design validation summary created
- [ ] Any conflicts resolved with user
- [ ] Clear technical approach identified
- [ ] Library selection confirmed

**🚨 DO NOT SKIP THIS STEP! Validating design against Chatooly rules BEFORE coding saves massive rework later!**

### Step 1: Create Task List with TodoWrite
Immediately create a todo list to track the build process:
```
✅ Gather tool information
✅ Update configuration
✅ Build HTML structure
✅ Implement main functionality
✅ Wire background controls to backgroundManager API (MANDATORY)
✅ Add canvas resize handling (if needed)
✅ Implement high-res export with background rendering
✅ Test export functionality (including background in exports)
```

### Step 2: Gather Basic Information
Ask the user these questions to fill out the config:
1. What should your tool be called?
2. What category best fits? (generators/visualizers/editors/utilities/games/art)
3. One sentence description of what it does
4. Your name (for author credit)

### Step 3: Update Configuration
Update `js/chatooly-config.js` with their answers:
```javascript
window.ChatoolyConfig = {
    name: "[Tool Name]",
    category: "[category]",
    tags: [], // Add relevant tags based on what they're building
    description: "[Their description]",
    author: "[Their name]",
    version: "1.0.0",
    resolution: 2,
    buttonPosition: "bottom-right"
};
```

### Step 4: Ask What They Want to Create
After config is set, ask: "Great! Now tell me what you want to create and I'll build it for you."

### Step 5: Build According to Chatooly Rules
BEFORE WRITING ANY CODE:
- Re-read the MANDATORY DEVELOPMENT RULES in [01-core-rules.md](01-core-rules.md)
- Verify all visual content will go inside #chatooly-canvas
- Plan which library to use (if any)
- **Plan background system integration** (see [08-background-system.md](08-background-system.md))
- Update TodoWrite with specific implementation tasks including background wiring

## 📋 Claude Code Workflow

### When User Says "Build a Tool"

Claude Code will:

1. **Plan with TodoWrite**
   ```
   ✅ Update configuration
   ✅ Create HTML structure
   ✅ Implement main functionality
   ✅ Add canvas resize handling
   ✅ Implement high-res export
   ✅ Test export functionality
   ```

2. **Gather Information**
   - Tool name
   - Category (generators/visualizers/editors/utilities/games/art)
   - Description
   - Author name

3. **Update Configuration** (`js/chatooly-config.js`)
   ```javascript
   window.ChatoolyConfig = {
       name: "[Tool Name]",
       category: "[category]",
       tags: [],
       description: "[Description]",
       author: "[Author]",
       version: "1.0.0",
       resolution: 2,
       buttonPosition: "bottom-right"
   };
   ```

4. **Build According to Rules**
   - All visual content in `#chatooly-canvas`
   - **Wire background controls to `Chatooly.backgroundManager` API** (MANDATORY)
   - Implement resize handling for interactive tools
   - Use proper mouse coordinate mapping
   - Create high-resolution export function with background rendering
   - Test at different aspect ratios
   - Test background system (color, image upload, transparency)