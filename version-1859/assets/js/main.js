(function () {
    const header = document.querySelector('[data-header]');
    const menuButton = document.querySelector('[data-menu-button]');
    const mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
            header.classList.toggle('menu-open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const next = hero.querySelector('[data-hero-next]');
        const prev = hero.querySelector('[data-hero-prev]');
        let current = 0;
        let timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                const index = Number(dot.getAttribute('data-hero-dot')) || 0;
                show(index);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        const section = panel.closest('section') || document;
        const input = panel.querySelector('[data-search-input]');
        const year = panel.querySelector('[data-filter-year]');
        const type = panel.querySelector('[data-filter-type]');
        const reset = panel.querySelector('[data-filter-reset]');
        const cards = Array.from(section.querySelectorAll('[data-card]'));

        function filterCards() {
            const keyword = input ? input.value.trim().toLowerCase() : '';
            const yearValue = year ? year.value : '';
            const typeValue = type ? type.value : '';

            cards.forEach(function (card) {
                const text = (card.getAttribute('data-search-text') || '').toLowerCase();
                const cardYear = card.getAttribute('data-year') || '';
                const cardType = card.getAttribute('data-type') || '';
                const matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                const matchYear = !yearValue || cardYear === yearValue;
                const matchType = !typeValue || cardType === typeValue;
                card.classList.toggle('is-hidden', !(matchKeyword && matchYear && matchType));
            });
        }

        [input, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', filterCards);
                control.addEventListener('change', filterCards);
            }
        });

        if (reset) {
            reset.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }
                if (year) {
                    year.value = '';
                }
                if (type) {
                    type.value = '';
                }
                filterCards();
            });
        }

        const params = new URLSearchParams(window.location.search);
        const query = params.get('q');
        if (query && input) {
            input.value = query;
            filterCards();
        }
    });

    document.querySelectorAll('[data-nav-search]').forEach(function (form) {
        const input = form.querySelector('input[name="q"]');
        form.addEventListener('submit', function (event) {
            if (!input || !input.value.trim()) {
                event.preventDefault();
                input && input.focus();
            }
        });
    });
})();
