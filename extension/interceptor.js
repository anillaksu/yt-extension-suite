/**
 * YouTube Media Player Accelerator - MAIN World Interceptor
 * Intercepts YouTube player APIs and JSON payloads before playback engine initializes.
 * Strips ad metadata for 0ms delay seamless video streaming.
 */
(function() {
  'use strict';

  const PREFIX = '[YT-ACCELERATOR]';
  let isLicenseActive = true; // Enabled by default; synchronized via storage/message

  // Clean ad metadata from YouTube player JSON response
  function cleanPlayerPayload(jsonObj) {
    if (!jsonObj || typeof jsonObj !== 'object') return jsonObj;

    let modified = false;

    if (jsonObj.adPlacements) {
      delete jsonObj.adPlacements;
      modified = true;
    }
    if (jsonObj.playerAds) {
      delete jsonObj.playerAds;
      modified = true;
    }
    if (jsonObj.adBreakHeartbeatParams) {
      delete jsonObj.adBreakHeartbeatParams;
      modified = true;
    }
    if (jsonObj.adSlots) {
      delete jsonObj.adSlots;
      modified = true;
    }

    // Ensure playability status is clear of enforcement popups
    if (jsonObj.playabilityStatus) {
      if (jsonObj.playabilityStatus.status === 'UNPLAYABLE' || jsonObj.playabilityStatus.status === 'LOGIN_REQUIRED') {
        // Only clear if blocked by adblock enforcement
        if (jsonObj.playabilityStatus.reason && jsonObj.playabilityStatus.reason.toLowerCase().includes('ad blocker')) {
          jsonObj.playabilityStatus.status = 'OK';
          delete jsonObj.playabilityStatus.reason;
          modified = true;
        }
      }
    }

    if (modified) {
      // console.log(`${PREFIX} Seamlessly optimized player payload.`);
    }

    return jsonObj;
  }

  // Intercept inline ytInitialPlayerResponse
  let rawInitialPlayerResponse = window.ytInitialPlayerResponse;
  Object.defineProperty(window, 'ytInitialPlayerResponse', {
    get() {
      return rawInitialPlayerResponse;
    },
    set(val) {
      rawInitialPlayerResponse = cleanPlayerPayload(val);
    },
    configurable: true
  });

  if (window.ytInitialPlayerResponse) {
    window.ytInitialPlayerResponse = cleanPlayerPayload(window.ytInitialPlayerResponse);
  }

  // Intercept window.fetch
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');
    
    const response = await originalFetch.apply(this, args);

    if (isLicenseActive && url && (url.includes('/youtubei/v1/player') || url.includes('/youtubei/v1/next'))) {
      try {
        const clone = response.clone();
        const json = await clone.json();
        const cleaned = cleanPlayerPayload(json);

        return new Response(JSON.stringify(cleaned), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      } catch (err) {
        return response;
      }
    }

    return response;
  };

  // Intercept XMLHttpRequest
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    this._url = url;
    return originalOpen.apply(this, [method, url, ...rest]);
  };

  XMLHttpRequest.prototype.send = function(...args) {
    if (this._url && typeof this._url === 'string' && this._url.includes('/youtubei/v1/player')) {
      const self = this;
      const originalOnReadyStateChange = this.onreadystatechange;

      this.onreadystatechange = function() {
        if (self.readyState === 4 && self.status === 200) {
          try {
            const data = JSON.parse(self.responseText);
            const cleaned = cleanPlayerPayload(data);
            Object.defineProperty(self, 'responseText', { value: JSON.stringify(cleaned) });
            Object.defineProperty(self, 'response', { value: JSON.stringify(cleaned) });
          } catch (e) {}
        }
        if (originalOnReadyStateChange) {
          return originalOnReadyStateChange.apply(this, arguments);
        }
      };
    }
    return originalSend.apply(this, args);
  };

  // Listen to license state synchronization from content script
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'YT_ACCELERATOR_CONFIG') {
      isLicenseActive = event.data.isLicensed !== false && event.data.isEnabled !== false;
    }
  });

  // Signal readiness
  window.postMessage({ type: 'YT_ACCELERATOR_READY' }, '*');
})();
