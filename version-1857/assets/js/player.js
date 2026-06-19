(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initPlayer(player) {
    var video = player.querySelector('video');
    var source = video ? video.getAttribute('data-src') : '';
    var playButtons = Array.prototype.slice.call(player.querySelectorAll('[data-play], [data-play-toggle]'));
    var muteButton = player.querySelector('[data-mute-toggle]');
    var fullscreenButton = player.querySelector('[data-fullscreen]');
    var status = player.querySelector('[data-video-status]');
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function attachSource() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setStatus('点击播放高清正片');
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('点击播放高清正片');
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放源加载中，请稍候重试');
          }
        });
        return;
      }
      video.src = source;
      setStatus('点击播放高清正片');
    }

    function play() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          setStatus('点击播放器开始播放');
        });
      }
    }

    playButtons.forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      player.classList.add('is-playing');
      setStatus('正在播放');
    });

    video.addEventListener('pause', function () {
      player.classList.remove('is-playing');
      setStatus('点击继续播放');
    });

    video.addEventListener('ended', function () {
      player.classList.remove('is-playing');
      setStatus('播放结束');
    });

    if (muteButton) {
      muteButton.addEventListener('click', function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? '取消静音' : '静音';
      });
    }

    if (fullscreenButton) {
      fullscreenButton.addEventListener('click', function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (player.requestFullscreen) {
          player.requestFullscreen();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });

    attachSource();
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
  });
})();
