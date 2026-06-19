(function () {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const base = document.body.dataset.base || '.';

  function pathJoin(root, path) {
    return `${root.replace(/\/$/, '')}/${String(path).replace(/^\//, '')}`;
  }

  function setupMenu() {
    const button = $('[data-menu-toggle]');
    const menu = $('[data-nav-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function setupHero() {
    const hero = $('[data-hero]');

    if (!hero) {
      return;
    }

    const slides = $$('[data-hero-slide]', hero);
    const dots = $$('[data-hero-dot]', hero);
    const thumbs = $$('[data-hero-thumb]', hero);
    const prev = $('[data-hero-prev]', hero);
    const next = $('[data-hero-next]', hero);
    let active = 0;
    let timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === active));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === active));
      thumbs.forEach((thumb, i) => thumb.classList.toggle('active', i === active));
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.dataset.heroDot || 0));
        restart();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('mouseenter', function () {
        show(Number(thumb.dataset.heroThumb || 0));
        restart();
      });
    });

    show(0);
    restart();
  }

  function setupCardFilter() {
    const wrapper = $('[data-card-filter]');

    if (!wrapper) {
      return;
    }

    const keyword = $('[data-filter-keyword]', wrapper);
    const year = $('[data-filter-year]', wrapper);
    const genre = $('[data-filter-genre]', wrapper);
    const reset = $('[data-filter-reset]', wrapper);
    const cards = $$('.movie-card');

    function apply() {
      const q = (keyword.value || '').trim().toLowerCase();
      const selectedYear = year.value;
      const selectedGenre = genre.value;

      cards.forEach(function (card) {
        const haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.year
        ].join(' ').toLowerCase();
        const yearOk = !selectedYear || card.dataset.year === selectedYear;
        const genreOk = !selectedGenre || (card.dataset.genre || '').includes(selectedGenre);
        const keywordOk = !q || haystack.includes(q);
        card.style.display = yearOk && genreOk && keywordOk ? '' : 'none';
      });
    }

    [keyword, year, genre].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        keyword.value = '';
        year.value = '';
        genre.value = '';
        apply();
      });
    }
  }

  function setupGlobalSearch() {
    const panel = $('[data-search-panel]');
    const input = $('[data-global-search-input]');
    const results = $('[data-global-search-results]');
    const openButtons = $$('[data-open-search]');
    const closeButton = $('[data-close-search]');
    let indexData = null;

    if (!panel || !input || !results) {
      return;
    }

    function openPanel() {
      panel.classList.add('open');
      panel.setAttribute('aria-hidden', 'false');
      window.setTimeout(() => input.focus(), 30);
      loadIndex();
    }

    function closePanel() {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
    }

    function loadIndex() {
      if (indexData) {
        return Promise.resolve(indexData);
      }

      return fetch(pathJoin(base, 'assets/movies-search.json'))
        .then(response => response.json())
        .then(data => {
          indexData = data;
          return indexData;
        })
        .catch(() => {
          results.innerHTML = '<p class="rank-meta">搜索索引暂时无法读取。</p>';
          return [];
        });
    }

    function render() {
      const q = input.value.trim().toLowerCase();

      if (!q) {
        results.innerHTML = '<p class="rank-meta">请输入关键词开始搜索。</p>';
        return;
      }

      loadIndex().then(function (data) {
        const matched = data.filter(function (item) {
          return [item.title, item.region, item.type, item.genre, item.year, item.tags]
            .join(' ')
            .toLowerCase()
            .includes(q);
        }).slice(0, 24);

        if (!matched.length) {
          results.innerHTML = '<p class="rank-meta">没有找到匹配影片。</p>';
          return;
        }

        results.innerHTML = matched.map(function (item) {
          return `
            <a class="search-result-item" href="${pathJoin(base, item.url)}">
              <img src="${pathJoin(base, item.cover)}" alt="${escapeHtml(item.title)}" loading="lazy">
              <span>
                <strong>${escapeHtml(item.title)}</strong>
                <span>${escapeHtml(item.region)} · ${escapeHtml(String(item.year || '年份未知'))} · ${escapeHtml(item.type)}</span>
              </span>
            </a>
          `;
        }).join('');
      });
    }

    function escapeHtml(text) {
      return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    openButtons.forEach(button => button.addEventListener('click', openPanel));

    if (closeButton) {
      closeButton.addEventListener('click', closePanel);
    }

    panel.addEventListener('click', function (event) {
      if (event.target === panel) {
        closePanel();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closePanel();
      }
    });

    input.addEventListener('input', render);
  }

  function setupPlayers() {
    $$('.video-player').forEach(function (player) {
      const video = $('video', player);
      const playButton = $('[data-play]', player);
      const status = $('[data-player-status]', player);
      const source = player.dataset.source;
      let initialized = false;

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function initPlayer() {
        if (!video || !source || initialized) {
          return;
        }

        initialized = true;
        setStatus('正在初始化播放源...');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {
              setStatus('播放器已就绪，请再次点击播放。');
            });
          }, { once: true });
        } else if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {
              setStatus('播放器已就绪，请再次点击播放。');
            });
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('播放源加载失败，请刷新页面后重试。');
            }
          });
        } else {
          video.src = source;
          setStatus('当前浏览器可能不支持 HLS 播放。');
        }

        player.classList.add('is-playing');
      }

      if (playButton) {
        playButton.addEventListener('click', initPlayer);
      }

      player.addEventListener('click', function (event) {
        if (event.target === player) {
          initPlayer();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupCardFilter();
    setupGlobalSearch();
    setupPlayers();
  });
})();
