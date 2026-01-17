# Svelte 5 Reactive Runes - Usage Examples

## Basic Component Integration

### In an Astro Page

```astro
---
import PlaygroundViewer from '@components/PlaygroundViewer.svelte';
import Layout from '@layouts/Layout.astro';
---

<Layout pageTitle="Color Playground" pageDescr="Interactive color scale generator">
	<PlaygroundViewer client:load />
</Layout>
```

## Reactive State Patterns

### Pattern 1: Creating Reactive Nodes

```typescript
import { IntegerNode, HueNode } from '@utils/colorNodes';

// Create reactive values
let steps = $state(10);
let hueStart = $state(0);
let hueEnd = $state(360);

// Create nodes with reactive binding
const stepsNode = new IntegerNode('node-1', steps, 'Steps', { current: steps });
const hueNode = new HueNode('node-2', hueStart, hueEnd, 'Hue');

// Changes to state automatically update nodes
function changeSteps(newValue: number) {
    steps = newValue; // Node receives update automatically
}
```

### Pattern 2: Derived Computed Values

```svelte
<script>
	let nodes = $state([]);

	// Automatically updates when nodes changes
	let nodeCount = $derived(nodes.length);

	// Complex derived values
	let scaleNodes = $derived(nodes.filter(n => n.type === 'scale'));
	let hasOutput = $derived(scaleNodes.length > 0);
</script>

{#if hasOutput}
	<p>Found {scaleNodes.length} output nodes</p>
{/if}
```

### Pattern 3: Side Effects with $effect

```svelte
<script>
	let playground = $state(null);
	let selectedNode = $state(null);

	// Automatically runs when playground changes
	$effect(() => {
		if (playground) {
			// Subscribe to changes
			playground.onChange((event) => {
				console.log('Playground changed:', event);
			});
		}
	});
</script>
```

## Node Control Patterns

### Updating Integer Nodes

```svelte
<script>
	import type { IntegerNode } from '@utils/colorNodes';

	let node = $state(null);

	function handleSliderChange(e) {
		const value = parseInt(e.target.value);
		(node as IntegerNode).setValue(value);
		// Automatically triggers downstream updates
	}
</script>

<input
	type="range"
	min="1"
	max="50"
	onchange={handleSliderChange}
/>
```

### Updating Channel Nodes

```svelte
<script>
	import type { ChannelNode } from '@utils/colorNodes';

	let node = $state(null);
	let range = $state({ start: 0, end: 360, min: 0, max: 360 });

	// Update when node changes
	$effect(() => {
		if (node) {
			range = (node as ChannelNode).getRange();
		}
	});

	function setStart(value) {
		(node as ChannelNode).setStart(value);
	}
</script>

<input
	type="range"
	value={range.start}
	min={range.min}
	max={range.max}
	onchange={(e) => setStart(parseFloat(e.target.value))}
/>
```

## Playground Integration Patterns

### Pattern 1: Simple Playground Setup

```svelte
<script>
	import { createBasicPlayground } from '@utils/ColorPlayground';

	let playground = $state(null);

	onMount(() => {
		// Creates a pre-configured playground
		playground = createBasicPlayground();
	});
</script>
```

### Pattern 2: Custom Playground

```svelte
<script>
	import { ColorPlayground } from '@utils/ColorPlayground';

	let playground = $state(null);

	function initCustom() {
		playground = new ColorPlayground();

		// Create custom node graph
		const steps = playground.createNode('integer', { value: 5 });
		const hue = playground.createNode('hue', { start: 0, end: 360 });
		const chroma = playground.createNode('chroma', { start: 0, end: 0.3 });
		const lum = playground.createNode('luminance', { start: 100, end: 20 });
		const scale = playground.createNode('scale');

		// Connect nodes
		if (steps && scale) playground.connect(steps.id, scale.id, 'steps');
		if (hue && scale) playground.connect(hue.id, scale.id, 'hue');
		if (chroma && scale) playground.connect(chroma.id, scale.id, 'chroma');
		if (lum && scale) playground.connect(lum.id, scale.id, 'luminance');
	}
</script>

<button onclick={initCustom}>Initialize Custom Playground</button>
```

### Pattern 3: Listening to Changes

```svelte
<script>
	import { ColorPlayground } from '@utils/ColorPlayground';

	let playground = $state(null);
	let lastEvent = $state('');

	function setupListener() {
		playground?.onChange((event) => {
			lastEvent = `${event.type} - Node: ${event.nodeId || 'N/A'}`;
		});
	}

	$effect(() => {
		if (playground) {
			setupListener();
		}
	});
</script>

<p>Last event: {lastEvent}</p>
```

## Component Communication Patterns

### Parent to Child: Passing Reactive Props

```svelte
<!-- Parent -->
<script>
	let selectedNode = $state(null);
</script>

<NodeCard node={selectedNode} />

<!-- Child -->
<script>
	let { node } = $props();

	// Reactively updates when parent changes selectedNode
	$effect(() => {
		console.log('Selected node changed:', node);
	});
</script>
```

### Child to Parent: Callbacks

```svelte
<!-- Child -->
<script>
	let { onUpdate } = $props();

	function handleChange(value) {
		onUpdate?.(value);
	}
</script>

<!-- Parent -->
<script>
	function handleNodeUpdate(value) {
		console.log('Node updated:', value);
	}
</script>

<NodeCard onUpdate={handleNodeUpdate} />
```

## Performance Optimization Patterns

### Pattern 1: Memoized Values

```svelte
<script>
	let nodes = $state([]);

	// Only recalculates when nodes array identity changes
	let nodesByType = $derived.by(() => {
		const map = {};
		nodes.forEach(n => {
			map[n.type] = (map[n.type] || 0) + 1;
		});
		return map;
	});
</script>
```

### Pattern 2: Conditional Effects

```svelte
<script>
	let node = $state(null);
	let isDirty = $state(false);

	// Only run effect when node has a type field
	$effect.pre(() => {
		if (node && 'getColors' in node) {
			isDirty = true;
		}
	});
</script>
```

## Error Handling Patterns

### Safe State Access

```svelte
<script>
	let playground = $state<ColorPlayground | null>(null);

	function addNode(type) {
		if (!playground) {
			console.error('Playground not initialized');
			return;
		}

		const node = playground.createNode(type);
		if (!node) {
			console.error(`Failed to create ${type} node`);
		}
	}
</script>
```

### Try-Catch in Effects

```svelte
<script>
	let data = $state(null);

	$effect.pre(() => {
		try {
			// Risky operation
			const parsed = JSON.parse(data);
			// Process parsed data
		} catch (error) {
			console.error('Parse error:', error);
		}
	});
</script>
```

## Testing Patterns

### Unit Testing Nodes

```typescript
import { IntegerNode } from '@utils/colorNodes';

describe('IntegerNode', () => {
    it('should update value reactively', () => {
        const node = new IntegerNode('test-1', 5);
        let called = false;

        node.onChange(() => {
            called = true;
        });

        node.setValue(10);
        expect(called).toBe(true);
        expect(node.getValue()).toBe(10);
    });
});
```

### Component Testing

```svelte
<!-- Test -->
<script>
	import { render } from '@testing-library/svelte';
	import NodeCard from './NodeCard.svelte';
	import { IntegerNode } from '@utils/colorNodes';

	it('displays node name', () => {
		const node = new IntegerNode('test', 5, 'Test Node');
		const { getByDisplayValue } = render(NodeCard, { props: { node } });

		expect(getByDisplayValue('Test Node')).toBeInTheDocument();
	});
</script>
```

## Real-World Example: Color Palette Generator

```svelte
<script lang="ts">
	import { createBasicPlayground } from '@utils/ColorPlayground';
	import type { ColorPlayground } from '@utils/ColorPlayground';

	let playground = $state<ColorPlayground | null>(null);
	let palette = $state<string[]>([]);
	let exportFormat = $state<'css' | 'json'>('css');

	$effect(() => {
		if (playground) {
			const scaleNodes = playground.getNodesByType('scale');
			if (scaleNodes.length > 0 && 'getColors' in scaleNodes[0]) {
				const colors = scaleNodes[0].getColors();
				palette = colors.map(c => c.toString());
			}
		}
	});

	function exportPalette() {
		if (exportFormat === 'css') {
			const css = palette
				.map((color, i) => `--color-${i}: ${color};`)
				.join('\n');
			console.log(css);
		} else {
			console.log(JSON.stringify(palette, null, 2));
		}
	}

	onMount(() => {
		playground = createBasicPlayground();
	});
</script>

{#if palette.length > 0}
	<div class="preview">
		{#each palette as color}
			<div style="background-color: {color}"></div>
		{/each}
	</div>

	<select bind:value={exportFormat}>
		<option value="css">CSS Variables</option>
		<option value="json">JSON</option>
	</select>

	<button onclick={exportPalette}>Export</button>
{/if}
```

These patterns cover most common use cases. Mix and match based on your needs!
