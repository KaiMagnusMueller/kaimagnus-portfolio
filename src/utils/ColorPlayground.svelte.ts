/**
 * ColorPlayground - Main container and manager for the node graph
 * Provides high-level API for UI interaction and graph management
 */

import {
    ChromaNode,
    ColorScaleNode,
    CurveNode,
    HueNode,
    IntegerNode,
    LinearNode,
    LuminanceNode,
    connect,
    disconnect,
    type ColorNode,
    type StateGetter,
} from './colorNodes.svelte';

import { getNodeMetadata, type NodeMetadata } from './nodeUIMetadata';
import type Color from 'colorjs.io';

/**
 * Connection between two nodes
 */
export interface Connection {
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    targetInputKey: string;
}

/**
 * Serializable node data for saving/loading
 */
export interface SerializedNode {
    id: string;
    type: string;
    name: string;
    data: Record<string, any>;
}

/**
 * Change event types
 */
export type PlaygroundChangeType =
    | 'node-added'
    | 'node-removed'
    | 'node-updated'
    | 'connection-added'
    | 'connection-removed';

export interface PlaygroundChangeEvent {
    type: PlaygroundChangeType;
    nodeId?: string;
    connectionId?: string;
}

export type PlaygroundChangeListener = (event: PlaygroundChangeEvent) => void;

/**
 * Main playground class that manages the node graph
 */
export class ColorPlayground {
    private nodes = new Map<string, ColorNode>();
    private connections = new Map<string, Connection>();
    private changeListeners = new Set<PlaygroundChangeListener>();
    private nextId = 1;

    constructor() {
        // Initialize with empty graph
    }

    /**
     * Add a change listener to the playground
     */
    onChange(listener: PlaygroundChangeListener): void {
        this.changeListeners.add(listener);
    }

    /**
     * Remove a change listener
     */
    offChange(listener: PlaygroundChangeListener): void {
        this.changeListeners.delete(listener);
    }

    /**
     * Notify all listeners of a change
     */
    private notifyChange(event: PlaygroundChangeEvent): void {
        this.changeListeners.forEach((listener) => listener(event));
    }

    /**
     * Generate a unique ID
     */
    private generateId(): string {
        return `node-${this.nextId++}`;
    }

    /**
     * Create and add a new node to the playground
     *
     * For reactive state, pass StateGetter callbacks:
     * ```ts
     * let stepsValue = $state(10);
     * playground.createNode('integer', {
     *   getValue: () => stepsValue,
     *   name: 'Steps'
     * })
     * ```
     */
    createNode(type: string, params?: Record<string, any>): ColorNode | null {
        const id = this.generateId();
        const name = params?.name;
        let node: ColorNode | null = null;

        switch (type) {
            case 'integer':
                node = new IntegerNode(id, params?.getValue ?? (() => 10), name);
                break;
            case 'hue':
                node = new HueNode(id, params?.getStart ?? (() => 0), params?.getEnd ?? (() => 360), name);
                break;
            case 'chroma':
                node = new ChromaNode(id, params?.getStart ?? (() => 0), params?.getEnd ?? (() => 0.4), name);
                break;
            case 'luminance':
                node = new LuminanceNode(id, params?.getStart ?? (() => 100), params?.getEnd ?? (() => 0), name);
                break;
            case 'curve':
                node = new CurveNode(id, params?.p1 ?? { x: 0.25, y: 0.5 }, params?.p2 ?? { x: 0.75, y: 0.5 }, name);
                break;
            case 'linear':
                node = new LinearNode(id, name);
                break;
            case 'scale':
                node = new ColorScaleNode(id, name);
                break;
            default:
                console.warn(`Unknown node type: ${type}`);
                return null;
        }

        this.nodes.set(id, node);
        this.notifyChange({ type: 'node-added', nodeId: id });
        return node;
    }

    /**
     * Remove a node from the playground
     */
    removeNode(nodeId: string): boolean {
        const node = this.nodes.get(nodeId);
        if (!node) return false;

        // Remove all connections involving this node
        const connectionsToRemove: string[] = [];
        this.connections.forEach((conn, connId) => {
            if (conn.sourceNodeId === nodeId || conn.targetNodeId === nodeId) {
                connectionsToRemove.push(connId);
            }
        });

        connectionsToRemove.forEach((connId) => this.disconnect(connId));

        // Remove the node
        this.nodes.delete(nodeId);
        this.notifyChange({ type: 'node-removed', nodeId });
        return true;
    }

    /**
     * Get a node by ID
     */
    getNode(nodeId: string): ColorNode | undefined {
        return this.nodes.get(nodeId);
    }

    /**
     * Get all nodes
     */
    getAllNodes(): ColorNode[] {
        return Array.from(this.nodes.values());
    }

    /**
     * Get all nodes of a specific type
     */
    getNodesByType(type: string): ColorNode[] {
        return this.getAllNodes().filter((node) => node.type === type);
    }

    /**
     * Connect two nodes
     */
    connect(sourceNodeId: string, targetNodeId: string, targetInputKey: string): string | null {
        const sourceNode = this.nodes.get(sourceNodeId);
        const targetNode = this.nodes.get(targetNodeId);

        if (!sourceNode || !targetNode) {
            console.warn('Cannot connect: node not found');
            return null;
        }

        // Check if connection is valid based on metadata
        const targetMetadata = getNodeMetadata(targetNode.type);
        if (targetMetadata) {
            const inputMeta = targetMetadata.inputs.find((i) => i.key === targetInputKey);
            if (inputMeta && !inputMeta.accepts.includes(sourceNode.type)) {
                console.warn(`Cannot connect ${sourceNode.type} to ${targetNode.type}.${targetInputKey}`);
                return null;
            }
        }

        // Check if this input is already connected
        const existingConn = Array.from(this.connections.values()).find(
            (c) => c.targetNodeId === targetNodeId && c.targetInputKey === targetInputKey,
        );

        if (existingConn) {
            // Replace existing connection
            this.disconnect(existingConn.id);
        }

        // Create connection
        const connId = `conn-${sourceNodeId}-${targetNodeId}-${targetInputKey}`;
        const connection: Connection = {
            id: connId,
            sourceNodeId,
            targetNodeId,
            targetInputKey,
        };

        this.connections.set(connId, connection);
        connect(sourceNode, targetNode, targetInputKey);

        this.notifyChange({ type: 'connection-added', connectionId: connId });
        return connId;
    }

    /**
     * Disconnect a connection by ID
     */
    disconnect(connectionId: string): boolean {
        const connection = this.connections.get(connectionId);
        if (!connection) return false;

        const sourceNode = this.nodes.get(connection.sourceNodeId);
        const targetNode = this.nodes.get(connection.targetNodeId);

        if (sourceNode && targetNode) {
            disconnect(sourceNode, targetNode, connection.targetInputKey);
        }

        this.connections.delete(connectionId);
        this.notifyChange({ type: 'connection-removed', connectionId });
        return true;
    }

    /**
     * Get all connections
     */
    getAllConnections(): Connection[] {
        return Array.from(this.connections.values());
    }

    /**
     * Get connections for a specific node
     */
    getNodeConnections(nodeId: string): { inputs: Connection[]; outputs: Connection[] } {
        const inputs: Connection[] = [];
        const outputs: Connection[] = [];

        this.connections.forEach((conn) => {
            if (conn.targetNodeId === nodeId) {
                inputs.push(conn);
            }
            if (conn.sourceNodeId === nodeId) {
                outputs.push(conn);
            }
        });

        return { inputs, outputs };
    }

    /**
     * Get connection info with node names for UI display
     */
    getConnectionInfo(connectionId: string): {
        source: { id: string; name: string; type: string };
        target: { id: string; name: string; type: string; inputKey: string };
    } | null {
        const conn = this.connections.get(connectionId);
        if (!conn) return null;

        const sourceNode = this.nodes.get(conn.sourceNodeId);
        const targetNode = this.nodes.get(conn.targetNodeId);

        if (!sourceNode || !targetNode) return null;

        return {
            source: {
                id: sourceNode.id,
                name: sourceNode.name,
                type: sourceNode.type,
            },
            target: {
                id: targetNode.id,
                name: targetNode.name,
                type: targetNode.type,
                inputKey: conn.targetInputKey,
            },
        };
    }

    /**
     * Update a node's value/property
     */
    updateNode(nodeId: string, property: string, value: any): boolean {
        const node = this.nodes.get(nodeId) as any;
        if (!node) return false;

        try {
            // Map common property names to setter methods
            const setterMap: Record<string, string> = {
                value: 'setValue',
                start: 'setStart',
                end: 'setEnd',
                name: 'setName',
            };

            const setter = setterMap[property];
            if (setter && typeof node[setter] === 'function') {
                node[setter](value);
                this.notifyChange({ type: 'node-updated', nodeId });
                return true;
            }

            // Handle special cases
            if (property === 'controlPoints' && node.type === 'curve') {
                if (value.p1) node.setControlPoint(1, value.p1);
                if (value.p2) node.setControlPoint(2, value.p2);
                this.notifyChange({ type: 'node-updated', nodeId });
                return true;
            }

            console.warn(`Unknown property: ${property} for node type: ${node.type}`);
            return false;
        } catch (error) {
            console.error('Error updating node:', error);
            return false;
        }
    }

    /**
     * Serialize the entire playground to JSON
     */
    serialize(): string {
        const data = {
            nodes: Array.from(this.nodes.values()).map((node) => this.serializeNode(node)),
            connections: Array.from(this.connections.values()),
        };
        return JSON.stringify(data, null, 2);
    }

    /**
     * Serialize a single node
     */
    private serializeNode(node: ColorNode): SerializedNode {
        const nodeAny = node as any;
        const data: Record<string, any> = {};

        switch (node.type) {
            case 'integer':
                data.value = nodeAny.getValue();
                break;
            case 'hue':
            case 'chroma':
            case 'luminance':
                const range = nodeAny.getRange();
                data.start = range.start;
                data.end = range.end;
                break;
            case 'curve':
                data.controlPoints = nodeAny.getControlPoints();
                break;
            // linear and scale don't have serializable data
        }

        return {
            id: node.id,
            type: node.type,
            name: node.name,
            data,
        };
    }

    /**
     * Load playground from serialized JSON
     */
    load(json: string): boolean {
        try {
            const data = JSON.parse(json);

            // Clear existing
            this.clear();

            // Recreate nodes
            const nodeIdMap = new Map<string, string>(); // old ID -> new ID

            for (const serialized of data.nodes) {
                const node = this.createNode(serialized.type, {
                    ...serialized.data,
                    name: serialized.name,
                });
                if (node) {
                    nodeIdMap.set(serialized.id, node.id);
                }
            }

            // Recreate connections
            for (const conn of data.connections) {
                const newSourceId = nodeIdMap.get(conn.sourceNodeId);
                const newTargetId = nodeIdMap.get(conn.targetNodeId);
                if (newSourceId && newTargetId) {
                    this.connect(newSourceId, newTargetId, conn.targetInputKey);
                }
            }

            return true;
        } catch (error) {
            console.error('Error loading playground:', error);
            return false;
        }
    }

    /**
     * Clear the entire playground
     */
    clear(): void {
        const nodeIds = Array.from(this.nodes.keys());
        nodeIds.forEach((id) => this.removeNode(id));
    }

    /**
     * Get a summary of the playground state for debugging
     */
    getSummary(): {
        nodeCount: number;
        connectionCount: number;
        nodesByType: Record<string, number>;
        scaleOutputs: Array<{ nodeId: string; name: string; colorCount: number }>;
    } {
        const nodesByType: Record<string, number> = {};
        this.nodes.forEach((node) => {
            nodesByType[node.type] = (nodesByType[node.type] || 0) + 1;
        });

        const scaleOutputs = this.getNodesByType('scale').map((node) => {
            const colors = (node as ColorScaleNode).getColors();
            return {
                nodeId: node.id,
                name: node.name,
                colorCount: colors.length,
            };
        });

        return {
            nodeCount: this.nodes.size,
            connectionCount: this.connections.size,
            nodesByType,
            scaleOutputs,
        };
    }
}

/**
 * Helper to create a playground with a basic setup
 */
export function createBasicPlayground(): ColorPlayground {
    const playground = new ColorPlayground();

    const steps = playground.createNode('integer', { value: 10, name: 'Steps' });
    const hue = playground.createNode('hue', { start: 200, end: 280, name: 'Hue' });
    const chroma = playground.createNode('chroma', { start: 0.02, end: 0.25, name: 'Chroma' });
    const luminance = playground.createNode('luminance', { start: 95, end: 15, name: 'Luminance' });
    const scale = playground.createNode('scale', { name: 'Output' });

    if (steps && hue && chroma && luminance && scale) {
        playground.connect(steps.id, scale.id, 'steps');
        playground.connect(hue.id, scale.id, 'hue');
        playground.connect(chroma.id, scale.id, 'chroma');
        playground.connect(luminance.id, scale.id, 'luminance');
    }

    return playground;
}

/**
 * Helper to create a playground with curves
 */
export function createCurvedPlayground(): ColorPlayground {
    const playground = new ColorPlayground();

    const steps = playground.createNode('integer', { value: 11, name: 'Steps' });

    const hue = playground.createNode('hue', { start: 240, end: 280, name: 'Hue' });
    const hueCurve = playground.createNode('curve', { name: 'Hue Curve' });

    const chroma = playground.createNode('chroma', { start: 0.02, end: 0.25, name: 'Chroma' });
    const chromaCurve = playground.createNode('curve', { name: 'Chroma Curve' });

    const luminance = playground.createNode('luminance', { start: 98, end: 10, name: 'Luminance' });
    const lumCurve = playground.createNode('curve', { name: 'Luminance Curve' });

    const scale = playground.createNode('scale', { name: 'Output' });

    if (steps && hue && hueCurve && chroma && chromaCurve && luminance && lumCurve && scale) {
        playground.connect(hue.id, hueCurve.id, 'source');
        playground.connect(chroma.id, chromaCurve.id, 'source');
        playground.connect(luminance.id, lumCurve.id, 'source');

        playground.connect(steps.id, scale.id, 'steps');
        playground.connect(hueCurve.id, scale.id, 'hue');
        playground.connect(chromaCurve.id, scale.id, 'chroma');
        playground.connect(lumCurve.id, scale.id, 'luminance');
    }

    return playground;
}
