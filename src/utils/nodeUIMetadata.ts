/**
 * UI Metadata and component mapping for color nodes
 * Defines how each node type should be rendered and interacted with
 */

/**
 * Field input types for UI rendering
 */
export type FieldInputType =
    | 'number' // Standard number input
    | 'slider' // Range slider
    | 'text' // Text input
    | 'bezier' // Bezier curve editor (string representation for now)
    | 'readonly' // Display only
    | 'color-preview'; // Color swatch array

/**
 * Metadata for a single field/property
 */
export interface FieldMetadata {
    key: string; // Property name in the class
    label: string; // Display label
    inputType: FieldInputType;
    min?: number; // For number/slider inputs
    max?: number;
    step?: number;
    unit?: string; // Display unit (e.g., "°", "%")
    readonly?: boolean;
    getter: string; // Method name to get value (e.g., "getValue", "getStart")
    setter?: string; // Method name to set value (e.g., "setValue", "setStart")
}

/**
 * Connection point metadata
 */
export interface ConnectionMetadata {
    key: string; // Connection key used in inputs Map
    label: string; // Display label
    accepts: string[]; // Node types that can connect here
    required: boolean; // Is this connection required for the node to function?
}

/**
 * Complete node type metadata for UI generation
 */
export interface NodeMetadata {
    type: string;
    displayName: string;
    description: string;
    category: 'source' | 'transform' | 'output';
    color: string; // Visual color for node UI
    fields: FieldMetadata[];
    inputs: ConnectionMetadata[];
    outputs: ConnectionMetadata[];
}

/**
 * Registry of all node types and their UI metadata
 */
export const NODE_METADATA: Record<string, NodeMetadata> = {
    integer: {
        type: 'integer',
        displayName: 'Number',
        description: 'Provides a single integer value',
        category: 'source',
        color: '#64748b',
        fields: [
            {
                key: 'value',
                label: 'Value',
                inputType: 'number',
                min: 2,
                max: 50,
                step: 1,
                getter: 'getValue',
                setter: 'setValue',
            },
        ],
        inputs: [],
        outputs: [
            {
                key: 'value',
                label: 'Value',
                accepts: ['scale'],
                required: false,
            },
        ],
    },

    hue: {
        type: 'hue',
        displayName: 'Hue Range',
        description: 'Defines hue start and end values (0-360°)',
        category: 'source',
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
                setter: 'setStart',
            },
            {
                key: 'end',
                label: 'End',
                inputType: 'slider',
                min: 0,
                max: 360,
                step: 1,
                unit: '°',
                getter: 'getRange',
                setter: 'setEnd',
            },
        ],
        inputs: [],
        outputs: [
            {
                key: 'range',
                label: 'Range',
                accepts: ['curve', 'linear', 'scale'],
                required: false,
            },
        ],
    },

    chroma: {
        type: 'chroma',
        displayName: 'Chroma Range',
        description: 'Defines chroma start and end values (0-0.4)',
        category: 'source',
        color: '#8b5cf6',
        fields: [
            {
                key: 'start',
                label: 'Start',
                inputType: 'slider',
                min: 0,
                max: 0.4,
                step: 0.01,
                getter: 'getRange',
                setter: 'setStart',
            },
            {
                key: 'end',
                label: 'End',
                inputType: 'slider',
                min: 0,
                max: 0.4,
                step: 0.01,
                getter: 'getRange',
                setter: 'setEnd',
            },
        ],
        inputs: [],
        outputs: [
            {
                key: 'range',
                label: 'Range',
                accepts: ['curve', 'linear', 'scale'],
                required: false,
            },
        ],
    },

    luminance: {
        type: 'luminance',
        displayName: 'Luminance Range',
        description: 'Defines luminance start and end values (0-100%)',
        category: 'source',
        color: '#eab308',
        fields: [
            {
                key: 'start',
                label: 'Start',
                inputType: 'slider',
                min: 0,
                max: 100,
                step: 1,
                unit: '%',
                getter: 'getRange',
                setter: 'setStart',
            },
            {
                key: 'end',
                label: 'End',
                inputType: 'slider',
                min: 0,
                max: 100,
                step: 1,
                unit: '%',
                getter: 'getRange',
                setter: 'setEnd',
            },
        ],
        inputs: [],
        outputs: [
            {
                key: 'range',
                label: 'Range',
                accepts: ['curve', 'linear', 'scale'],
                required: false,
            },
        ],
    },

    curve: {
        type: 'curve',
        displayName: 'Curve',
        description: 'Applies cubic bezier interpolation',
        category: 'transform',
        color: '#06b6d4',
        fields: [
            {
                key: 'controlPoints',
                label: 'Curve',
                inputType: 'bezier',
                getter: 'getControlPoints',
                setter: 'setControlPoint',
            },
        ],
        inputs: [
            {
                key: 'source',
                label: 'Source',
                accepts: ['hue', 'chroma', 'luminance'],
                required: true,
            },
        ],
        outputs: [
            {
                key: 'interpolated',
                label: 'Output',
                accepts: ['scale'],
                required: false,
            },
        ],
    },

    linear: {
        type: 'linear',
        displayName: 'Linear',
        description: 'Applies linear interpolation',
        category: 'transform',
        color: '#10b981',
        fields: [],
        inputs: [
            {
                key: 'source',
                label: 'Source',
                accepts: ['hue', 'chroma', 'luminance'],
                required: true,
            },
        ],
        outputs: [
            {
                key: 'interpolated',
                label: 'Output',
                accepts: ['scale'],
                required: false,
            },
        ],
    },

    scale: {
        type: 'scale',
        displayName: 'Color Scale',
        description: 'Generates color scale output',
        category: 'output',
        color: '#f97316',
        fields: [
            {
                key: 'colors',
                label: 'Colors',
                inputType: 'color-preview',
                readonly: true,
                getter: 'getColors',
            },
        ],
        inputs: [
            {
                key: 'steps',
                label: 'Steps',
                accepts: ['integer'],
                required: true,
            },
            {
                key: 'hue',
                label: 'Hue',
                accepts: ['curve', 'linear', 'hue'],
                required: true,
            },
            {
                key: 'chroma',
                label: 'Chroma',
                accepts: ['curve', 'linear', 'chroma'],
                required: true,
            },
            {
                key: 'luminance',
                label: 'Luminance',
                accepts: ['curve', 'linear', 'luminance'],
                required: true,
            },
        ],
        outputs: [],
    },
};

/**
 * Helper to get metadata for a node instance
 */
export function getNodeMetadata(nodeType: string): NodeMetadata | undefined {
    return NODE_METADATA[nodeType];
}

/**
 * Get value from node using metadata getter
 */
export function getFieldValue(node: any, field: FieldMetadata): any {
    if (field.getter.includes('Range')) {
        const range = node[field.getter]();
        return range[field.key];
    } else if (field.getter === 'getControlPoints') {
        return node[field.getter]();
    } else {
        return node[field.getter]();
    }
}

/**
 * Set value on node using metadata setter
 */
export function setFieldValue(node: any, field: FieldMetadata, value: any): void {
    if (!field.setter) return;

    if (field.setter === 'setControlPoint') {
        // Special handling for bezier curves
        // Value format: "p1.x,p1.y;p2.x,p2.y"
        const points = parseBezierString(value);
        if (points) {
            node.setControlPoint(1, points.p1);
            node.setControlPoint(2, points.p2);
        }
    } else {
        node[field.setter](value);
    }
}

/**
 * Parse bezier string format: "0.25,0.5;0.75,0.5"
 */
export function parseBezierString(str: string): { p1: { x: number; y: number }; p2: { x: number; y: number } } | null {
    try {
        const [p1Str, p2Str] = str.split(';');
        const [p1x, p1y] = p1Str.split(',').map(Number);
        const [p2x, p2y] = p2Str.split(',').map(Number);
        return {
            p1: { x: p1x, y: p1y },
            p2: { x: p2x, y: p2y },
        };
    } catch {
        return null;
    }
}

/**
 * Format bezier points to string: "0.25,0.5;0.75,0.5"
 */
export function formatBezierString(points: { p1: { x: number; y: number }; p2: { x: number; y: number } }): string {
    return `${points.p1.x},${points.p1.y};${points.p2.x},${points.p2.y}`;
}
