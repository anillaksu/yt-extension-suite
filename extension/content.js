/**
 * YouTube Media Player Accelerator - Content Script (ISOLATED World)
 * Manages DOM cleaning, Anti-Adblock popup shields, fallback fast-skipping, and settings sync.
 */
(function() {
  'use strict';

  let config = {
    isLicensed: true,
    isEnabled: true,
    bannerCleaner: true,
    antiAdblockShield: true,
    streamSpeedSupressor: true
  };

  // Sync settings with Chrome Storage
  function loadConfig() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['isLicensed', 'isEnabled', 'features'], (res) => {
        if (res.isLicensed !== undefined) config.isLicensed = res.isLicensed;
        if (res.isEnabled !== undefined) config.isEnabled = res.isEnabled;
        if (res.features) {
          config = { ...config, ...res.features };
        }
        syncWithInterceptor();
      });
    }
  }

  function syncWithInterceptor() {
    window.postMessage({
      type: 'YT_ACCELERATOR_CONFIG',
      isLicensed: config.isLicensed,
      isEnabled: config.isEnabled
    }, '*');
  }

  // Inject High-Priority Ad Cleanup CSS
  function injectCleanerCSS() {
    if (document.getElementById('yt-accelerator-css')) return;
    const style = document.createElement('style');
    style.id = 'yt-accelerator-css';
    style.textContent = `
      .ytp-ad-overlay-container,
      .ytp-ad-text-overlay,
      ytd-display-ad-renderer,
      ytd-statement-banner-renderer,
      ytd-in-feed-ad-layout-renderer,
      ytd-banner-promo-renderer,
      ytd-action-companion-ad-renderer,
      .ytp-ad-action-interstitial,
      #player-ads,
      #masthead-ad,
      ytd-ad-slot-renderer,
      .ytd-player-legacy-desktop-watch-ads-renderer,
      ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-ads"],
      #companion,
      .sparkles-light-cta,
      .ytp-ad-message-container {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        height: 0 !important;
        width: 0 !important;
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  // Anti-Adblock Popup Remover Shield
  function handleAntiAdblock() {
    if (!config.antiAdblockShield || !config.isEnabled) return;

    const popupSelectors = [
      'ytd-enforcement-message-view-model',
      'tp-yt-paper-dialog:has(#feedback-submitted-dismiss-button)',
      'yt-playability-error-supported-renderers',
      'ytd-popup-container tp-yt-paper-dialog'
    ];

    popupSelectors.forEach(selector => {
      try {
        const popups = document.querySelectorAll(selector);
        popups.forEach(popup => {
          const text = (popup.textContent || '').toLowerCase();
          if (text.includes('ad blocker') || text.includes('reklam') || text.includes('premium')) {
            popup.remove();
            const video = document.querySelector('video');
            if (video && video.paused) {
              video.play().catch(() => {});
            }
          }
        });
      } catch (e) {}
    });
  }

  // Fallback Stream Ad Fast-Skipper
  function handleStreamAdFallback() {
    if (!config.streamSpeedSupressor || !config.isEnabled) return;

    const player = document.getElementById('movie_player') || document.querySelector('.html5-video-player');
    const isAdShowing = player && (player.classList.contains('ad-showing') || player.classList.contains('ad-interrupting'));

    if (isAdShowing) {
      // 1. Fast Click Skip Buttons
      const skipButtons = [
        '.ytp-ad-skip-button',
        '.ytp-ad-skip-button-modern',
        '.ytp-skip-ad-button',
        '.ytp-ad-skip-button-slot button',
        'button.ytp-ad-skip-button-text'
      ];

      for (const sel of skipButtons) {
        const btn = document.querySelector(sel);
        if (btn && (btn.offsetWidth > 0 || btn.offsetHeight > 0)) {
          btn.click();
          break;
        }
      }

      // 2. Fast forward video stream
      const video = document.querySelector('video');
      if (video) {
        video.muted = true;
        video.playbackRate = 16.0;
        if (isFinite(video.duration) && video.duration > 0) {
          if (video.duration - video.currentTime > 0.3) {
            video.currentTime = video.duration - 0.1;
          }
        }
        if (video.paused) {
          video.play().catch(() => {});
        }
      }

      // 3. Trigger native skipAd if exposed
      if (player && typeof player.skipAd === 'function') {
        try { player.skipAd(); } catch(e) {}
      }
    }
  }

  // Initialize
  function init() {
    loadConfig();
    injectCleanerCSS();

    // Check periodically
    setInterval(() => {
      handleAntiAdblock();
      handleStreamAdFallback();
    }, 200);

    // Mutation observer for instant DOM changes
    const observer = new MutationObserver(() => {
      handleAntiAdblock();
      handleStreamAdFallback();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  // Listen for storage changes in real time
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') {
        loadConfig();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
