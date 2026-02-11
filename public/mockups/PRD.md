# Product Requirements Document (PRD): Configurable Diagrams
**Status**: Refined (Round 9 Findings)

## 1. Overview
This document defines the requirements for a set of configurable, vertically stacked diagrams for visualizing openEHR OBSERVATIONS data. Only the datatypes DV_QUANTITY, DV_COUNT, DV_ORDINAL and DV_SCALE need to be supported.

The visualization uses a single responsive SVG container with a shared time-based X-axis.

## 2. Layout & Responsiveness
- **Container**: Single SVG instance (`<svg>`) reacting to container size via `ResizeObserver`.
- **Dimensions**: Fully responsive. Width fills container; Height fills container minus margins (no scrollbars).
- **Proportional Tracks**: 
    - 3 vertical tracks with configurable relative heights (e.g., Temp: 1, BP: 2, Wellbeing: 0.5).
    - Tracks are separated by fixed value gaps (e.g., `20px`).
- **Margins**: Configurable margins for Axes (Left/Right) and Time Axis (Bottom).

## 3. Shared X-Axis (Time)
- **Placement**: Bottom of the chart, visually decoupled from data tracks by a horizontal line or whitespace.
- **Ticks**: Hourly ticks (`d3.timeHour.every(1)`) marked with small vertical lines.
- **Labels (Time)**:
    - Format: `%H:%M`.
    - Density: Filtered to avoid overcrowding (e.g., every 3 hours).
- **Labels (Date)**:
    - Format: `%a %Y-%m-%d` (e.g., "Wed 2026-02-04").
    - Placement:
        1.  **Midnight**: Rendered at every `00:00` tick.
        2.  **Sticky**: If the view starts mid-day, a sticky label renders at `x=0`.
    - **Styling**: Text on an "arrow-shaped" path background (pointing right).
    - **Layering**: Sticky label must be on the **background layer** (`z-index` equivalent) to allow standard midnight labels to overlap it.
    - **Visuals**: Background fill (e.g., `#eef`), no border stroke.

## 4. Track Type Specifications

There is an example mockup implemetation in the file public\mockups\diagram_mockup.html that exemplifies the desired looks and behaviour we want to be possiblle and configurable. Don't modify that mockup file unless explicitly told to, but copy/use approaches from it.
THere are three types of tracks.

### 4.1 Track 1: Type continous values with multiple Y-axes - example Temperature & SpO2 (Top)
- **Y-Axes example**:
    - **Temperature (`°C`)**  Scale on: Left, Stroke colour: Red: . Domain e.g., `[35, 42]` or autoadjust.
    - **SpO2 (`%`)***  Scale on **Right (Blue)**: . Domain `[80, 100]`.
- **Visualization**:
    - **Temp**: Red line curve (`#e63946`) with visible white-filled circles at data points.
    - **SpO2**: Blue dashed line curve (`#0077be`).

### 4.2 Track 2: Type spot measurements on continous scales with different symbols and a legend - example Blood Pressure & Pulse (Middle)
- **Y-Axis**: Linear scale covering Systolic/Diastolic range (e.g., `[40, 160]`).
- **Visualization**:
    - **Systolic**: Down-pointing Triangle (Deep Blue `#457b9d`).
    - **Diastolic**: Up-pointing Triangle (Dark Blue `#1d3557`).
    - **Pulse**: Hollow Circle with Red outline (`#e63946`).
    - **Connection**: Dashed vertical line connecting Systolic and Diastolic for the same reading.
- **Features**: Includes an in-chart legend describing the symbols.

### 4.3 Track 3: Type Categorical with different symbols and a legend - example Wellbeing (Bottom)
- **Y-Axis**: 
    - Domain: `[0.5, 5.5]` (for 1-5 Scale).
    - **Ticks**: Visible notches drawn at *grid lines* (0.5, 1.5, 2.5, 3.5, 4.5, 5.5).
    - **Labels**: Integer values (1, 2, 3, 4, 5) centered in the bands, *without* associated ticks.
- **Grid**: Horizontal full-width lines at `.5` intervals.
- **Visualization**:
    - Rectangular markers (`width: 12px`, `height: ~80% of band`).
    - Color-coded by value (e.g., distinct semantic colors).

## 5. Interaction & UX
- **Hover Crosshair**: Vertical dashed line spanning all 3 tracks, following mouse X-position.
- **Data Point Selection**:
    - **Voronoi Overlay**: Invisible `d3. Delaunay` mesh covering the entire data area.
    - **Mechanism**: Captures mousemove to find the *nearest* data point (across any track) to cursor.
    - **Feedback**: Highlight circle on the specific nearest point.
- **Tooltip**:
    - **Content**: Label (Type), Full Timestamp (`%Y-%m-%d %H:%M`), Value + Unit.
    - **Data Handling**: Must use explicit timestamp from source to avoid `NaN` errors on sparse datasets.
    - **Position**: Floating near the data point.

## 6. Technical Constraints
- **Library**: D3.js v7+.
- **Data Robustness**: Must handle sparse data (nulls in specific tracks), sparse timestamps, and high-density points.
- **Performance**: Use efficient rendering (single SVG, flattened Voronoi search).
