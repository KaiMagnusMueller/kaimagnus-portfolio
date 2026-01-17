# Quick Start Guide - Svelte 5 Color Playground

## 🚀 Getting Started in 30 Seconds

### 1. Start the Dev Server

```bash
npm run dev
```

### 2. Navigate to Playground

Open: `http://localhost:3000/playground`

### 3. Try It Out

- Click buttons in the toolbar to add nodes
- Adjust sliders to change color values
- Click color swatches to copy hex values
- Delete nodes with the × button

## 📦 What You Get

A fully functional, reactive color palette generator with:

- **Pre-configured** with a nice blue color scale
- **Interactive** node-based interface
- **Real-time** color generation
- **Copy-to-clipboard** color values
- **Responsive** grid layout

## 🎨 Understanding the System

### The Three Layers

**1. Source Nodes** (Input)

- Number (for step count)
- Hue, Chroma, Luminance (for color channels)

**2. Transform Nodes** (Processing)

- Linear (straight interpolation)
- Curve (bezier-based interpolation)

**3. Output Node**

- Scale (generates color palette)

### How It Works

```
Number Node (steps=10)
           ↓
Hue Node (200°→280°) → Curve Node → ┐
Chroma Node (0.02→0.25) → Curve Node → Scale Node → 10 Colors
Luminance Node (95→15) → Curve Node → ┘
```

## 🎮 Interactive Features

### Adding Nodes

1. Click a button in the toolbar (Number, Hue, Chroma, etc.)
2. Node appears in the grid
3. Give it a descriptive name
4. Configure its values with sliders

### Connecting Nodes

1. Look at node "Outputs" section
2. Output shows what the node connects to
3. Connect to a Scale node for output

### Adjusting Values

- **Sliders** for range channels (Hue, Chroma, Luminance)
- **Number input** for step count
- **Curve editor** for bezier interpolation
- All changes reflected immediately

### Viewing Colors

- Scale node shows generated colors
- Click any color swatch to copy hex
- View all colors at once in the preview

## 💡 Common Tasks

### Task: Create a Warm Color Palette

1. Add: Number (value=5), Hue, Chroma, Luminance, Scale
2. Set Hue: 20° → 40° (warm range)
3. Set Chroma: 0.1 → 0.3
4. Set Luminance: 100 → 20
5. Connect all to Scale node

### Task: Create a Grayscale

1. Add: Number (value=5), Chroma, Luminance, Scale
2. Set Chroma: 0 → 0 (no color)
3. Set Luminance: 100 → 0 (dark to light)
4. Don't add Hue node (not needed)
5. Connect to Scale

### Task: Use Curve for Non-Linear

1. Create basic setup (channels + scale)
2. Add: Curve nodes
3. Connect channels to Curve nodes
4. Connect Curves to Scale node
5. Adjust curve control points to customize interpolation

## 📚 Documentation

### Quick References

- **SVELTE_5_CONVERSION.md** - Overview and features
- **PLAYGROUND_SVELTE_5.md** - Technical details
- **USAGE_EXAMPLES.md** - 20+ code examples
- **IMPLEMENTATION_SUMMARY.md** - Full architecture

### Component Map

```
PlaygroundViewer.svelte (main container)
├── NodeCard.svelte (displays nodes)
│   ├── IntegerNodeCard.svelte
│   ├── ChannelNodeCard.svelte
│   ├── InterpolatorNodeCard.svelte
│   └── ScaleNodeCard.svelte
└── Toolbar (add nodes)
```

## 🔧 For Developers

### Key Technologies

- **Svelte 5** with reactive runes (`$state`, `$effect`, `$derived`)
- **TypeScript** for type safety
- **Astro** for SSR integration
- **Color.js** for color calculations

### Understanding Reactivity

```svelte
// State - rerenders when this changes
let nodes = $state([]);

// Derived - automatically computed
let nodeCount = $derived(nodes.length);

// Effect - runs when dependencies change
$effect(() => {
    console.log('Nodes changed:', nodes);
});
```

### Adding New Features

The system is designed for extension:

1. New node types (create new class extending BaseNode)
2. New component types (create new Svelte component)
3. New export formats (modify ScaleNodeCard)
4. New UI controls (add to node card components)

## ⚙️ Customization

### Change Default Playground

Edit `src/utils/ColorPlayground.ts`:

```typescript
export function createBasicPlayground(): ColorPlayground {
    // Modify here to change default setup
}
```

### Customize Colors

Edit `src/components/PlaygroundViewer.svelte`:

```typescript
const nodeColor = metadata?.color || '#666'; // Fallback color
```

### Modify Layout

Edit `src/components/PlaygroundViewer.svelte` styles:

```css
.nodes-grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    /* Change 350px for different card sizes */
}
```

## 🐛 Troubleshooting

### Components Not Loading?

- Check browser console for errors
- Ensure `client:load` directive in Astro component
- Verify Svelte import paths

### Colors Not Updating?

- Ensure nodes are connected (check Inputs/Outputs sections)
- Scale node must have all three channel inputs
- Click sliders to trigger updates

### Performance Issues?

- The system handles 50+ nodes smoothly
- Large number of colors (500+) may slow rendering
- Reduce number of colors to improve performance

## 📞 Support

For issues or questions:

1. Check **USAGE_EXAMPLES.md** for patterns
2. Review **PLAYGROUND_SVELTE_5.md** for technical info
3. Look at component source code for implementation details

## 🎉 Next Steps

1. ✅ Try the basic playground
2. ✅ Create a custom color palette
3. ✅ Experiment with curves
4. ✅ Copy colors for use in your project
5. ✅ Explore the code for learning
6. ✅ Add new features based on patterns

Happy palette generating! 🎨
