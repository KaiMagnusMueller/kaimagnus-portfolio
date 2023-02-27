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
		callback: (entries: IntersectionObserverEntry[]) => void
	) {
		let options = {
			rootMargin: '0px',
			threshold: 0.5,
		};
		let observer = new IntersectionObserver(callback, options);
		elems.forEach((elem) => observer.observe(elem));
	}

	// SET FIGCAPTION HEIGHT
	let captionText: HTMLDivElement;
	let figCaptionElem: HTMLElement;

	$: {
		if (captionText && figCaptionElem) {
			figCaptionElem.style.height = captionText.clientHeight + 'px';
		}
	}
</script>

<div class="useCase--container">
	<div class="useCase--navigation">
		{#each _srcSet as item, i}
			<button class="useCase--navItem" class:active={item.active} on:click={() => handleClick(i)}
				><h2>{item.title}</h2></button>
		{/each}
	</div>

	<div class="useCase-media--container" data-index={activeIndex}>
		{#if _srcSet.length > 0}
			<figure class="grid--container">
				{#key activeIndex}
					<div class="media--container" transition:fade|local={{ duration: 500 }}>
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
					</div>
				{/key}
				<div class="height-helper" style="aspect-ratio: {aspectRatio};" />

				<figcaption bind:this={figCaptionElem}>
					{#key activeIndex}
						<div
							class="caption-helper"
							in:fly|local={{ duration: 1000, x: 25, delay: 200 }}
							out:fly={{ duration: 1000, x: -25, delay: 100 }}
							bind:this={captionText}>
							{_srcSet[activeIndex].alt}
						</div>
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

	figure {
		margin: 0;
		position: relative;
	}

	.grid--container {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		gap: 20px;
	}

	.media--container {
		grid-column: 1 / span 9;
		position: absolute;
		top: 0;
	}

	figcaption {
		grid-column: span 3;
		// font-style: italic;
		margin-bottom: -4px;
	}

	:global(.media--container *) {
		display: block;
	}

	:global(.media--container img) {
		width: 100%;
		height: auto;
	}

	.useCase--navigation {
		grid-column: 1 / -1;
	}

	.height-helper {
		grid-column: 1 / span 9;
	}

	.caption-helper {
		position: absolute;
		bottom: 0;
	}

	// USE CASE

	.useCase--navigation {
		display: flex;
		flex-direction: row;
		gap: 20px;
		padding-bottom: 0.5rem;
		overflow-x: scroll;
		margin-left: -0.5rem;
	}

	button {
		// border: 2px solid transparent;
		border: none;
		// border-radius: 4px;
		background-color: unset;
		padding: 0.25rem 0.5rem;
		flex-shrink: 0;
	}

	button h2 {
		margin: 0;
		width: unset;
		color: var(--color-text-low-contrast);
	}

	button.active h2,
	button:hover h2 {
		color: var(--color-text);
	}

	// button:hover {
	// 	border-color: gainsboro;
	// }

	@media (max-width: $screen-lg) {
		.grid--container {
			display: flex;
			flex-direction: column;
			gap: 8px;
			margin: 0;
		}

		figcaption {
			position: relative;
		}

		.caption-helper {
			position: absolute;
			top: 0;
			bottom: unset;
		}
	}

	@media (max-width: $screen-md) {
		figcaption {
			width: 100%;
		}
	}
</style>