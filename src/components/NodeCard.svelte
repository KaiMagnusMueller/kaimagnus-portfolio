<script lang="ts">
    import type { ColorNode } from '../utils/colorNodes.svelte';
    import type { ColorPlayground } from '../utils/ColorPlayground.svelte';
    import { getNodeMetadata } from '../utils/nodeUIMetadata';
    import IntegerNodeCard from './nodes/IntegerNodeCard.svelte';
    import ChannelNodeCard from './nodes/ChannelNodeCard.svelte';
    import InterpolatorNodeCard from './nodes/InterpolatorNodeCard.svelte';
    import ScaleNodeCard from './nodes/ScaleNodeCard.svelte';

    interface Props {
        node: ColorNode;
        playground: ColorPlayground;
        onDelete?: () => void;
        onUpdate?: (property: string, value: any) => void;
        onConnect?: (targetId: string, inputKey: string) => void;
        onDisconnect?: (connId: string) => void;
    }

    let { node, playground, onDelete, onUpdate, onConnect, onDisconnect }: Props = $props();

    let nodeName = $state(node.name);
    let showInputs = $derived(!['integer', 'hue', 'chroma', 'luminance'].includes(node.type));
    let showOutputs = $derived(node.type !== 'scale');
    let showColorPreview = $derived(node.type === 'scale');

    const metadata = getNodeMetadata(node.type);
    const nodeColor = metadata?.color || '#666';

    let connections = $state<any>({ inputs: [], outputs: [] });

    function updateConnections() {
        connections = playground.getNodeConnections(node.id);
    }

    function handleNameChange(e: Event) {
        const target = e.target as HTMLInputElement;
        nodeName = target.value;
        if (onUpdate) {
            onUpdate('name', target.value);
        }
    }

    function handleDelete() {
        if (onDelete) {
            onDelete();
        }
    }

    function handleDisconnect(connId: string) {
        if (onDisconnect) {
            onDisconnect(connId);
            updateConnections();
        }
    }

    // Update connections when playground changes
    $effect(() => {
        playground.onChange((event) => {
            if (event.type === 'connection-added' || event.type === 'connection-removed') {
                updateConnections();
            }
        });

        // Initial update
        updateConnections();
    });
</script>

<div class="node-card base-node" style="--node-color: {nodeColor}" data-node-id={node.id}>
    <div class="node-header">
        <div class="node-type">{metadata?.displayName || node.type}</div>
        <button class="delete-btn" onclick={handleDelete} title="Delete Node">×</button>
    </div>

    <div class="node-name-container">
        <input
            class="node-name-input"
            type="text"
            value={nodeName}
            onchange={handleNameChange}
            placeholder="Node name" />
    </div>

    {#if metadata?.description}
        <div class="node-description">{metadata.description}</div>
    {/if}

    {#if showInputs}
        <div class="connections-section inputs" data-section="inputs">
            <div class="section-label">Inputs</div>
            <div class="connections-list" data-connections-type="inputs">
                {#if connections.inputs.length === 0}
                    <div class="no-connections">No inputs</div>
                {:else}
                    {#each connections.inputs as conn (conn.id)}
                        {@const sourceNode = playground.getNode(conn.sourceNodeId)}
                        <div class="connection-item">
                            <div class="connection-info">
                                <span class="connection-label">← {sourceNode?.name}</span>
                                <span class="connection-field">{conn.targetInputKey}</span>
                            </div>
                            <button class="disconnect-btn" onclick={() => handleDisconnect(conn.id)} title="Disconnect">
                                ×
                            </button>
                        </div>
                    {/each}
                {/if}
            </div>
        </div>
    {/if}

    <div class="fields-section" data-section="fields">
        {#if node.type === 'integer'}
            <IntegerNodeCard {node} onUpdate={(property, value) => onUpdate?.(property, value)} />
        {:else if ['hue', 'chroma', 'luminance'].includes(node.type)}
            <ChannelNodeCard {node} onUpdate={(property, value) => onUpdate?.(property, value)} />
        {:else if ['curve', 'linear'].includes(node.type)}
            <InterpolatorNodeCard {node} onUpdate={(property, value) => onUpdate?.(property, value)} />
        {:else if node.type === 'scale'}
            <ScaleNodeCard {node} />
        {/if}
    </div>

    {#if showColorPreview}
        <div class="color-preview-section" data-section="color-preview">
            <div class="section-label">Colors</div>
            <div class="color-preview">
                {#if 'getColors' in node}
                    {@const scaleNode = node}
                    {@const colors = scaleNode.getColors()}
                    {#if colors.length === 0}
                        <div class="no-colors">Configure inputs to generate colors</div>
                    {:else}
                        <div class="color-swatches">
                            {#each colors as color (color.toString())}
                                <div
                                    class="color-swatch"
                                    style="background-color: {color.toString()}"
                                    title={color.toString()}></div>
                            {/each}
                        </div>
                    {/if}
                {/if}
            </div>
        </div>
    {/if}

    {#if showOutputs}
        <div class="connections-section outputs" data-section="outputs">
            <div class="section-label">Outputs</div>
            <div class="connections-list" data-connections-type="outputs">
                {#if connections.outputs.length === 0}
                    <div class="no-connections">No outputs</div>
                {:else}
                    {#each connections.outputs as conn (conn.id)}
                        {@const targetNode = playground.getNode(conn.targetNodeId)}
                        <div class="connection-item">
                            <div class="connection-info">
                                <span class="connection-label">→ {targetNode?.name}</span>
                                <span class="connection-field">{conn.targetInputKey}</span>
                            </div>
                            <button class="disconnect-btn" onclick={() => handleDisconnect(conn.id)} title="Disconnect">
                                ×
                            </button>
                        </div>
                    {/each}
                {/if}
            </div>
        </div>
    {/if}
</div>

<style>
    .node-card {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        border: 2px solid var(--node-color);
        border-radius: 8px;
        background: var(--card-bg-color);
        padding: 1rem;
        height: fit-content;
    }

    .node-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .node-type {
        color: var(--node-color);
        font-weight: 700;
        font-size: 1rem;
    }

    .delete-btn {
        display: flex;
        justify-content: center;
        align-items: center;
        transition: background 0.2s;
        cursor: pointer;
        border: none;
        border-radius: 4px;
        background: none;
        padding: 0;
        width: 24px;
        height: 24px;
        color: #999;
        font-size: 1.5rem;
    }

    .delete-btn:hover {
        background: var(--danger-color, #ef4444);
        color: white;
    }

    .node-name-container {
        display: flex;
        flex-direction: column;
    }

    .node-name-input {
        border: 1px solid var(--border-color-transparent);
        border-radius: 4px;
        background: var(--input-bg-color);
        padding: 0.5rem;
        color: var(--text-color);
        font-weight: 600;
        font-size: 0.9rem;
    }

    .node-name-input:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        border-color: var(--node-color);
    }

    .node-description {
        color: var(--color-text-secondary, #666);
        font-style: italic;
        font-size: 0.85rem;
    }

    .connections-section {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .section-label {
        color: var(--color-text-secondary, #666);
        font-weight: 600;
        font-size: 0.85rem;
        letter-spacing: 0.05em;
        text-transform: uppercase;
    }

    .connections-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .no-connections {
        padding: 0.5rem 0;
        color: var(--color-text-secondary, #999);
        font-style: italic;
        font-size: 0.85rem;
    }

    .connection-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-radius: 4px;
        background: var(--connection-bg, #f5f5f5);
        padding: 0.5rem;
        font-size: 0.85rem;
    }

    .connection-info {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: 0.25rem;
    }

    .connection-label {
        color: var(--text-color);
        font-weight: 500;
    }

    .connection-field {
        color: var(--color-text-secondary, #666);
        font-size: 0.75rem;
    }

    .disconnect-btn {
        transition: color 0.2s;
        cursor: pointer;
        border: none;
        background: none;
        padding: 0 0.5rem;
        color: #999;
        font-size: 1rem;
    }

    .disconnect-btn:hover {
        color: var(--danger-color, #ef4444);
    }

    .fields-section {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .color-preview-section {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .color-preview {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .no-colors {
        padding: 1rem;
        color: var(--color-text-secondary, #999);
        font-style: italic;
        font-size: 0.85rem;
        text-align: center;
    }

    .color-swatches {
        display: flex;
        gap: 0.25rem;
        border-radius: 4px;
        height: 40px;
        overflow: hidden;
    }

    .color-swatch {
        flex: 1;
        transition: transform 0.2s;
        cursor: pointer;
        border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .color-swatch:hover {
        transform: scaleY(1.2);
    }
</style>
