# Health Metrics Diagrams

This directory contains various approaches to visualizing health metrics data.

## Files

### diagram_hybrid.html
A hybrid approach that combines:
- **Vega Lite-style declarative configuration**: Easy-to-modify JSON specification
- **Custom D3 rendering**: Beautiful, polished visualizations with full control

#### Key Features
- Declarative configuration format inspired by Vega Lite
- Custom D3.js rendering for enhanced aesthetics
- Supports multiple chart types: line-area, line, and bar charts
- Reference lines for target values
- Smooth curves and animations
- Grid lines for better readability
- Responsive legend and axis labels

#### Configuration Structure
The diagram uses a JSON configuration similar to Vega Lite:

```javascript
{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": {
    "values": [/* your data points */]
  },
  "charts": [
    {
      "type": "line-area",  // or "line", "bar"
      "title": "Chart Title",
      "width": 1000,
      "height": 200,
      "encoding": {
        "x": { "field": "date", "type": "temporal" },
        "y": { "field": "value", "domain": [min, max] }
      },
      "layers": [/* visual layers */],
      "referenceLines": [/* target lines */]
    }
  ]
}
```

#### Data Format
Data should be in the following format:
```javascript
{
  "date": "YYYY-MM-DD",
  "systolic": number,     // Blood pressure systolic (mmHg)
  "diastolic": number,    // Blood pressure diastolic (mmHg)
  "pulse": number,        // Pulse rate (bpm)
  "wellbeing": number     // Wellbeing score (1-3)
}
```

#### Why Hybrid Approach?
- **Vega Lite**: Excellent for declarative, easy-to-configure visualizations
- **Custom D3**: Better control over aesthetics, animations, and visual polish
- **Best of Both**: Declarative simplicity + visual beauty

#### Customization
To modify the visualization:
1. Edit the `spec` object to change data, colors, or chart types
2. The D3Renderer class automatically parses and renders the configuration
3. Add new chart types by extending the D3Renderer class

## Usage
Open the HTML file directly in a modern web browser (Chrome, Firefox, Safari, or Edge).
No build process or server required - all dependencies are loaded from CDN.
