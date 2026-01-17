<script lang="ts">
    import type { ColorNode } from '../../utils/colorNodes.svelte';
    import { CurveNode } from '../../utils/colorNodes.svelte';
    import { getNodeMetadata } from '../../utils/nodeUIMetadata';

    interface Props {
        node: ColorNode;
        onUpdate?: (property: string, value: any) => void;
    }

    let { node, onUpdate }: Props = $props();

    const metadata = getNodeMetadata(node.type);
    const isCurve = node.type === 'curve';
    let controlPoints = $state<any>(null);

    if (isCurve) {
        const curveNode = node as CurveNode;
        controlPoints = curveNode.getControlPoints?.();
    }

    function handleControlPointChange(pointIndex: 1 | 2, axis: 'x' | 'y', value: number) {
        if (isCurve && onUpdate) {
            const curveNode = node as CurveNode;
            const points = curveNode.getControlPoints?.();
            if (points) {
                const point = pointIndex === 1 ? { ...points.p1 } : { ...points.p2 };
                point[axis] = Math.max(0, Math.min(1, value));
                onUpdate(`controlPoints.p${pointIndex}`, point);
            }
        }
    }
</script>

<div class="interpolator-controls">
    {#if isCurve && controlPoints}
        <div class="bezier-editor">
            <h4>Control Points</h4>

            <div class="control-point">
                <span class="point-label">P1</span>
                <div class="point-controls">
                    <div class="point-axis">
                        <label class="axis-label" for="p1-x">X:</label>
                        <input
                            id="p1-x"
                            type="range"
                            value={controlPoints.p1.x}
                            min="0"
                            max="1"
                            step="0.01"
                            onchange={(e) =>
                                handleControlPointChange(1, 'x', parseFloat((e.target as HTMLInputElement).value))}
                            class="axis-slider" />
                        <span class="axis-value">{controlPoints.p1.x.toFixed(2)}</span>
                    </div>

                    <div class="point-axis">
                        <label class="axis-label" for="p1-y">Y:</label>
                        <input
                            id="p1-y"
                            type="range"
                            value={controlPoints.p1.y}
                            min="0"
                            max="1"
                            step="0.01"
                            onchange={(e) =>
                                handleControlPointChange(1, 'y', parseFloat((e.target as HTMLInputElement).value))}
                            class="axis-slider" />
                        <span class="axis-value">{controlPoints.p1.y.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div class="control-point">
                <span class="point-label">P2</span>
                <div class="point-controls">
                    <div class="point-axis">
                        <label class="axis-label" for="p2-x">X:</label>
                        <input
                            id="p2-x"
                            type="range"
                            value={controlPoints.p2.x}
                            min="0"
                            max="1"
                            step="0.01"
                            onchange={(e) =>
                                handleControlPointChange(2, 'x', parseFloat((e.target as HTMLInputElement).value))}
                            class="axis-slider" />
                        <span class="axis-value">{controlPoints.p2.x.toFixed(2)}</span>
                    </div>

                    <div class="point-axis">
                        <label class="axis-label" for="p2-y">Y:</label>
                        <input
                            id="p2-y"
                            type="range"
                            value={controlPoints.p2.y}
                            min="0"
                            max="1"
                            step="0.01"
                            onchange={(e) =>
                                handleControlPointChange(2, 'y', parseFloat((e.target as HTMLInputElement).value))}
                            class="axis-slider" />
                        <span class="axis-value">{controlPoints.p2.y.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    {:else if node.type === 'linear'}
        <div class="linear-info">
            <p>Linear interpolation - connects source range directly to output.</p>
        </div>
    {/if}
</div>

<style>
    .interpolator-controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .bezier-editor h4 {
        margin: 0;
        color: var(--text-color);
        font-weight: 600;
        font-size: 0.9rem;
    }

    .control-point {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        border-radius: 4px;
        background: var(--info-bg, #f0f4f8);
        padding: 0.75rem;
    }

    .control-point > .point-label {
        color: var(--color-text-secondary, #666);
        font-weight: 600;
        font-size: 0.8rem;
    }

    .point-controls {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .point-axis {
        display: grid;
        grid-template-columns: 30px 1fr 50px;
        align-items: center;
        gap: 0.5rem;
    }

    .axis-label {
        font-weight: 600;
        font-size: 0.8rem;
        text-align: right;
    }

    .axis-slider {
        -webkit-appearance: none;
        appearance: none;
        outline: none;
        border-radius: 3px;
        background: var(--slider-bg, #e5e7eb);
        width: 100%;
        height: 5px;
    }

    .axis-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        cursor: pointer;
        border-radius: 50%;
        background: var(--color-primary, #3b82f6);
        width: 12px;
        height: 12px;
    }

    .axis-slider::-moz-range-thumb {
        cursor: pointer;
        border: none;
        border-radius: 50%;
        background: var(--color-primary, #3b82f6);
        width: 12px;
        height: 12px;
    }

    .axis-value {
        color: var(--text-color);
        font-weight: 600;
        font-size: 0.75rem;
        text-align: right;
    }

    .linear-info {
        border-radius: 4px;
        background: var(--info-bg, #f0f4f8);
        padding: 0.75rem;
        color: var(--color-text-secondary, #666);
        font-style: italic;
        font-size: 0.85rem;
    }

    .linear-info p {
        margin: 0;
    }
</style>
