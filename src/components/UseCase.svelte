<script lang="ts">
    import { onMount } from 'svelte';
    import { fly, fade } from 'svelte/transition';

    let apacheUrl = import.meta.env.PUBLIC_APACHE_URL;

    interface UseCase {
        title: string;
        src: string;
        alt: string;
        active: boolean;
    }

    export let aspectRatio: `${number}/${number}` = '16/9';
    export let srcSet: UseCase[] = [];

    let _srcSet: UseCase[] = [];

    function handleClick(index: number) {
        const currentIndex = _srcSet.findIndex((elem) => elem.active === true);
        updateActiveVideo(currentIndex, index);
    }

    function handleChangeVideo(index: number) {
        const targetIndex = (index + 1) % _srcSet.length;
        updateActiveVideo(index, targetIndex);
    }

    function updateActiveVideo(currentIndex: number, targetIndex: number) {
        // console.table(_srcSet, ['title', 'active', 'alt']);
        _srcSet[currentIndex].active = false;
        _srcSet[targetIndex].active = true;

        activeIndex = targetIndex;
    }

    let activeIndex = 0;

    onMount(() => {
        srcSet.forEach((element, i) => {
            _srcSet.push(element);
            const src = apacheUrl + element.src;
            _srcSet[i].src = src;
            _srcSet[i].active = false;
        });

        _srcSet[0].active = true;
    });

    // ADD INTERSECTION OBSERVERS
    let videoElem: HTMLVideoElement;

    $: {
        if (videoElem) {
            createIntersectionObservers([videoElem], callback);
        }
    }

    let callback = (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting && entry.target instanceof HTMLVideoElement) {
                entry.target.pause();
            } else if (entry.isIntersecting && entry.target instanceof HTMLVideoElement) {
                entry.target.play();
            }
        });
    };

    function createIntersectionObservers(
        elems: Array<Element>,
        callback: (entries: IntersectionObserverEntry[]) => void,
    ) {
        let options = {
            rootMargin: '0px',
            threshold: 0.5,
        };
        let observer = new IntersectionObserver(callback, options);
        elems.forEach((elem) => observer.observe(elem));
    }

    // SET FIGCAPTION HEIGHT
    let captionText: HTMLElement;
    let figCaptionElem: HTMLElement;

    $: {
        if (captionText && figCaptionElem) {
            figCaptionElem.style.height = captionText.clientHeight + 'px';
        }
    }

    function splitJSONStringIntoArray(string: string) {
        return string.split('\n');
    }
</script>

<div class="useCase--container">
    <div class="useCase--navigation">
        {#each _srcSet as item, i}
            <button class="useCase--navItem" class:active={item.active} on:click={() => handleClick(i)}>
                <h2>{item.title}</h2>
            </button>
        {/each}
    </div>

    <div class="useCase-media--container" data-index={activeIndex}>
        {#if _srcSet.length > 0}
            <figure class="media--grid-container">
                {#key activeIndex}
                    <span class="media--pos-absolute main-content" transition:fade|local={{ duration: 500 }}>
                        <video
                            bind:this={videoElem}
                            on:ended={() => handleChangeVideo(activeIndex)}
                            class="useCase--media"
                            width="100%"
                            height="100%"
                            src={_srcSet[activeIndex].src}
                            muted
                            autoplay
                            controls />
                    </span>
                {/key}
                <div class="media--1-9col" style="aspect-ratio: {aspectRatio};" />

                <figcaption bind:this={figCaptionElem}>
                    {#key activeIndex}
                        <span
                            class="caption-helper figcaption--style"
                            in:fly|local={{ duration: 1000, x: 25, delay: 200 }}
                            out:fly={{ duration: 1000, x: -25, delay: 100 }}
                            bind:this={captionText}>
                            {#each splitJSONStringIntoArray(_srcSet[activeIndex].alt) as paragraph}
                                <p>{paragraph}</p>
                            {/each}
                        </span>
                    {/key}
                </figcaption>
            </figure>
        {/if}
    </div>
</div>

<style lang="scss">
    @import '../styles/_vars.scss';

    .useCase--container {
        margin: 3em 0;
    }

    .useCase--navigation {
        grid-column: 1 / -1;
    }

    .media--pos-absolute {
        position: absolute;
        top: 0;
        grid-column: 1 / span 9;
    }

    figure {
        position: relative;
    }

    .caption-helper {
        position: absolute;
        bottom: -4px;
    }

    p:first-child {
        margin-top: 0;
    }

    p:last-child {
        margin-bottom: 0;
    }

    // USE CASE

    .useCase--navigation {
        display: flex;
        flex-direction: row;
        gap: 20px;
        margin-left: -0.5rem;
        padding-bottom: 0.5rem;
        overflow-x: scroll;
    }

    button {
        flex-shrink: 0;
        appearance: none;
        // border: 2px solid transparent;
        border: none;
        // border-radius: 4px;
        background-color: unset;
        padding: 0.25rem 0.5rem;
        font-family: inherit;
    }

    button h2 {
        margin: 0;
        width: unset;
        color: var(--text-color-low-contrast);
    }

    button.active h2,
    button:hover h2 {
        color: var(--text-color);
    }

    @media (max-width: $screen-lg) {
        .caption-helper {
            position: absolute;
            top: 0;
            bottom: unset;
        }
    }
</style>
