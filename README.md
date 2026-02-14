# Svelte marketplace template   

template for creating a widget in Svelte framework

The purejs-web-component.js is a simple web component example _not_ using Svelte

## setup
You need to have NPM installed first. Then run this command to install dependencies:

npm instal
To compile the svelte widgets run:

npm run build

To run the svelte widgets in a local web server run:

npm run dev 
 
...and then use a web browser to open whatever address the local server says it is running on, e.g. http://localhost:5173

## Hybrid mockup structure

- Shared renderer styles: `/home/runner/work/svelte-widget-template/svelte-widget-template/public/styles/renderer.shared.css`
- Per-diagram specs: `/home/runner/work/svelte-widget-template/svelte-widget-template/public/specs/diagram1|2|3.spec.json`
- Per-diagram styles: `/home/runner/work/svelte-widget-template/svelte-widget-template/public/specs/diagram1|2|3.style.css`
- Example generator module: `/home/runner/work/svelte-widget-template/svelte-widget-template/src/lib/example-generator.js`

Open `/home/runner/work/svelte-widget-template/svelte-widget-template/public/mockups/diagram_hybrid.html`:
- No query string: overview showing all three diagram outputs.
- `?example=diagram1|diagram2|diagram3`: render one diagram spec + style.

To add a new diagram:
1. Add `public/specs/<name>.spec.json`.
2. Add `public/specs/<name>.style.css`.
3. Register paths/title in `src/lib/example-generator.js`.
