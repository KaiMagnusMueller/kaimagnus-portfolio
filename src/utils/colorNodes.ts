/**
 * Node-based color scale generator using OKLCH color space
 * Implements both pull-based computation and push-based reactivity
 */

import Color from 'colorjs.io';

/**
 * Change listener callback type
 */
export type ChangeListener = (node: ColorNode) => void;

/**
 * Base node interface - all nodes extend this
 */
export interface ColorNode {
    id: string;
    type: string;
    name: string; // User-editable display name
    inputs: Map<string, ColorNode>;
    outputs: Set<ColorNode>;

    // Reactivity methods
    onChange(listener: ChangeListener): void;
    offChange(listener: ChangeListener): void;
    notifyChange(): void;
    setName(name: string): void;
}

/**
 * Abstract base node with reactivity built-in
 */
export abstract class BaseNode implements ColorNode {
    id: string;
    type: string;
    name: string;
    inputs = new Map<string, ColorNode>();
    outputs = new Set<ColorNode>();
    private changeListeners = new Set<ChangeListener>();

    constructor(id: string, type: string, name?: string) {
        this.id = id;
        this.type = type;
        this.name = name || `${type}-${id.slice(0, 4)}`;
    }

    setName(name: string): void {
        this.name = name;
        this.notifyChange();
    }

    onChange(listener: ChangeListener): void {
        this.changeListeners.add(listener);
    }

    offChange(listener: ChangeListener): void {
        this.changeListeners.delete(listener);
    }

    notifyChange(): void {
        // Notify own listeners
        this.changeListeners.forEach((listener) => listener(this));

        // Propagate change downstream to all outputs
        this.outputs.forEach((node) => node.notifyChange());
    }
}

/**
 * Value provider nodes output a single numeric value
 */
export interface ValueNode extends ColorNode {
    getValue(): number;
}

/**
 * Range provider nodes output start and end values
 */
export interface RangeNode extends ColorNode {
    getRange(): { start: number; end: number; min: number; max: number };
}

/**
 * Interpolation function type: takes t ∈ [0,1], returns value in channel units
 */
export type InterpolationFn = (t: number) => number;

/**
 * Interpolator nodes transform ranges into sampling functions
 */
export interface InterpolatorNode extends ColorNode {
    getInterpolator(): InterpolationFn;
}

/**
 * Scale nodes consume interpolators and produce color arrays
 */
export interface ScaleNode extends ColorNode {
    getColors(): Color[];
}

/**
 * Integer value node - provides step counts or other discrete values
 */
export class IntegerNode extends BaseNode implements ValueNode {
    constructor(
        id: string,
        private value: number,
        name?: string,
    ) {
        super(id, 'integer', name);
    }

    getValue(): number {
        return this.value;
    }

    setValue(value: number): void {
        const newValue = Math.round(value);
        if (newValue !== this.value) {
            this.value = newValue;
            this.notifyChange();
        }
    }
}

/**
 * Abstract base for channel nodes (Hue, Chroma, Luminance)
 */
export abstract class ChannelNode extends BaseNode implements RangeNode {
    constructor(
        id: string,
        type: string,
        protected start: number,
        protected end: number,
        protected min: number,
        protected max: number,
        name?: string,
    ) {
        super(id, type, name);
    }

    getRange() {
        return {
            start: this.start,
            end: this.end,
            min: this.min,
            max: this.max,
        };
    }

    setStart(value: number): void {
        const clamped = Math.max(this.min, Math.min(this.max, value));
        if (clamped !== this.start) {
            this.start = clamped;
            this.notifyChange();
        }
    }

    setEnd(value: number): void {
        const clamped = Math.max(this.min, Math.min(this.max, value));
        if (clamped !== this.end) {
            this.end = clamped;
            this.notifyChange();
        }
    }

    setRange(start: number, end: number): void {
        const newStart = Math.max(this.min, Math.min(this.max, start));
        const newEnd = Math.max(this.min, Math.min(this.max, end));
        if (newStart !== this.start || newEnd !== this.end) {
            this.start = newStart;
            this.end = newEnd;
            this.notifyChange();
        }
    }
}

export class HueNode extends ChannelNode {
    constructor(id: string, start = 0, end = 360, name?: string) {
        super(id, 'hue', start, end, 0, 360, name);
    }
}

export class ChromaNode extends ChannelNode {
    constructor(id: string, start = 0, end = 0.4, name?: string) {
        super(id, 'chroma', start, end, 0, 0.4, name);
    }
}

export class LuminanceNode extends ChannelNode {
    constructor(id: string, start = 100, end = 0, name?: string) {
        super(id, 'luminance', start, end, 0, 100, name);
    }
}

/**
 * Cubic Bezier curve interpolator node
 */
export class CurveNode extends BaseNode implements InterpolatorNode {
    constructor(
        id: string,
        private p1: { x: number; y: number } = { x: 0.25, y: 0.5 },
        private p2: { x: number; y: number } = { x: 0.75, y: 0.5 },
        name?: string,
    ) {
        super(id, 'curve', name);
    }

    getInterpolator(): InterpolationFn {
        const sourceNode = this.inputs.get('source');

        if (!sourceNode || !('getRange' in sourceNode)) {
            // Return linear interpolator as fallback
            return (t: number) => t;
        }

        const rangeNode = sourceNode as RangeNode;
        const { start, end, min, max } = rangeNode.getRange();
        const range = max - min;

        if (range === 0) return () => start;

        // Normalize start/end to [0,1] relative to min/max
        const normStart = (start - min) / range;
        const normEnd = (end - min) / range;

        return (t: number) => {
            const normalized = this.cubicBezier(
                t,
                0,
                normStart,
                this.p1.x,
                this.p1.y,
                this.p2.x,
                this.p2.y,
                1,
                normEnd,
            );
            return min + normalized * range;
        };
    }

    private cubicBezier(
        t: number,
        x0: number,
        y0: number,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        x3: number,
        y3: number,
    ): number {
        // Standard cubic bezier formula
        const mt = 1 - t;
        const mt2 = mt * mt;
        const mt3 = mt2 * mt;
        const t2 = t * t;
        const t3 = t2 * t;

        return y0 * mt3 + 3 * y1 * mt2 * t + 3 * y2 * mt * t2 + y3 * t3;
    }

    setControlPoint(index: 1 | 2, point: { x: number; y: number }): void {
        const clamped = {
            x: Math.max(0, Math.min(1, point.x)),
            y: Math.max(0, Math.min(1, point.y)),
        };

        const changed =
            index === 1
                ? clamped.x !== this.p1.x || clamped.y !== this.p1.y
                : clamped.x !== this.p2.x || clamped.y !== this.p2.y;

        if (changed) {
            if (index === 1) this.p1 = clamped;
            else this.p2 = clamped;
            this.notifyChange();
        }
    }

    getControlPoints() {
        return { p1: { ...this.p1 }, p2: { ...this.p2 } };
    }
}

/**
 * Linear interpolator - simpler alternative to CurveNode
 */
export class LinearNode extends BaseNode implements InterpolatorNode {
    constructor(id: string, name?: string) {
        super(id, 'linear', name);
    }

    getInterpolator(): InterpolationFn {
        const sourceNode = this.inputs.get('source');

        if (!sourceNode || !('getRange' in sourceNode)) {
            return (t: number) => t;
        }

        const rangeNode = sourceNode as RangeNode;
        const { start, end } = rangeNode.getRange();

        return (t: number) => start + (end - start) * t;
    }
}

/**
 * Color scale output node - consumes interpolators and produces color array
 */
export class ColorScaleNode extends BaseNode implements ScaleNode {
    private cachedColors: Color[] = [];
    private isDirty = true;

    constructor(id: string, name?: string) {
        super(id, 'scale', name);

        // Override notifyChange to mark cache as dirty
        const originalNotify = this.notifyChange.bind(this);
        this.notifyChange = () => {
            this.isDirty = true;
            originalNotify();
        };
    }

    getColors(): Color[] {
        if (!this.isDirty) {
            return this.cachedColors;
        }

        const stepsNode = this.inputs.get('steps') as ValueNode | undefined;
        const hueInterp = this.inputs.get('hue') as InterpolatorNode | undefined;
        const chromaInterp = this.inputs.get('chroma') as InterpolatorNode | undefined;
        const lumInterp = this.inputs.get('luminance') as InterpolatorNode | undefined;

        const steps = stepsNode?.getValue() ?? 5;

        // Can also accept direct RangeNode connections (automatic linear interpolation)
        const hueSource = hueInterp || (this.inputs.get('hue') as RangeNode | undefined);
        const chromaSource = chromaInterp || (this.inputs.get('chroma') as RangeNode | undefined);
        const lumSource = lumInterp || (this.inputs.get('luminance') as RangeNode | undefined);

        if (!hueSource || !chromaSource || !lumSource) {
            this.cachedColors = [];
            this.isDirty = false;
            return [];
        }

        // Get interpolation functions (or create linear ones for direct RangeNode connections)
        const hueFn = this.getInterpolatorFn(hueSource);
        const chromaFn = this.getInterpolatorFn(chromaSource);
        const lumFn = this.getInterpolatorFn(lumSource);

        const colors: Color[] = [];

        for (let i = 0; i < steps; i++) {
            const t = steps === 1 ? 0 : i / (steps - 1);

            const h = hueFn(t);
            const c = chromaFn(t);
            const l = lumFn(t);

            // Create OKLCH color
            const color = new Color('oklch', [l / 100, c, h]);
            colors.push(color);
        }

        this.cachedColors = colors;
        this.isDirty = false;
        return colors;
    }

    private getInterpolatorFn(node: ColorNode): InterpolationFn {
        if ('getInterpolator' in node) {
            return (node as InterpolatorNode).getInterpolator();
        } else if ('getRange' in node) {
            // Direct RangeNode connection - create linear interpolator
            const { start, end } = (node as RangeNode).getRange();
            return (t: number) => start + (end - start) * t;
        }
        return (t: number) => t;
    }
}

/**
 * Helper function to connect nodes
 */
export function connect(source: ColorNode, target: ColorNode, inputKey: string): void {
    target.inputs.set(inputKey, source);
    source.outputs.add(target);

    // Trigger initial update
    target.notifyChange();
}

/**
 * Helper function to disconnect nodes
 */
export function disconnect(source: ColorNode, target: ColorNode, inputKey: string): void {
    target.inputs.delete(inputKey);
    source.outputs.delete(target);

    // Trigger update
    target.notifyChange();
}
