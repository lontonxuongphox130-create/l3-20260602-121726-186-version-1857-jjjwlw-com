(function() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav-menu]');
  if (toggle && nav) {
    toggle.addEventListener('click', function() {
      nav.classList.toggle('is-open');
    });
  }

  const carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    const prev = carousel.querySelector('[data-hero-prev]');
    const next = carousel.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function() {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        show(index + 1);
        start();
      });
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    start();
  }

  const input = document.querySelector('[data-filter-input]');
  const sort = document.querySelector('[data-sort-select]');
  const list = document.querySelector('[data-card-list]');
  const empty = document.querySelector('[data-empty-state]');

  if (input && list) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    if (query) {
      input.value = query;
    }

    const cards = Array.from(list.querySelectorAll('.movie-card'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function content(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-type'),
        card.getAttribute('data-category'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' '));
    }

    function applyFilter() {
      const value = normalize(input.value);
      let visible = 0;
      cards.forEach(function(card) {
        const matched = !value || content(card).indexOf(value) !== -1;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    function applySort() {
      if (!sort) {
        return;
      }
      const mode = sort.value;
      const sorted = cards.slice().sort(function(a, b) {
        const yearA = Number(a.getAttribute('data-year')) || 0;
        const yearB = Number(b.getAttribute('data-year')) || 0;
        const titleA = a.getAttribute('data-title') || '';
        const titleB = b.getAttribute('data-title') || '';
        if (mode === 'year-asc') {
          return yearA - yearB || titleA.localeCompare(titleB, 'zh-CN');
        }
        if (mode === 'title-asc') {
          return titleA.localeCompare(titleB, 'zh-CN') || yearB - yearA;
        }
        return yearB - yearA || titleA.localeCompare(titleB, 'zh-CN');
      });
      sorted.forEach(function(card) {
        list.appendChild(card);
      });
      applyFilter();
    }

    input.addEventListener('input', applyFilter);
    if (sort) {
      sort.addEventListener('change', applySort);
      applySort();
    } else {
      applyFilter();
    }
  }
}());
