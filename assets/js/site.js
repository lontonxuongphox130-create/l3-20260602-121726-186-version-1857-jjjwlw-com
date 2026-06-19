(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var active = 0;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });
    window.setInterval(function () {
      show(active + 1);
    }, 5200);
  }

  function cardMatchesFilter(card, filter) {
    if (!filter || filter === 'all') {
      return true;
    }
    var parts = filter.split(':');
    if (parts.length !== 2) {
      return true;
    }
    var field = parts[0];
    var value = parts[1];
    return (card.dataset[field] || '').indexOf(value) !== -1;
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var input = scope.querySelector('[data-search-input]');
      var buttons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-value]'));
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
      var empty = scope.querySelector('[data-empty-state]');
      var currentFilter = 'all';

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags
          ].join(' ').toLowerCase();
          var matched = (!query || haystack.indexOf(query) !== -1) && cardMatchesFilter(card, currentFilter);
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      buttons.forEach(function (button, index) {
        if (index === 0) {
          button.classList.add('is-active');
        }
        button.addEventListener('click', function () {
          currentFilter = button.getAttribute('data-filter-value') || 'all';
          buttons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          apply();
        });
      });

      if (input) {
        input.addEventListener('input', apply);
        try {
          var params = new URLSearchParams(window.location.search);
          var query = params.get('q');
          if (query) {
            input.value = query;
          }
        } catch (error) {}
      }
      apply();
    });
  }

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
  });
})();
