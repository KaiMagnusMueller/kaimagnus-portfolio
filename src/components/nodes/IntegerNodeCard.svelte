<script lang="ts">
    import type { ColorNode } from '../../utils/colorNodes.svelte';
    import type { IntegerNode } from '../../utils/colorNodes.svelte';
    import { getNodeMetadata } from '../../utils/nodeUIMetadata';

    interface Props {
        node: ColorNode;
        onUpdate?: (property: string, value: any) => void;
    }

    let { node, onUpdate }: Props = $props();

    const metadata = getNodeMetadata(node.type);
    let value = $state((node as IntegerNode).getValue?.() ?? 0);

    // When node notifies change, re-read value
    $effect(() => {
        const listener = () => {
            value = (node as IntegerNode).getValue?.() ?? 0;
        };
        (node as IntegerNode).onChange(listener);
        return () => {
            (node as IntegerNode).offChange(listener);
        };
    });

    function handleFieldChange(e: Event, fieldKey: string) {
        const target = e.target as HTMLInputElement;
        let value: any = target.value;

        if (target.type === 'number') {
            value = parseInt(value, 10);
        }

        if (onUpdate) {
            onUpdate(fieldKey, value);
        }
    }
</script>

{#if metadata?.fields && metadata.fields.length > 0}
    {#each metadata.fields as field (field.key)}
        <div class="field">
            <label class="field-label" for="field-{field.key}">
                {field.label}
                {#if field.unit}
                    <span class="field-unit">{field.unit}</span>
                {/if}
            </label>
            {#if field.inputType === 'number'}
                <input
                    id="field-{field.key}"
                    type="number"
                    {value}
                    min={field.min}
                    max={field.max}
                    step={field.step || 1}
                    onchange={(e) => handleFieldChange(e, field.key)}
                    disabled={field.readonly}
                    class="field-input" />
            {/if}
        </div>
    {/each}
{/if}

<style>
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

    .field-input {
        transition: border-color 0.2s;
        border: 1px solid var(--border-color-transparent);
        border-radius: 4px;
        background: var(--input-bg-color);
        padding: 0.4rem;
        color: var(--text-color);
        font-size: 0.85rem;
    }

    .field-input:focus {
        outline: none;
        border-color: var(--color-primary, #3b82f6);
    }

    .field-input:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
</style>
