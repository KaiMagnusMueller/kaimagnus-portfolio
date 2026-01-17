/**
 * Usage examples for the color node system
 */

import {
    IntegerNode,
    HueNode,
    ChromaNode,
    LuminanceNode,
    CurveNode,
    LinearNode,
    ColorScaleNode,
    connect,
    type ColorNode,
    type ChangeListener,
} from './colorNodes';

/**
 * Example 1: Simple linear scale with direct RangeNode connections
 * Demonstrates: Direct connections without interpolators
 */
export function createSimpleLinearScale() {
    const steps = new IntegerNode('steps-1', 10);
    const hue = new HueNode('hue-1', 200, 280);
    const chroma = new ChromaNode('chroma-1', 0.02, 0.25);
    const luminance = new LuminanceNode('lum-1', 95, 15);

    const scale = new ColorScaleNode('scale-1');

    // Direct connections - scale node will use linear interpolation
    connect(steps, scale, 'steps');
    connect(hue, scale, 'hue');
    connect(chroma, scale, 'chroma');
    connect(luminance, scale, 'luminance');

    return {
        colors: scale.getColors(),
        nodes: { steps, hue, chroma, luminance, scale },
    };
}

/**
 * Example 2: Advanced scale with bezier curves
 * Demonstrates: Explicit interpolator nodes for curved transitions
 */
export function createCurvedScale() {
    const steps = new IntegerNode('steps-2', 11);

    // Define ranges
    const hue = new HueNode('hue-2', 240, 280);
    const chroma = new ChromaNode('chroma-2', 0.02, 0.25);
    const luminance = new LuminanceNode('lum-2', 98, 10);

    // Create curve interpolators
    const hueCurve = new CurveNode('hue-curve-2', { x: 0.3, y: 0.5 }, { x: 0.7, y: 0.5 });
    const chromaCurve = new CurveNode('chroma-curve-2', { x: 0.5, y: 0.7 }, { x: 0.5, y: 0.7 });
    const lumCurve = new CurveNode('lum-curve-2', { x: 0.25, y: 0.5 }, { x: 0.75, y: 0.5 });

    const scale = new ColorScaleNode('scale-2');

    // Connect ranges to interpolators
    connect(hue, hueCurve, 'source');
    connect(chroma, chromaCurve, 'source');
    connect(luminance, lumCurve, 'source');

    // Connect interpolators to scale
    connect(steps, scale, 'steps');
    connect(hueCurve, scale, 'hue');
    connect(chromaCurve, scale, 'chroma');
    connect(lumCurve, scale, 'luminance');

    return {
        colors: scale.getColors(),
        nodes: { steps, hue, chroma, luminance, hueCurve, chromaCurve, lumCurve, scale },
    };
}

/**
 * Example 3: Reactive updates with listeners
 * Demonstrates: Push-based reactivity when values change
 */
export function createReactiveScale() {
    const { nodes } = createCurvedScale();

    // Track number of updates
    let updateCount = 0;
    const updates: string[] = [];

    // Add listener to scale node
    const scaleListener: ChangeListener = (node) => {
        updateCount++;
        const colors = (node as ColorScaleNode).getColors();
        updates.push(`Update ${updateCount}: ${colors.length} colors generated`);
    };

    nodes.scale.onChange(scaleListener);

    // Make changes - listeners will be called automatically
    nodes.hue.setStart(220); // Update 1
    nodes.luminance.setEnd(20); // Update 2
    nodes.steps.setValue(15); // Update 3
    nodes.lumCurve.setControlPoint(1, { x: 0.4, y: 0.6 }); // Update 4

    return {
        nodes,
        updateCount,
        updates,
        currentColors: nodes.scale.getColors(),
    };
}

/**
 * Example 4: Multiple scales sharing sources
 * Demonstrates: Graph structure with shared nodes
 */
export function createMultipleScalesFromSharedSource() {
    // Shared step count
    const steps = new IntegerNode('shared-steps', 8);

    // Shared luminance range
    const luminance = new LuminanceNode('shared-lum', 95, 15);
    const lumCurve = new CurveNode('shared-lum-curve');
    connect(luminance, lumCurve, 'source');

    // Blue scale
    const blueHue = new HueNode('blue-hue', 200, 240);
    const blueChroma = new ChromaNode('blue-chroma', 0.02, 0.3);
    const blueHueCurve = new CurveNode('blue-hue-curve');
    const blueChromaCurve = new CurveNode('blue-chroma-curve');
    const blueScale = new ColorScaleNode('blue-scale');

    connect(blueHue, blueHueCurve, 'source');
    connect(blueChroma, blueChromaCurve, 'source');
    connect(steps, blueScale, 'steps');
    connect(blueHueCurve, blueScale, 'hue');
    connect(blueChromaCurve, blueScale, 'chroma');
    connect(lumCurve, blueScale, 'luminance');

    // Red scale
    const redHue = new HueNode('red-hue', 10, 30);
    const redChroma = new ChromaNode('red-chroma', 0.02, 0.28);
    const redHueCurve = new CurveNode('red-hue-curve');
    const redChromaCurve = new CurveNode('red-chroma-curve');
    const redScale = new ColorScaleNode('red-scale');

    connect(redHue, redHueCurve, 'source');
    connect(redChroma, redChromaCurve, 'source');
    connect(steps, redScale, 'steps');
    connect(redHueCurve, redScale, 'hue');
    connect(redChromaCurve, redScale, 'chroma');
    connect(lumCurve, redScale, 'luminance');

    return {
        blueColors: blueScale.getColors(),
        redColors: redScale.getColors(),
        nodes: { steps, luminance, lumCurve, blueScale, redScale },
    };
}

/**
 * Example 5: Real-time reactivity simulation
 * Demonstrates: How UI updates would work with change listeners
 */
export function simulateUIUpdates() {
    const { nodes } = createCurvedScale();

    // Simulate UI state
    const uiState = {
        colorSwatches: [] as string[],
        lastUpdate: null as Date | null,
    };

    // UI update function (simulates rendering)
    const updateUI = (node: ColorNode) => {
        const colors = (node as ColorScaleNode).getColors();
        uiState.colorSwatches = colors.map((c) => c.toString({ format: 'hex' }));
        uiState.lastUpdate = new Date();
    };

    // Register UI updater
    nodes.scale.onChange(updateUI);

    // Simulate user interactions
    const interactions = [
        () => nodes.hue.setStart(180),
        () => nodes.hue.setEnd(300),
        () => nodes.chroma.setRange(0.05, 0.35),
        () => nodes.steps.setValue(12),
        () => nodes.lumCurve.setControlPoint(2, { x: 0.8, y: 0.4 }),
    ];

    // Execute interactions - UI updates automatically
    interactions.forEach((interaction, i) => {
        interaction();
        console.log(`After interaction ${i + 1}:`, uiState.colorSwatches.slice(0, 3));
    });

    return { nodes, uiState };
}

/**
 * Example 6: Performance - cached computation
 * Demonstrates: Colors are only recomputed when needed
 */
export function demonstrateCaching() {
    const { nodes } = createCurvedScale();

    // First call - computes colors
    const t1 = performance.now();
    const colors1 = nodes.scale.getColors();
    const time1 = performance.now() - t1;

    // Second call - returns cached colors (should be much faster)
    const t2 = performance.now();
    const colors2 = nodes.scale.getColors();
    const time2 = performance.now() - t2;

    // Change value - invalidates cache
    nodes.hue.setStart(250);

    // Third call - recomputes colors
    const t3 = performance.now();
    const colors3 = nodes.scale.getColors();
    const time3 = performance.now() - t3;

    return {
        firstCallTime: time1,
        cachedCallTime: time2,
        afterChangeTime: time3,
        speedupFactor: time1 / time2,
        areSame: colors1 === colors2, // Should be true (same array reference)
        areDifferent: colors2 !== colors3, // Should be true (new array after change)
    };
}

/**
 * Example 7: Complex graph with multiple interpolators
 * Demonstrates: Mixing linear and curved interpolations
 */
export function createMixedInterpolationScale() {
    const steps = new IntegerNode('steps-mixed', 9);

    // Hue: Linear interpolation
    const hue = new HueNode('hue-mixed', 180, 240);
    const hueLinear = new LinearNode('hue-linear-mixed');
    connect(hue, hueLinear, 'source');

    // Chroma: Curved interpolation (ease-in-out)
    const chroma = new ChromaNode('chroma-mixed', 0.01, 0.3);
    const chromaCurve = new CurveNode('chroma-curve-mixed', { x: 0.42, y: 0 }, { x: 0.58, y: 1 });
    connect(chroma, chromaCurve, 'source');

    // Luminance: Direct connection (automatic linear)
    const luminance = new LuminanceNode('lum-mixed', 98, 12);

    const scale = new ColorScaleNode('scale-mixed');

    connect(steps, scale, 'steps');
    connect(hueLinear, scale, 'hue');
    connect(chromaCurve, scale, 'chroma');
    connect(luminance, scale, 'luminance'); // Direct connection

    return {
        colors: scale.getColors(),
        nodes: { steps, hue, chroma, luminance, hueLinear, chromaCurve, scale },
    };
}
