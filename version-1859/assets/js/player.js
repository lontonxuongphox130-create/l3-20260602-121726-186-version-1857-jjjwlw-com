(function () {
    document.querySelectorAll('[data-player]').forEach(function (shell) {
        const video = shell.querySelector('video');
        const button = shell.querySelector('[data-play-button]');
        const state = shell.querySelector('[data-player-state]');
        const stream = shell.getAttribute('data-stream');
        let hls = null;
        let ready = false;

        function setState(text, loading, error) {
            if (state) {
                state.textContent = text || '';
            }
            shell.classList.toggle('is-loading', !!loading);
            shell.classList.toggle('player-error', !!error);
        }

        function playVideo() {
            if (!video || !stream) {
                setState('播放加载失败，请稍后重试', false, true);
                return;
            }

            shell.classList.add('is-playing');
            setState('加载中…', true, false);

            if (ready) {
                video.play().catch(function () {
                    setState('点击视频继续播放', false, false);
                });
                return;
            }

            ready = true;

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {
                        setState('点击视频继续播放', false, false);
                    });
                });
                hls.on(window.Hls.Events.ERROR, function () {
                    setState('播放加载失败，请稍后重试', false, true);
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                video.addEventListener('loadedmetadata', function () {
                    video.play().catch(function () {
                        setState('点击视频继续播放', false, false);
                    });
                }, { once: true });
            } else {
                video.src = stream;
                video.play().catch(function () {
                    setState('点击视频继续播放', false, false);
                });
            }
        }

        if (button) {
            button.addEventListener('click', playVideo);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!ready || video.paused) {
                    playVideo();
                } else {
                    video.pause();
                }
            });
            video.addEventListener('playing', function () {
                setState('', false, false);
                shell.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (ready) {
                    shell.classList.add('is-playing');
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
