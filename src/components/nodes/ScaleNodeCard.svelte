<script lang="ts">
    import type { ColorNode } from '../../utils/colorNodes.svelte';
    import { ColorScaleNode } from '../../utils/colorNodes.svelte';

    interface Props {
        node: ColorNode;
    }

    let { node }: Props = $props();

    const scaleNode = node as ColorScaleNode;
    let colors = $state(scaleNode.getColors?.() ?? []);

    $effect(() => {
        colors = scaleNode.getColors?.() ?? [];
    });

    function copyColorToClipboard(color: any) {
        const colorString = color.toString();
        navigator.clipboard.writeText(colorString).then(() => {
            // Optionally show a toast notification
            console.log(`Copied ${colorString} to clipboard`);
        });
    }
</script>

<div class="scale-info">
    {#if colors.length === 0}
        <div class="empty-message">No colors generated. Connect inputs to create a scale.</div>
    {:else}
        <div class="colors-list">
            <div class="colors-header">
                <span class="label">Colors ({colors.length})</span>
            </div>
            {#each colors as color, index (index)}
                <div class="color-item">
                    <button
                        class="color-swatch"
                        style="background-color: {color.toString()}"
                        title={color.toString()}
                        onclick={() => copyColorToClipboard(color)}
                        aria-label="Copy color {color.toString()} to clipboard"></button>
                    <span class="color-value">{color.toString()}</span>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .scale-info {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .empty-message {
        border-radius: 4px;
        background: var(--info-bg, #f0f4f8);
        padding: 1rem;
        color: var(--color-text-secondary, #999);
        font-style: italic;
        font-size: 0.85rem;
        text-align: center;
    }

    .colors-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .colors-header {
        border-bottom: 1px solid var(--border-color-transparent);
        padding-bottom: 0.5rem;
        color: var(--color-text-secondary, #666);
        font-weight: 600;
        font-size: 0.8rem;
        letter-spacing: 0.05em;
        text-transform: uppercase;
    }

    .label {
        font-weight: 600;
    }

    .color-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        transition: background 0.2s;
        border-radius: 4px;
        background: var(--info-bg, #f0f4f8);
        padding: 0.5rem;
    }

    .color-item:hover {
        background: var(--info-bg-hover, #e0e7f0);
    }

    .color-swatch {
        flex-shrink: 0;
        transition: transform 0.2s;
        cursor: pointer;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        background: none;
        padding: 0;
        width: 32px;
        height: 32px;
    }

    .color-swatch:hover {
        transform: scale(1.1);
    }

    .color-value {
        flex: 1;
        cursor: pointer;
        color: var(--text-color);
        font-weight: 500;
        font-size: 0.8rem;
        font-family: monospace;
        word-break: break-all;
    }

    .color-value:hover {
        text-decoration: underline;
    }
</style>
