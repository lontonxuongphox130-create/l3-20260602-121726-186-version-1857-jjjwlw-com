(function() {
  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('[data-menu-toggle]');

  function updateHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuToggle && header) {
    menuToggle.addEventListener('click', function() {
      header.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function(hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

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

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        show(Number(dot.dataset.heroDot || 0));
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('.filter-scope').forEach(function(scope) {
    const input = scope.querySelector('.js-filter-input');
    const buttons = Array.from(scope.querySelectorAll('[data-filter-value]'));
    const items = Array.from(scope.querySelectorAll('.filter-item'));
    let activeValue = 'all';

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function filterItems() {
      const term = normalize(input ? input.value : '');
      const filter = normalize(activeValue);
      items.forEach(function(item) {
        const text = normalize([
          item.dataset.title,
          item.dataset.year,
          item.dataset.type,
          item.dataset.region,
          item.dataset.tags
        ].join(' '));
        const matchesTerm = !term || text.indexOf(term) !== -1;
        const matchesFilter = filter === 'all' || text.indexOf(filter) !== -1;
        item.classList.toggle('is-hidden', !(matchesTerm && matchesFilter));
      });
    }

    if (input) {
      input.addEventListener('input', filterItems);
    }

    buttons.forEach(function(button) {
      button.addEventListener('click', function() {
        activeValue = button.dataset.filterValue || 'all';
        buttons.forEach(function(other) {
          other.classList.toggle('active', other === button);
        });
        filterItems();
      });
    });
  });
})();
