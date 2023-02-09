<script>
	export let src = '';

	src = import.meta.env.PUBLIC_APACHE_URL + src;

	function handleClick(event) {
		if (event.code !== 'Space' && event.type == 'keydown') {
			return;
		}

		// console.log(event);
		// console.log(videoElem);

		if (videoElem.paused == true) {
			videoElem.play();
			play_state = PLAYING;
		} else {
			videoElem.pause();
			play_state = PAUSED;
		}

		progressLoop();
	}

	let videoElem;

	let intervall;

	// States
	const HIDDEN = 'hidden';
	const VISIBLE = 'visible';
	const HIDE_DELAY = 800;

	let control_state = HIDDEN;

	function pointerEnter(event) {
		if (HIDDEN) {
			containerElem.classList.add('controls-visible');
			control_state = VISIBLE;
		}

		clearTimeout(intervall);

		intervall = setTimeout(() => {
			containerElem.classList.remove('controls-visible');
			control_state = HIDDEN;
			// console.log('timer');
		}, HIDE_DELAY);
	}

	// States
	const PAUSED = 'paused';
	const PLAYING = 'playing';

	// Initial state
	let play_state = PAUSED;

	// Animation loop
	function progressLoop() {
		if (play_state === PLAYING && control_state === VISIBLE) {
			progressElem.value = Math.round((videoElem.currentTime / videoElem.duration) * 100);
			// timer.innerHTML = Math.round(video.currentTime) + ' seconds';
			requestAnimationFrame(progressLoop);
		}
	}

	let containerElem;
	let progressElem;
</script>

<div
	bind:this={containerElem}
	class="video--container"
	on:click|preventDefault={handleClick}
	on:keydown|preventDefault={handleClick}
	on:pointermove={pointerEnter}>
	<div class="ctrl-container justify-between">
		<div class="ctrl-section top"><div /></div>
		<div class="ctrl-section middle justify-center">
			<input type="button" value="back" />
			<input type="button" value="Play/Pause" />
			<input type="button" value="forward" />
		</div>
		<div class="ctrl-section bottom">
			<progress bind:this={progressElem} class="progress-bar" value="0" max="100" />
		</div>
	</div>
	<video bind:this={videoElem} width="100%" height="100%" {src} muted />
</div>

<style>
	.video--container {
		position: relative;
	}

	.ctrl-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		visibility: hidden;
		opacity: 0;
		transition: all 0.5s ease-in-out;
	}

	:global(.controls-visible > .ctrl-container) {
		visibility: visible;
		opacity: 1;
	}

	.ctrl-section {
		padding: 24px;
		display: flex;
		gap: 24px;
	}

	.progress-bar {
		width: 100%;
	}
	video {
		pointer-events: none;
	}

	.justify-center {
		justify-content: center;
	}

	.justify-between {
		justify-content: space-between;
	}
</style>
