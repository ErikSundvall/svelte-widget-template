# Roadmap: Enhancing Renderer Reusability and Adding Multiple Diagram Examples

This roadmap outlines steps to implement the plan described in https://github.com/ErikSundvall/svelte-widget-template/pull/2#issuecomment-3897132793. Goals: break out diagram-specific Vega-Lite specs and diagram-specific CSS from the shared renderer code/CSS; make the renderer configurable for multiple diagrams; add two more example specs+CSS for some other healrcare related diagram; and extract the example generator into its own JS file.

## Objectives
- Separate example-specific Vega-Lite specs and CSS from the renderer’s shared CSS and rendering code.
- Ensure one configurable renderer can handle multiple diagrams.
- Add and test two additional (simple) healtcare-related diagram examples using their own Vega-Lite configs and CSS. 
- Extract the example generator into a separate JS file.

## Plan by Workstream

### 1) Separate concerns (specs, CSS, renderer)
- Move the current example’s Vega-Lite spec into `public/specs/diagram1.spec.json`.
- Move the current example’s diagram-specific CSS into `public/specs/diagram1.style.css`.
- Extract reusable renderer CSS into `public/styles/renderer.shared.css` (only shared layout/utility styling).
- Update `public/mockups/diagram_hybrid.html` to load the shared CSS and the example-specific CSS/spec separately.

### 2) Add two more examples (prove configurability)
- Create two new simple examples:
  - `public/specs/diagram2.spec.json` + `public/specs/diagram2.style.css`
  - `public/specs/diagram3.spec.json` + `public/specs/diagram3.style.css`
- Keep the specs simple (e.g., basic bar chart and line chart) to validate the renderer pipeline.
- Make at lest one example spanning long time (months) but low frequency - just a couple of values per month.
- Ensure the renderer can switch between specs via configuration (no code changes needed per diagram).

### 3) Externalize the example generator
- Move any inline/example-generation logic into `src/lib/example-generator.js`.
- Export functions to:
  - Load a given spec JSON (by name/path).
  - Apply associated CSS for that spec.
  - Initialize the renderer with the chosen spec + shared CSS.
- Keep renderer core code decoupled from specific examples.

### 4) Wire up the mockup/demo page
- Update `public/mockups/diagram_hybrid.html` to:
  - Import shared renderer CSS.
  - Dynamically select/load `diagram1`, `diagram2`, or `diagram3` spec + CSS via the example generator.
  - Be able to show all three rendered outputs to demonstrate reuse.

### 5) Testing & validation
- For each of the three diagrams:
  - Verify shared CSS loads and spec-specific CSS overrides correctly.
  - Confirm the Vega-Lite spec renders without errors.
  - Sanity-check that toggling between diagrams does not require renderer code changes (only config/spec/CSS changes).
- Add a lightweight test script to cycle through the three specs and log any render errors.

### 6) Documentation
- Update `README.md` to explain:
  - File layout: shared renderer CSS vs. per-diagram spec/CSS.
  - How to add a new diagram (add new spec JSON + CSS, point the generator to it).
  - How to run the mockup page to view all examples.

## Acceptance checklist
- `public/specs/diagram1|2|3.spec.json` exist and are used.
- `public/specs/diagram1|2|3.style.css` exist and are used.
- `public/styles/renderer.shared.css` contains only reusable styling.
- `src/lib/example-generator.js` exists and is used by the mockup to load specs + CSS.
- `public/mockups/diagram_hybrid.html` can render three distinct diagrams using the same renderer.
- README documents how to add/use multiple diagrams.
