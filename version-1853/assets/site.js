(function () {
    'use strict';

    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupMobileMenu() {
        var toggle = $('[data-menu-toggle]');
        var nav = $('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function setupHero() {
        var hero = $('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = $all('[data-hero-slide]', hero);
        var dots = $all('[data-hero-dot]', hero);
        var prev = $('[data-hero-prev]', hero);
        var next = $('[data-hero-next]', hero);
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupGlobalSearch() {
        var input = $('#global-search-input');
        var results = $('#global-search-results');
        if (!input || !results || !window.MOVIE_SEARCH_DATA) {
            return;
        }

        function render(items) {
            if (!items.length) {
                results.innerHTML = '<div class="empty-search">没有找到匹配影片</div>';
                results.classList.add('open');
                return;
            }
            results.innerHTML = items.slice(0, 12).map(function (item) {
                return [
                    '<a class="search-result-item" href="' + item.url + '">',
                    '    <img src="' + item.image + '" alt="' + escapeHtml(item.title) + '">',
                    '    <span>',
                    '        <strong>' + escapeHtml(item.title) + '</strong>',
                    '        <span>' + escapeHtml(item.region) + ' · ' + item.year + ' · ' + escapeHtml(item.type) + '</span>',
                    '    </span>',
                    '</a>'
                ].join('');
            }).join('');
            results.classList.add('open');
        }

        input.addEventListener('input', function () {
            var query = normalize(input.value);
            if (!query) {
                results.classList.remove('open');
                results.innerHTML = '';
                return;
            }
            var terms = query.split(/\s+/).filter(Boolean);
            var matched = window.MOVIE_SEARCH_DATA.filter(function (item) {
                var haystack = normalize([
                    item.title,
                    item.region,
                    item.type,
                    item.year,
                    item.genre,
                    (item.tags || []).join(','),
                    item.oneLine
                ].join(' '));
                return terms.every(function (term) {
                    return haystack.indexOf(term) !== -1;
                });
            });
            render(matched);
        });

        document.addEventListener('click', function (event) {
            if (!results.contains(event.target) && event.target !== input) {
                results.classList.remove('open');
            }
        });
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function setupCardFilters() {
        var panel = $('[data-filter-panel]');
        var grid = $('[data-card-grid]');
        if (!panel || !grid) {
            return;
        }
        var cards = $all('[data-movie-card]', grid);
        var search = $('[data-card-search]', panel);
        var region = $('[data-card-region]', panel);
        var year = $('[data-card-year]', panel);
        var type = $('[data-card-type]', panel);
        var reset = $('[data-card-reset]', panel);
        var count = $('[data-filter-count]', panel);

        function apply() {
            var q = normalize(search && search.value);
            var regionValue = region ? region.value : '';
            var yearValue = year ? year.value : '';
            var typeValue = type ? type.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var matched = true;
                if (q && haystack.indexOf(q) === -1) {
                    matched = false;
                }
                if (regionValue && card.getAttribute('data-region') !== regionValue) {
                    matched = false;
                }
                if (yearValue && card.getAttribute('data-year') !== yearValue) {
                    matched = false;
                }
                if (typeValue && card.getAttribute('data-type') !== typeValue) {
                    matched = false;
                }
                card.classList.toggle('hidden', !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 部影片';
            }
        }

        [search, region, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        if (reset) {
            reset.addEventListener('click', function () {
                if (search) search.value = '';
                if (region) region.value = '';
                if (year) year.value = '';
                if (type) type.value = '';
                apply();
            });
        }
        apply();
    }

    function setupPlayers() {
        $all('[data-player]').forEach(function (player) {
            var video = $('video', player);
            var button = $('.player-start', player);
            var status = $('[data-player-status]', player);
            var source = player.getAttribute('data-source');
            var hlsInstance = null;

            function setStatus(message) {
                if (status) {
                    status.textContent = message;
                }
            }

            function markPlaying() {
                player.classList.add('playing');
            }

            function playVideo() {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.then === 'function') {
                    playPromise.then(markPlaying).catch(function () {
                        setStatus('浏览器阻止了自动播放，请再次点击播放按钮');
                        player.classList.remove('playing');
                    });
                } else {
                    markPlaying();
                }
            }

            function initAndPlay() {
                if (!video || !source) {
                    setStatus('未找到可用播放源');
                    return;
                }
                if (player.getAttribute('data-ready') === 'true') {
                    playVideo();
                    return;
                }
                setStatus('正在加载播放源...');

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        player.setAttribute('data-ready', 'true');
                        setStatus('播放源已就绪');
                        playVideo();
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setStatus('视频加载失败，请稍后重试');
                            player.classList.remove('playing');
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.addEventListener('loadedmetadata', function () {
                        player.setAttribute('data-ready', 'true');
                        playVideo();
                    }, { once: true });
                    video.addEventListener('error', function () {
                        setStatus('视频加载失败，请稍后重试');
                    }, { once: true });
                } else {
                    setStatus('当前浏览器不支持 HLS 视频播放');
                }
            }

            if (button) {
                button.addEventListener('click', initAndPlay);
            }
            if (video) {
                video.addEventListener('click', function () {
                    if (video.paused) {
                        initAndPlay();
                    } else {
                        video.pause();
                        player.classList.remove('playing');
                        setStatus('已暂停，点击继续播放');
                    }
                });
                video.addEventListener('pause', function () {
                    player.classList.remove('playing');
                });
                video.addEventListener('play', markPlaying);
                video.addEventListener('ended', function () {
                    player.classList.remove('playing');
                    setStatus('播放结束，可重新点击播放');
                });
            }

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHero();
        setupGlobalSearch();
        setupCardFilters();
        setupPlayers();
    });
}());
