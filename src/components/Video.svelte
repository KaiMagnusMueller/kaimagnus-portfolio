<script>
    export let src = '';

    src = import.meta.env.PUBLIC_APACHE_URL + src;
</script>

<figure>
    <div class="video--container">
        <video width="100%" height="100%" {src} muted controls />
    </div>
    <figcaption>asdf</figcaption>
</figure>

<style lang="scss">
    @use '../styles/vars.scss';

    figure {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 20px;
        margin: 0;
    }

    .video--container {
        position: relative;
        grid-column: 1 / span 9;
    }

    figcaption {
        grid-column: span 3;
        font-style: italic;
    }

    @media (max-width: vars.$screen-md) {
        figure {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin: 3em 0;
        }

        .media--container {
            position: relative;
        }

        figcaption {
            grid-column: span 3;
        }
    }
</style>
