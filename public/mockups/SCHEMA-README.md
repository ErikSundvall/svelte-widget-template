# Hybrid Diagram Schema

This directory contains the schema definition and validation tools for the hybrid Vega Lite-style diagram specification.

## Overview

The diagram uses a **hybrid approach** that combines:
- **Vega Lite-inspired declarative configuration** for ease of use
- **Custom D3 rendering** for advanced interactions and visualizations
- **Multi-track time-series layout** not available in standard Vega Lite

## Schema Compliance

### Standard Vega Lite Elements

The specification uses standard Vega Lite naming and structure where possible:

- ✅ **Series types**: `line`, `point`, `categorical` (standard Vega Lite types)
- ✅ **$schema reference**: Points to Vega Lite v5 for compatibility
- ✅ **Color specifications**: Standard hex color format
- ✅ **Curve types**: `monotoneX`, `linear` (D3 curve types used by Vega Lite)

### Custom Extensions

The following are custom extensions for multi-track visualizations:

| Property | Description | Reason for Extension |
|----------|-------------|---------------------|
| `tracks[]` | Array of track specifications | Standard Vega Lite uses `layer` or `vconcat`, but doesn't support proportional heights with shared time axis |
| `track.weight` | Proportional height for track | Enables responsive layout with tracks sized relative to each other |
| `axis.domain: null` | Auto-scaling from data | Vega Lite compatible - triggers automatic domain calculation |
| `series.symbol` | Custom shapes: `v`, `v-inv`, `circle-filled` | Medical visualization requires specific marker shapes |
| `series.connectTo` | Reference to related series | Links systolic/diastolic blood pressure measurements |
| `series.hollow` | Hollow marker style | Distinguishes pulse sources (BP machine vs oximeter) |
| `config.style` | Declarative styling | Vega Lite compatible - centralizes visual styling |

## Files

- **`hybrid-diagram-schema.json`**: JSON Schema definition for the hybrid format
- **`validate-schema.js`**: Node.js validation script
- **`diagram_hybrid.html`**: Implementation using the schema

## Usage

### Validate the Specification

```bash
cd public/mockups
node validate-schema.js
```

### Schema for Configuration Tool

The `hybrid-diagram-schema.json` file can be used to:
1. **Generate configuration UIs** using tools like [JSON Schema Form](https://github.com/rjsf-team/react-jsonschema-form)
2. **Validate configurations** before rendering
3. **Provide autocomplete** in IDEs supporting JSON Schema
4. **Document the API** for developers

## Design Rationale

### Why Not Pure Vega Lite?

Standard Vega Lite doesn't support:
- **Multiple tracks with shared time axis** and proportional heights
- **Voronoi-based point selection** with crosshairs across all tracks
- **Custom symbol shapes** (V-shapes for blood pressure)
- **Dynamic connections** between related data points

### Why This Hybrid Approach?

- ✅ **Declarative**: Easy to configure without writing D3 code
- ✅ **Extensible**: Custom properties for domain-specific needs
- ✅ **Performant**: Optimized D3 rendering for large time-series
- ✅ **Interactive**: Rich interactions (Voronoi, crosshairs, tooltips)
- ✅ **Familiar**: Uses Vega Lite conventions where possible

## Supported Parameters

See `hybrid-diagram-schema.json` for the complete specification. Key sections:

### Config
- `margin`: Layout margins
- `trackGaps`: Vertical spacing between tracks
- `style`: Declarative styling (axes, legend, crosshair, tooltip)

### Track
- `weight`: Proportional height
- `title`: Track title
- `axes[]`: Array of axis specifications
- `series[]`: Array of series specifications
- `legend`: Optional legend configuration

### Axis
- `position`: `left` or `right`
- `domain`: Range or `null` for auto-scaling
- `label`: Axis label
- `color`: Axis color
- `ticks`: Number or array of tick values

### Series
- `type`: `line`, `point`, or `categorical`
- `data`: Reference to data array
- `axis`: Which axis to use
- `color`: Series color
- `symbol`: Point marker shape (for `point` type)
- `hollow`: Hollow marker (for `point` type)
- `connectTo`: Connect to another series (for `point` type)

## Future Enhancements

- Add TypeScript definitions based on the JSON Schema
- Create automated validation in CI/CD pipeline
- Build configuration UI using the schema
- Add more series types as needed (bar, area, etc.)

## License

Same as parent project.
