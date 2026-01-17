# Color Playground Svelte 5 Conversion

This document describes the conversion of the PlaygroundViewer from an Astro component to a Svelte 5 component with full reactive rune support.

## Overview

The color playground has been completely refactored to use Svelte 5's reactive runes system. This provides:

- **Reactive state management** using `$state` and `$derived` runes
- **Automatic reactivity** for color values and node properties
- **Efficient re-renders** through Svelte's fine-grained reactivity
- **Type-safe** implementation with full TypeScript support

## Components

### PlaygroundViewer.svelte

The main playground component that fills the viewport. It manages the playground instance and orchestrates all node creation, deletion, and connection operations.

**Usage:**

```astro
---
import PlaygroundViewer from '@components/PlaygroundViewer.svelte';
import Layout from '@layouts/Layout.astro';
---

<Layout title="Color Scale Playground">
	<PlaygroundViewer client:load />
</Layout>
```

**Features:**

- Fills entire viewport (100vh × 100vw)
- Auto-initializes with a basic playground setup
- Grid layout for responsive node display
- Toolbar for adding new nodes
- Real-time stats (node count, connection count)

### NodeCard.svelte

Displays individual nodes with all their controls and connections. Routes to specialized node components based on node type.

**Key Features:**

- Reactive name editing
- Connection visualization
- Dynamic field rendering
- Delete functionality
- Type-specific styling via CSS variables

### Node-Specific Components

#### IntegerNodeCard.svelte

Renders controls for integer nodes (number inputs).

#### ChannelNodeCard.svelte

Renders range sliders for channel nodes (Hue, Chroma, Luminance).

#### InterpolatorNodeCard.svelte

Renders bezier curve editor for curve nodes or info for linear nodes.

#### ScaleNodeCard.svelte

Displays the generated color palette with copy-to-clipboard functionality.

## Reactive Features

### State Management with Runes

The node classes now support reactive runes from Svelte:

```typescript
// Create a reactive value
let stepCount = $state(5);

// Pass it to a node
const node = new IntegerNode(id, 10, 'Steps', { current: stepCount });

// Changes to the rune automatically update the node
stepCount = 20; // Node receives the update
```

### Reactive Node Properties

All node value changes automatically trigger downstream reactivity:

```typescript
// In a component:
let range = $state(channelNode.getRange());

// This automatically updates when the node changes
$effect(() => {
    range = channelNode.getRange();
});
```

### Derived State

The playground uses `$derived` for computed properties:

```typescript
let showInputs = $derived(!['integer', 'hue', 'chroma', 'luminance'].includes(node.type));
let showOutputs = $derived(node.type !== 'scale');
```

## Enhanced Node Classes

### BaseNode

- Updated with support for reactive rune state
- Change listeners trigger downstream updates automatically

### IntegerNode

- Can accept optional `ReactiveValue<number>` for state binding
- `setReactiveValue()` method to update reactive state mid-session

### ChannelNode (Hue, Chroma, Luminance)

- Can accept optional `ReactiveValue<number>` for start/end values
- `setReactiveValues()` method for bulk updates
- Range clamping built-in

### ColorScaleNode

- Automatic color regeneration on any input change
- Caching system for efficient re-renders

## ColorPlayground Enhancements

The `ColorPlayground` class now supports reactive state:

```typescript
// Create a node with reactive state
const playground = new ColorPlayground();
const node = playground.createNode('integer', {
    value: 10,
    name: 'Steps',
    reactiveValue: { current: 10 }, // Optional reactive binding
});
```

## Reactivity Flow

```
User Input (slider, text field)
         ↓
Component Event Handler
         ↓
Playground.updateNode()
         ↓
Node.setValue() / Node.setStart() etc.
         ↓
Node.notifyChange()
         ↓
Downstream Node.notifyChange() (propagates)
         ↓
ColorScaleNode cache invalidated
         ↓
Colors regenerated
         ↓
UI re-renders via $state updates
```

## Usage Examples

### Basic Playground

```svelte
<script>
	import PlaygroundViewer from '@components/PlaygroundViewer.svelte';
</script>

<PlaygroundViewer />
```

### Custom Initialization

```svelte
<script lang="ts">
	import { ColorPlayground } from '@utils/ColorPlayground';
	import { IntegerNode } from '@utils/colorNodes';

	let playground = $state<ColorPlayground | null>(null);

	function initializeCustom() {
		playground = new ColorPlayground();

		// Create nodes with or without reactive state
		const steps = playground.createNode('integer', { value: 10, name: 'Steps' });
		const hue = playground.createNode('hue', { start: 200, end: 280, name: 'Hue' });
		// ... connect nodes
	}
</script>
```

## Performance Notes

- **Reactive state updates** are batched automatically by Svelte
- **Change listeners** only trigger for actual value changes (comparisons are strict)
- **Color caching** in `ColorScaleNode` prevents unnecessary recalculations
- **Grid layout** uses efficient CSS Grid with auto-fill

## Browser Support

Requires Svelte 5.3+ and modern browser with ES2020+ support.

## Migration from Astro Version

The old Astro-based components in `src/components/nodes/*.astro` are now superseded by the Svelte versions. The old files can be safely removed once migration is complete.

Key differences:

- No more manual event delegation in scripts
- No more DOM-based state management
- Reactive updates happen automatically
- Components are fully type-safe

## Future Enhancements

Potential improvements:

- Drag-and-drop node arrangement
- Visual connection editor (Bezier curve drawer)
- Undo/redo system
- Preset management
- Export color palettes to various formats
