<script lang="ts">
    import type { ColorNode } from '../../utils/colorNodes.svelte';
    import type { ChannelNode } from '../../utils/colorNodes.svelte';
    import { getNodeMetadata } from '../../utils/nodeUIMetadata';

    interface Props {
        node: ColorNode;
        onUpdate?: (property: string, value: any) => void;
    }

    let { node, onUpdate }: Props = $props();

    const metadata = getNodeMetadata(node.type);
    const channelNode = node as ChannelNode;
    let range = $state(channelNode.getRange());

    // When node notifies change, re-read range
    $effect(() => {
        const listener = () => {
            range = channelNode.getRange();
        };
        channelNode.onChange(listener);
        return () => {
            channelNode.offChange(listener);
        };
    });

    function handleChange(field: string, value: number) {
        if (onUpdate) {
            onUpdate(field, value);
        }
    }

    function handleStartChange(e: Event) {
        const target = e.target as HTMLInputElement;
        handleChange('start', parseFloat(target.value));
    }

    function handleEndChange(e: Event) {
        const target = e.target as HTMLInputElement;
        handleChange('end', parseFloat(target.value));
    }
</script>

<div class="channel-controls">
    <div class="field">
        <label class="field-label" for="start-slider">
            Start
            {#if metadata?.fields?.[0]?.unit}
                <span class="field-unit">{metadata.fields[0].unit}</span>
            {/if}
        </label>
        <input
            id="start-slider"
            type="range"
            value={range.start}
            min={range.min}
            max={range.max}
            step={0.01}
            onchange={handleStartChange}
            class="field-slider" />
        <span class="field-value">{range.start.toFixed(2)}</span>
    </div>

    <div class="field">
        <label class="field-label" for="end-slider">
            End
            {#if metadata?.fields?.[1]?.unit}
                <span class="field-unit">{metadata.fields[1].unit}</span>
            {/if}
        </label>
        <input
            id="end-slider"
            type="range"
            value={range.end}
            min={range.min}
            max={range.max}
            step={0.01}
            onchange={handleEndChange}
            class="field-slider" />
        <span class="field-value">{range.end.toFixed(2)}</span>
    </div>

    <div class="range-display">
        <div class="range-min">
            <span class="label">Min:</span>
            <span class="value">{range.min.toFixed(2)}</span>
        </div>
        <div class="range-max">
            <span class="label">Max:</span>
            <span class="value">{range.max.toFixed(2)}</span>
        </div>
    </div>
</div>

<style>
    .channel-controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
    }

    .field-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-color);
        font-weight: 600;
        font-size: 0.85rem;
    }

    .field-unit {
        color: var(--color-text-secondary, #666);
        font-weight: 400;
        font-size: 0.75rem;
    }

    .field-slider {
        -webkit-appearance: none;
        appearance: none;
        outline: none;
        border-radius: 3px;
        background: var(--slider-bg, #e5e7eb);
        width: 100%;
        height: 6px;
    }

    .field-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        transition: background 0.2s;
        cursor: pointer;
        border-radius: 50%;
        background: var(--color-primary, #3b82f6);
        width: 16px;
        height: 16px;
    }

    .field-slider::-moz-range-thumb {
        transition: background 0.2s;
        cursor: pointer;
        border: none;
        border-radius: 50%;
        background: var(--color-primary, #3b82f6);
        width: 16px;
        height: 16px;
    }

    .field-slider::-webkit-slider-thumb:hover {
        background: var(--color-primary-dark, #2563eb);
    }

    .field-slider::-moz-range-thumb:hover {
        background: var(--color-primary-dark, #2563eb);
    }

    .field-value {
        color: var(--color-text-secondary, #666);
        font-weight: 500;
        font-size: 0.8rem;
    }

    .range-display {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
        border-radius: 4px;
        background: var(--info-bg, #f0f4f8);
        padding: 0.5rem;
        font-size: 0.8rem;
    }

    .range-min,
    .range-max {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .label {
        color: var(--color-text-secondary, #666);
        font-weight: 600;
    }

    .value {
        color: var(--text-color);
        font-weight: 600;
    }
</style>
