<script lang="ts">
    import { onMount } from 'svelte';
    import { ColorPlayground } from '../utils/ColorPlayground.svelte';
    import type { ColorNode } from '../utils/colorNodes.svelte';
    import NodeCard from './NodeCard.svelte';

    // ===== Reactive State =====
    // These reactive values are directly read by nodes via StateGetter callbacks
    // When these change, Svelte re-renders, and nodes recompute on-demand

    // Integer nodes
    let stepsValue = $state(10);

    // Hue channel
    let hueStart = $state(0);
    let hueEnd = $state(360);

    // Chroma channel
    let chromaStart = $state(0);
    let chromaEnd = $state(0.4);

    // Luminance channel
    let lumStart = $state(100);
    let lumEnd = $state(0);

    // ===== Playground Management =====
    let playground = $state<ColorPlayground | null>(null);
    let nodes = $state<ColorNode[]>([]);
    let nodeCount = $state(0);
    let connectionCount = $state(0);
    let isInitialized = $state(false);

    // ===== Node ID to Reactive State Mapping =====
    // Maps node IDs to state variable names so handleUpdateNode knows what to update
    let nodeStateMap = new Map<string, { type: string; prop: string }>();

    onMount(() => {
        // Create new playground instance
        playground = new ColorPlayground();

        if (!playground) {
            console.error('Failed to create playground');
            return;
        }

        // ===== Create Nodes with Reactive State Getters =====
        // Instead of storing values in nodes, we pass callbacks that read from reactive state
        // This enables proper Svelte reactivity: state → component → node reads → recompute

        const stepsNode = playground.createNode('integer', {
            getValue: () => stepsValue,
            name: 'Steps',
        });
        if (stepsNode) nodeStateMap.set(stepsNode.id, { type: 'steps', prop: 'value' });

        const hueNode = playground.createNode('hue', {
            getStart: () => hueStart,
            getEnd: () => hueEnd,
            name: 'Hue',
        });
        if (hueNode) {
            nodeStateMap.set(hueNode.id, { type: 'hue', prop: 'both' });
        }

        const chromaNode = playground.createNode('chroma', {
            getStart: () => chromaStart,
            getEnd: () => chromaEnd,
            name: 'Chroma',
        });
        if (chromaNode) {
            nodeStateMap.set(chromaNode.id, { type: 'chroma', prop: 'both' });
        }

        const lumNode = playground.createNode('luminance', {
            getStart: () => lumStart,
            getEnd: () => lumEnd,
            name: 'Luminance',
        });
        if (lumNode) {
            nodeStateMap.set(lumNode.id, { type: 'lum', prop: 'both' });
        }

        const hueInterp = playground.createNode('linear', { name: 'Hue Interp' });
        const chromaInterp = playground.createNode('linear', { name: 'Chroma Interp' });
        const lumInterp = playground.createNode('linear', { name: 'Lum Interp' });

        const scaleNode = playground.createNode('scale', { name: 'Output' });

        // ===== Wire Up Connections =====
        // Connect range nodes to interpolators
        if (hueNode && hueInterp) playground.connect(hueNode.id, hueInterp.id, 'source');
        if (chromaNode && chromaInterp) playground.connect(chromaNode.id, chromaInterp.id, 'source');
        if (lumNode && lumInterp) playground.connect(lumNode.id, lumInterp.id, 'source');

        // Connect interpolators and steps to scale
        if (stepsNode && scaleNode) playground.connect(stepsNode.id, scaleNode.id, 'steps');
        if (hueInterp && scaleNode) playground.connect(hueInterp.id, scaleNode.id, 'hue');
        if (chromaInterp && scaleNode) playground.connect(chromaInterp.id, scaleNode.id, 'chroma');
        if (lumInterp && scaleNode) playground.connect(lumInterp.id, scaleNode.id, 'luminance');

        // Update nodes list
        const updateNodes = () => {
            if (playground) {
                nodes = playground.getAllNodes();
                const summary = playground.getSummary();
                nodeCount = summary.nodeCount;
                connectionCount = summary.connectionCount;
            }
        };

        // Subscribe to playground changes
        playground.onChange((event) => {
            if (
                event.type === 'node-added' ||
                event.type === 'node-removed' ||
                event.type === 'connection-added' ||
                event.type === 'connection-removed'
            ) {
                updateNodes();
            }
        });

        // Initial render
        updateNodes();
        isInitialized = true;
    });

    function handleAddNode(type: string) {
        if (playground) {
            const node = playground.createNode(type);
            if (node) {
                nodes = playground.getAllNodes();
            }
        }
    }

    function handleDeleteNode(nodeId: string) {
        if (playground) {
            playground.removeNode(nodeId);
            nodes = playground.getAllNodes();
        }
    }

    function handleUpdateNode(nodeId: string, property: string, value: any) {
        if (playground) {
            // Look up which reactive state variable this node is mapped to
            const mapping = nodeStateMap.get(nodeId);

            if (!mapping) {
                // Node isn't mapped to reactive state (e.g., user-created nodes)
                const node = playground.getNode(nodeId);
                if (node && 'setValue' in node) {
                    (node as any).setValue(value);
                } else if (node && 'setStart' in node && property === 'start') {
                    (node as any).setStart(value);
                } else if (node && 'setEnd' in node && property === 'end') {
                    (node as any).setEnd(value);
                }
                return;
            }

            // Update reactive state variables based on mapping
            // Svelte automatically re-renders when these state values change
            switch (mapping.type) {
                case 'steps':
                    stepsValue = parseInt(value, 10);
                    break;
                case 'hue':
                    if (property === 'start') {
                        hueStart = value;
                    } else if (property === 'end') {
                        hueEnd = value;
                    }
                    break;
                case 'chroma':
                    if (property === 'start') {
                        chromaStart = value;
                    } else if (property === 'end') {
                        chromaEnd = value;
                    }
                    break;
                case 'lum':
                    if (property === 'start') {
                        lumStart = value;
                    } else if (property === 'end') {
                        lumEnd = value;
                    }
                    break;
            }
        }
    }

    function handleConnect(sourceNodeId: string, targetNodeId: string, targetInputKey: string) {
        if (playground) {
            playground.connect(sourceNodeId, targetNodeId, targetInputKey);
        }
    }

    function handleDisconnect(connectionId: string) {
        if (playground) {
            playground.disconnect(connectionId);
        }
    }
</script>

{#if isInitialized && playground}
    <div class="playground-viewer">
        <div class="toolbar">
            <div class="toolbar-section">
                <h3>Add Node</h3>
                <div class="button-group">
                    <button onclick={() => handleAddNode('integer')}>Number</button>
                    <button onclick={() => handleAddNode('hue')}>Hue</button>
                    <button onclick={() => handleAddNode('chroma')}>Chroma</button>
                    <button onclick={() => handleAddNode('luminance')}>Luminance</button>
                </div>
                <div class="button-group">
                    <button onclick={() => handleAddNode('curve')}>Curve</button>
                    <button onclick={() => handleAddNode('linear')}>Linear</button>
                    <button onclick={() => handleAddNode('scale')}>Scale</button>
                </div>
            </div>

            <div class="toolbar-section">
                <h3>Playground Info</h3>
                <div class="info-grid">
                    <div>Nodes: <span class="count">{nodeCount}</span></div>
                    <div>Connections: <span class="count">{connectionCount}</span></div>
                </div>
            </div>
        </div>

        <div class="nodes-grid">
            {#if nodes.length === 0}
                <div class="empty-state">No nodes yet. Add one to get started!</div>
            {:else}
                {#each nodes as node (node.id)}
                    <NodeCard
                        {node}
                        {playground}
                        onDelete={() => handleDeleteNode(node.id)}
                        onUpdate={(property, value) => handleUpdateNode(node.id, property, value)}
                        onConnect={(targetId, inputKey) => handleConnect(node.id, targetId, inputKey)}
                        onDisconnect={(connId) => handleDisconnect(connId)} />
                {/each}
            {/if}
        </div>
    </div>
{/if}

<style>
    .playground-viewer {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        background: var(--bg-color, #ffffff);
        width: 100vw;
        height: 100vh;
        overflow: hidden;
    }

    .toolbar {
        display: flex;
        flex-shrink: 0;
        gap: 2rem;
        border: 1px solid var(--border-color-transparent);
        border-radius: 8px;
        background: var(--card-bg-color);
        padding: 1rem;
    }

    .toolbar-section h3 {
        margin: 0 0 0.75rem;
        font-weight: 600;
        font-size: 0.9rem;
        letter-spacing: 0.05em;
        text-transform: uppercase;
    }

    .button-group {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
    }

    .button-group button {
        transition: background 0.2s;
        cursor: pointer;
        border: none;
        border-radius: 4px;
        background: var(--color-primary, #3b82f6);
        padding: 0.5rem 1rem;
        color: white;
        font-weight: 500;
        font-size: 0.85rem;
    }

    .button-group button:hover {
        background: var(--color-primary-dark, #2563eb);
    }

    .info-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;
        font-size: 0.85rem;
    }

    .count {
        color: var(--color-primary, #3b82f6);
        font-weight: 600;
    }

    .nodes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        flex: 1;
        gap: 1rem;
        padding: 0.5rem;
        overflow-y: auto;
    }

    .empty-state {
        grid-column: 1 / -1;
        padding: 2rem;
        color: var(--color-text-secondary, #666);
        font-style: italic;
        text-align: center;
    }
</style>
