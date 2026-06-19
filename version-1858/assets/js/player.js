(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initPlayer() {
    var box = document.querySelector('[data-player-box]');
    if (!box) return;
    var video = box.querySelector('video');
    var button = box.querySelector('[data-play-button]');
    var source = box.getAttribute('data-source');
    var started = false;
    var hls = null;
    if (!video || !button || !source) return;

    function start() {
      if (!started) {
        started = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls();
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = source;
          video.play().catch(function () {});
        }
      } else {
        video.play().catch(function () {});
      }
      button.classList.add('is-hidden');
    }

    button.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (started) {
        button.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(initPlayer);
})();
