import { H as Hls } from './hls-vendor.js';

export function initPlayer(streamUrl) {
  const shell = document.querySelector('.js-player');
  const video = document.querySelector('.js-video');
  const cover = document.querySelector('.js-video-poster');

  if (!shell || !video || !streamUrl) {
    return;
  }

  let attached = false;
  let hls = null;

  function attach() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function play() {
    attach();
    shell.classList.add('is-playing');
    video.controls = true;
    const result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(function() {});
    }
  }

  if (cover) {
    cover.addEventListener('click', play);
  }

  video.addEventListener('click', function() {
    if (!attached || video.paused) {
      play();
    }
  });

  window.addEventListener('pagehide', function() {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
