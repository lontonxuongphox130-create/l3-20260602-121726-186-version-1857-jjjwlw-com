const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('is-open');
    });
}

const hero = document.querySelector('[data-hero]');

if (hero) {
    const slides = [...hero.querySelectorAll('[data-hero-slide]')];
    const dots = [...hero.querySelectorAll('[data-hero-dot]')];
    let active = 0;

    const show = (index) => {
        active = (index + slides.length) % slides.length;
        slides.forEach((slide, i) => slide.classList.toggle('is-active', i === active));
        dots.forEach((dot, i) => dot.classList.toggle('is-active', i === active));
    };

    dots.forEach((dot) => {
        dot.addEventListener('click', () => show(Number(dot.dataset.heroDot || 0)));
    });

    window.setInterval(() => show(active + 1), 5200);
}

const filterRoot = document.querySelector('[data-filter-root]');

if (filterRoot) {
    const input = filterRoot.querySelector('[data-filter-input]');
    const region = filterRoot.querySelector('[data-filter-region]');
    const type = filterRoot.querySelector('[data-filter-type]');
    const cards = [...filterRoot.querySelectorAll('.movie-card')];
    const params = new URLSearchParams(window.location.search);

    if (params.get('q') && input) {
        input.value = params.get('q');
    }

    const filter = () => {
        const keyword = (input?.value || '').trim().toLowerCase();
        const regionValue = region?.value || '';
        const typeValue = type?.value || '';

        cards.forEach((card) => {
            const text = [
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.tags
            ].join(' ').toLowerCase();
            const okKeyword = !keyword || text.includes(keyword);
            const okRegion = !regionValue || card.dataset.region === regionValue;
            const okType = !typeValue || card.dataset.type === typeValue;
            card.style.display = okKeyword && okRegion && okType ? '' : 'none';
        });
    };

    [input, region, type].forEach((node) => {
        node?.addEventListener('input', filter);
        node?.addEventListener('change', filter);
    });

    filter();
}

const players = [...document.querySelectorAll('[data-player]')];
let hlsModule;

async function startPlayer(stage) {
    const video = stage.querySelector('video');
    const button = stage.querySelector('.watch-start');
    const stream = video?.dataset.stream;

    if (!video || !stream) {
        return;
    }

    stage.classList.add('is-playing');
    button?.setAttribute('disabled', 'disabled');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
    } else {
        hlsModule = hlsModule || import('./hls.js');
        const { H } = await hlsModule;

        if (H.isSupported()) {
            const hls = new H({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
        } else {
            video.src = stream;
        }
    }

    video.play().catch(() => {
        video.controls = true;
    });
}

players.forEach((stage) => {
    stage.addEventListener('click', (event) => {
        if (event.target.closest('video') && stage.classList.contains('is-playing')) {
            return;
        }

        startPlayer(stage);
    });
});
