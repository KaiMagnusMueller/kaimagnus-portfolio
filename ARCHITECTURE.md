# Color Node System Architecture

## Overview

The system consists of three main layers:

1. **Data Layer** (`colorNodes.ts`) - Node classes with computation and reactivity
2. **UI Metadata Layer** (`nodeUIMetadata.ts`) - Declarative UI specifications
3. **Management Layer** (`ColorPlayground.ts`) - Graph management and high-level API
4. **Presentation Layer** (`NodeUI.svelte`, `PlaygroundViewer.svelte`) - UI components

## Key Design Principles

### 1. **Derive UI from Data Structure**

Each node class has corresponding metadata that describes:

- Display name and description
- Visual color for the UI
- Field types and constraints
- Connection rules and requirements

```typescript
// Node class
export class HueNode extends ChannelNode {
    constructor(id: string, start = 0, end = 360, name?: string) {
        super(id, 'hue', start, end, 0, 360, name);
    }
}

// Corresponding UI metadata
hue: {
    displayName: 'Hue Range',
    description: 'Defines hue start and end values (0-360°)',
    color: '#ec4899',
    fields: [
        {
            key: 'start',
            label: 'Start',
            inputType: 'slider',
            min: 0,
            max: 360,
            step: 1,
            unit: '°',
            getter: 'getRange',
            setter: 'setStart'
        },
        // ...
    ]
}
```

### 2. **Bi-Directional Reactivity**

**Pull-based (Computation)**:

```typescript
scale.getColors() // Pulls data through graph
→ interpolator.getInterpolator()
→ rangeNode.getRange()
→ Computes and caches result
```

**Push-based (Updates)**:

```typescript
hue.setStart(220) // Pushes change notifications
→ notifyChange()
→ Propagates to all outputs
→ Marks caches as dirty
→ Triggers UI listeners
```

### 3. **ColorPlayground Management**

The playground provides high-level operations:

```typescript
const playground = new ColorPlayground();

// Create nodes
const hue = playground.createNode('hue', { start: 200, end: 280 });
const scale = playground.createNode('scale');

// Connect them
playground.connect(hue.id, scale.id, 'hue');

// Listen for changes
playground.onChange((event) => {
    if (event.type === 'node-updated') {
        updateUI();
    }
});

// Update values
playground.updateNode(hue.id, 'start', 220);
```

### 4. **UI Component Hierarchy**

**PlaygroundViewer** (Top-level):

- Manages node list and selection
- Provides toolbar for adding nodes
- Shows playground statistics

**NodeUI** (Node-level):

- Renders node based on metadata
- Shows connections with disconnect buttons
- Generates appropriate inputs for each field type
- Handles value changes

## Node Types

### Source Nodes

- **IntegerNode**: Provides step counts
- **HueNode**: Hue range (0-360°)
- **ChromaNode**: Chroma range (0-0.4)
- **LuminanceNode**: Luminance range (0-100%)

### Transform Nodes

- **CurveNode**: Cubic bezier interpolation
- **LinearNode**: Linear interpolation

### Output Nodes

- **ColorScaleNode**: Generates color array from inputs

## Connection Rules

Connections are validated based on node type compatibility:

```typescript
scale.inputs = {
    steps: accepts['integer'],
    hue: accepts[('curve', 'linear', 'hue')], // Direct or interpolated
    chroma: accepts[('curve', 'linear', 'chroma')],
    luminance: accepts[('curve', 'linear', 'luminance')],
};
```

## Field Types

The system supports various input types, automatically generated:

- **number**: Standard number input
- **slider**: Range slider with live value display
- **text**: Text input
- **bezier**: Bezier curve editor (string format for now: "0.25,0.5;0.75,0.5")
- **color-preview**: Read-only color swatch array
- **readonly**: Display-only values

## Usage Examples

### Creating a Simple Scale

```typescript
const playground = new ColorPlayground();

playground.createNode('integer', { value: 10 });
playground.createNode('hue', { start: 200, end: 280 });
playground.createNode('chroma', { start: 0.02, end: 0.25 });
playground.createNode('luminance', { start: 95, end: 15 });
playground.createNode('scale');

// Connect in UI or programmatically
```

### Listening to Changes

```typescript
const scale = playground.getNode('node-5');

scale.onChange((node) => {
    const colors = (node as ColorScaleNode).getColors();
    console.log(`Generated ${colors.length} colors`);
});
```

### Saving/Loading

```typescript
// Save
const json = playground.serialize();
localStorage.setItem('myPlayground', json);

// Load
const json = localStorage.getItem('myPlayground');
playground.load(json);
```

## Future Enhancements

1. **Visual Bezier Editor**: Replace string input with interactive curve editor
2. **Connection UI**: Visual node graph with draggable connections
3. **Presets**: Save and load common node configurations
4. **Export**: Generate CSS variables, JSON, or code
5. **Advanced Interpolators**: Add easing presets, custom functions
6. **Color Space Options**: Support other color spaces (HSL, HSV, etc.)
7. **Validation**: Real-time feedback for invalid connections
8. **Undo/Redo**: History management
