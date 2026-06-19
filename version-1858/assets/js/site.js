(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var links = document.querySelector('[data-nav-links]');
    if (!toggle || !links) return;
    toggle.addEventListener('click', function () {
      links.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) return;
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function initLocalFilter() {
    var input = document.querySelector('[data-filter-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var empty = document.querySelector('[data-empty-message]');
    if (!input || !cards.length) return;
    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.textContent
        ].join(' ').toLowerCase();
        var ok = !keyword || haystack.indexOf(keyword) !== -1;
        card.style.display = ok ? '' : 'none';
        if (ok) shown += 1;
      });
      if (empty) {
        empty.classList.toggle('is-visible', shown === 0);
      }
    });
  }

  function initGlobalSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-global-search]'));
    if (!forms.length || !window.SEARCH_INDEX) return;
    forms.forEach(function (form) {
      var input = form.querySelector('input');
      var results = form.querySelector('[data-search-results]');
      if (!input || !results) return;
      function render() {
        var keyword = input.value.trim().toLowerCase();
        if (!keyword) {
          results.classList.remove('is-visible');
          results.innerHTML = '';
          return;
        }
        var list = window.SEARCH_INDEX.filter(function (item) {
          return [item.title, item.region, item.genre, item.year, item.type].join(' ').toLowerCase().indexOf(keyword) !== -1;
        }).slice(0, 8);
        results.innerHTML = list.map(function (item) {
          return '<a class="search-result-item" href="' + item.url + '">' +
            '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
            '<span><strong>' + item.title + '</strong><br><small>' + item.year + ' · ' + item.region + ' · ' + item.genre + '</small></span>' +
            '</a>';
        }).join('') || '<div class="search-result-item"><span></span><span>暂无匹配内容</span></div>';
        results.classList.add('is-visible');
      }
      input.addEventListener('input', render);
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        render();
      });
    });
  }

  ready(function () {
    initNav();
    initHero();
    initLocalFilter();
    initGlobalSearch();
  });
})();
