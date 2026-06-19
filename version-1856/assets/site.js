(function () {
    var toggle = document.querySelector('.mobile-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            var isOpen = mobileNav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        var prev = slider.querySelector('.hero-prev');
        var next = slider.querySelector('.hero-next');
        var active = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === active);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === active);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(active - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(active + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var filterInput = document.querySelector('.card-filter');
    var yearFilter = document.querySelector('.year-filter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var countNode = document.querySelector('[data-result-count]');

    function fillYears() {
        if (!yearFilter || yearFilter.options.length > 1 || !cards.length) {
            return;
        }

        var years = cards
            .map(function (card) {
                return card.getAttribute('data-year');
            })
            .filter(Boolean)
            .filter(function (year, index, array) {
                return array.indexOf(year) === index;
            })
            .sort(function (a, b) {
                return Number(b) - Number(a);
            });

        years.forEach(function (year) {
            var option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });
    }

    function applyInitialQuery() {
        if (!filterInput) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query) {
            filterInput.value = query;
        }
    }

    function filterCards() {
        if (!cards.length) {
            return;
        }

        var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
        var year = yearFilter ? yearFilter.value : '';
        var visible = 0;

        cards.forEach(function (card) {
            var text = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-tags') || '',
                card.getAttribute('data-year') || '',
                card.textContent || ''
            ].join(' ').toLowerCase();
            var cardYear = card.getAttribute('data-year') || '';
            var matchText = !query || text.indexOf(query) !== -1;
            var matchYear = !year || cardYear === year;
            var shouldShow = matchText && matchYear;

            card.style.display = shouldShow ? '' : 'none';

            if (shouldShow) {
                visible += 1;
            }
        });

        if (countNode) {
            countNode.textContent = String(visible);
        }
    }

    fillYears();
    applyInitialQuery();

    if (filterInput) {
        filterInput.addEventListener('input', filterCards);
    }

    if (yearFilter) {
        yearFilter.addEventListener('change', filterCards);
    }

    filterCards();
})();
