(() => {
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    const menuButton = $('.menu-toggle');
    const mobilePanel = $('.mobile-panel');
    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', () => {
            mobilePanel.classList.toggle('open');
        });
    }

    const slides = $$('[data-hero-slide]');
    const dots = $$('[data-hero-dot]');
    let heroIndex = 0;
    const showHero = (next) => {
        if (!slides.length) return;
        heroIndex = (next + slides.length) % slides.length;
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === heroIndex);
        });
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === heroIndex);
        });
    };
    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            showHero(Number(dot.dataset.heroDot || 0));
        });
    });
    if (slides.length > 1) {
        setInterval(() => showHero(heroIndex + 1), 5200);
    }

    const filterBar = $('[data-filter-bar]');
    if (filterBar) {
        const input = $('[data-filter-input]', filterBar);
        const typeSelect = $('[data-filter-type]', filterBar);
        const sortSelect = $('[data-sort-select]', filterBar);
        const grid = $('[data-card-grid]');
        const initialItems = grid ? $$('.movie-card, .rank-row', grid) : [];

        const applyFilters = () => {
            if (!grid) return;
            const query = (input && input.value ? input.value : '').trim().toLowerCase();
            const type = typeSelect ? typeSelect.value : '';
            const mode = sortSelect ? sortSelect.value : '';
            const items = initialItems.slice();

            if (mode === 'year-desc') {
                items.sort((a, b) => Number(b.dataset.year || 0) - Number(a.dataset.year || 0));
            }
            if (mode === 'year-asc') {
                items.sort((a, b) => Number(a.dataset.year || 0) - Number(b.dataset.year || 0));
            }
            if (mode === 'title-asc') {
                items.sort((a, b) => String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN'));
            }
            items.forEach((item) => grid.appendChild(item));

            items.forEach((item) => {
                const haystack = String(item.dataset.keywords || item.textContent || '').toLowerCase();
                const matchesQuery = !query || haystack.includes(query);
                const matchesType = !type || item.dataset.type === type;
                item.classList.toggle('hidden-card', !(matchesQuery && matchesType));
            });
        };

        [input, typeSelect, sortSelect].filter(Boolean).forEach((control) => {
            control.addEventListener('input', applyFilters);
            control.addEventListener('change', applyFilters);
        });

        const params = new URLSearchParams(location.search);
        const q = params.get('q');
        if (q && input) {
            input.value = q;
            applyFilters();
        }
    }

    const players = $$('[data-player]');
    players.forEach((box) => {
        const video = $('.video-node', box);
        const button = $('.play-overlay', box);
        let ready = false;

        const start = async () => {
            if (!video) return;
            const streamUrl = video.dataset.stream || '';
            if (!ready && streamUrl) {
                if (window.Hls && window.Hls.isSupported()) {
                    const hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                } else {
                    video.src = streamUrl;
                }
                ready = true;
            }
            box.classList.add('is-playing');
            try {
                await video.play();
            } catch (error) {
                box.classList.remove('is-playing');
            }
        };

        if (button) {
            button.addEventListener('click', start);
        }
        if (video) {
            video.addEventListener('click', () => {
                if (video.paused) start();
            });
            video.addEventListener('play', () => box.classList.add('is-playing'));
            video.addEventListener('pause', () => box.classList.remove('is-playing'));
        }
    });
})();
