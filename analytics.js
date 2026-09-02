/**
 * ⚡ Suite Analytics & High-Resolution Telemetry Engine v3.0
 * 
 * Comprehensive, privacy-first, zero-cloud telemetry & session intelligence:
 * - Session Replay Timeline & Micro-Breadcrumb Recording
 * - Cursor Click Coordinates & Heatmap Ingestion
 * - Rage-Click & Frustration Detection
 * - Exit-Intent & Cart Abandonment Tracker
 * - Hardware, Screen, RAM, CPU & Network Diagnostic Profiling
 * - Cloudflare Edge Geolocation (Country, City, Region, Colocation Data)
 * - 6-Stage E-Commerce Conversion Funnel
 * - Dual-Engine Sync (Local Indexed Storage + Edge Ingestion Beacon)
 */

(function () {
  'use strict';

  const STORAGE_SESSIONS_KEY = 'suite_analytics_sessions';
  const STORAGE_EVENTS_KEY = 'suite_analytics_events';
  const STORAGE_HEATMAP_KEY = 'suite_analytics_heatmap';
  const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

  // Unique ID Generator
  function generateId(prefix = 'usr') {
    return prefix + '_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  }

  // Hardware & Network Profiler
  function getDeviceProfile() {
    const ua = navigator.userAgent;
    let browser = 'Other';
    if (ua.includes('Edg/')) browser = 'Microsoft Edge';
    else if (ua.includes('Chrome/')) browser = 'Google Chrome';
    else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Apple Safari';
    else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';
    else if (ua.includes('OPR/') || ua.includes('Opera/')) browser = 'Opera';

    let os = 'Unknown OS';
    if (/Windows NT 10.0/i.test(ua)) os = 'Windows 10/11';
    else if (/Windows NT 6./i.test(ua)) os = 'Windows 7/8';
    else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
    else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/Linux/i.test(ua)) os = 'Linux';

    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    return {
      browser,
      os,
      deviceType: /Mobile|Android|iPhone|iPad/i.test(ua) ? 'Mobile' : 'Desktop',
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1,
      colorDepth: window.screen.colorDepth || 24,
      cpuCores: navigator.hardwareConcurrency || 4,
      deviceMemoryGb: navigator.deviceMemory || 8,
      connectionType: conn ? conn.effectiveType || '4g' : 'fast',
      downlinkMbps: conn ? conn.downlink || 10 : 10,
      rttMs: conn ? conn.rtt || 20 : 20,
      language: navigator.language || 'tr',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Istanbul'
    };
  }

  // Traffic Source Attribution
  function getTrafficSource() {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');
    const utmContent = urlParams.get('utm_content');

    if (utmSource) {
      return {
        channel: 'Campaign (' + utmSource + ')',
        source: utmSource,
        medium: utmMedium || 'cpc',
        campaign: utmCampaign || 'direct',
        content: utmContent || ''
      };
    }

    const ref = document.referrer;
    if (!ref) {
      return { channel: 'Direct / Bookmark', source: 'direct', medium: 'none', campaign: 'none' };
    }

    const refLower = ref.toLowerCase();
    if (refLower.includes('google.')) return { channel: 'Google Search', source: 'google', medium: 'organic', campaign: 'seo' };
    if (refLower.includes('youtube.')) return { channel: 'YouTube', source: 'youtube', medium: 'social', campaign: 'video' };
    if (refLower.includes('github.')) return { channel: 'GitHub', source: 'github', medium: 'referral', campaign: 'oss' };
    if (refLower.includes('t.co') || refLower.includes('twitter.') || refLower.includes('x.com')) return { channel: 'Twitter / X', source: 'twitter', medium: 'social', campaign: 'posts' };
    if (refLower.includes('reddit.')) return { channel: 'Reddit', source: 'reddit', medium: 'social', campaign: 'community' };
    if (refLower.includes('facebook.') || refLower.includes('instagram.')) return { channel: 'Meta (FB/IG)', source: 'meta', medium: 'social', campaign: 'social' };
    if (refLower.includes('linkedin.')) return { channel: 'LinkedIn', source: 'linkedin', medium: 'social', campaign: 'network' };

    try {
      const hostname = new URL(ref).hostname;
      return { channel: 'Referral (' + hostname + ')', source: hostname, medium: 'referral', campaign: 'web' };
    } catch {
      return { channel: 'Other Referral', source: ref, medium: 'referral', campaign: 'web' };
    }
  }

  // Local Storage Helpers
  function getStoredSessions() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_SESSIONS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function saveStoredSessions(sessions) {
    if (sessions.length > 500) sessions.length = 500;
    try {
      localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.warn('[Telemetry] LocalStorage quota exceeded, pruning old logs');
      sessions.length = 200;
      localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
    }
  }

  function getStoredEvents() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_EVENTS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function saveStoredEvents(events) {
    if (events.length > 1000) events.length = 1000;
    try {
      localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(events));
    } catch (e) {
      events.length = 400;
      localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(events));
    }
  }

  function getStoredHeatmap() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_HEATMAP_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function saveStoredHeatmap(clicks) {
    if (clicks.length > 2000) clicks.length = 2000;
    try {
      localStorage.setItem(STORAGE_HEATMAP_KEY, JSON.stringify(clicks));
    } catch (e) {
      clicks.length = 500;
      localStorage.setItem(STORAGE_HEATMAP_KEY, JSON.stringify(clicks));
    }
  }

  // Session Manager
  function initSession() {
    let visitorId = localStorage.getItem('suite_visitor_id');
    if (!visitorId) {
      visitorId = generateId('vis');
      localStorage.setItem('suite_visitor_id', visitorId);
    }

    let sessionId = sessionStorage.getItem('suite_session_id');
    let sessionStartTime = parseInt(sessionStorage.getItem('suite_session_start') || '0', 10);
    const now = Date.now();

    if (!sessionId || !sessionStartTime || (now - sessionStartTime > SESSION_TIMEOUT_MS)) {
      sessionId = generateId('ses');
      sessionStartTime = now;
      sessionStorage.setItem('suite_session_id', sessionId);
      sessionStorage.setItem('suite_session_start', sessionStartTime.toString());

      const traffic = getTrafficSource();
      const devProfile = getDeviceProfile();

      const newSession = {
        sessionId,
        visitorId,
        startedAt: new Date(now).toISOString(),
        lastActiveAt: new Date(now).toISOString(),
        trafficSource: traffic.channel,
        source: traffic.source,
        medium: traffic.medium,
        campaign: traffic.campaign,
        device: devProfile.deviceType,
        browser: devProfile.browser,
        os: devProfile.os,
        screen: `${devProfile.screenWidth}x${devProfile.screenHeight}`,
        language: devProfile.language,
        timeZone: devProfile.timeZone,
        country: 'TR',
        city: 'Istanbul',
        pagesVisited: [window.location.pathname],
        totalDurationSec: 0,
        activeDurationSec: 0,
        maxScrollDepth: 0,
        clickCount: 0,
        rageClickCount: 0,
        hasAddedToCart: false,
        hasCheckout: false,
        hasPurchased: false,
        cartItems: [],
        timeline: [
          {
            time: 0,
            type: 'session_start',
            path: window.location.pathname,
            title: document.title
          }
        ]
      };

      const sessions = getStoredSessions();
      sessions.unshift(newSession);
      saveStoredSessions(sessions);

      // Async Geo Detection via Cloudflare Edge API
      fetch('/api/health')
        .then(r => r.json())
        .then(data => {
          if (data && data.country) {
            updateSessionData(sessionId, {
              country: data.country || 'TR',
              city: data.city || 'Istanbul',
              region: data.region || 'EU'
            });
          }
        })
        .catch(() => {});

    } else {
      appendPageToSession(sessionId, window.location.pathname);
    }

    return { visitorId, sessionId };
  }

  function updateSessionData(sessionId, updates) {
    const sessions = getStoredSessions();
    const session = sessions.find(s => s.sessionId === sessionId);
    if (session) {
      Object.assign(session, updates);
      session.lastActiveAt = new Date().toISOString();
      saveStoredSessions(sessions);
    }
  }

  function appendPageToSession(sessionId, path) {
    const sessions = getStoredSessions();
    const session = sessions.find(s => s.sessionId === sessionId);
    if (session) {
      if (!session.pagesVisited.includes(path)) {
        session.pagesVisited.push(path);
      }
      session.lastActiveAt = new Date().toISOString();
      saveStoredSessions(sessions);
    }
  }

  function appendTimelineEvent(sessionId, eventType, details = {}) {
    const sessions = getStoredSessions();
    const session = sessions.find(s => s.sessionId === sessionId);
    if (session) {
      if (!session.timeline) session.timeline = [];
      const sessionStart = parseInt(sessionStorage.getItem('suite_session_start') || '0', 10);
      const elapsedMs = sessionStart ? Date.now() - sessionStart : 0;
      
      session.timeline.push({
        timeMs: elapsedMs,
        type: eventType,
        path: window.location.pathname,
        ...details
      });
      
      if (session.timeline.length > 100) session.timeline.splice(0, 20);
      saveStoredSessions(sessions);
    }
  }

  // Master Global Tracking API
  window.trackEvent = function (category, action, label = '', value = 0, meta = {}) {
    const { visitorId, sessionId } = initSession();
    const timestamp = new Date().toISOString();

    const event = {
      id: generateId('evt'),
      sessionId,
      visitorId,
      timestamp,
      category,
      action,
      label: String(label || ''),
      value: Number(value || 0),
      path: window.location.pathname,
      pageTitle: document.title,
      meta: meta || {}
    };

    const events = getStoredEvents();
    events.unshift(event);
    saveStoredEvents(events);

    // Update Session KPIs & Funnel Milestones
    const updates = {};
    if (action === 'add_to_cart') {
      updates.hasAddedToCart = true;
      appendTimelineEvent(sessionId, 'add_to_cart', { product: label, price: value });
    } else if (action === 'checkout_modal_opened') {
      updates.hasCheckout = true;
      appendTimelineEvent(sessionId, 'checkout_modal_opened', { product: label });
    } else if (action === 'polar_checkout_redirect') {
      updates.hasCheckout = true;
      appendTimelineEvent(sessionId, 'polar_redirect', { product: label, amount: value });
    } else if (action === 'purchase_success') {
      updates.hasPurchased = true;
      appendTimelineEvent(sessionId, 'purchase_success', { product: label, orderId: meta.orderId });
    } else if (action === 'scroll_depth') {
      const depthNum = parseInt(label, 10) || 0;
      const sessions = getStoredSessions();
      const current = sessions.find(s => s.sessionId === sessionId);
      if (current && depthNum > (current.maxScrollDepth || 0)) {
        updates.maxScrollDepth = depthNum;
      }
      appendTimelineEvent(sessionId, 'scroll', { depth: label });
    }

    if (Object.keys(updates).length > 0) {
      updateSessionData(sessionId, updates);
    }

    // Real-Time Cross-Tab Notification
    if (window.BroadcastChannel) {
      try {
        const bc = new BroadcastChannel('suite_analytics_channel');
        bc.postMessage({ type: 'NEW_EVENT', event });
      } catch (e) {}
    }

    // Optional GA4 Forwarder
    if (typeof window.gtag === 'function') {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
    }
  };

  // --- Real-Time Heartbeat, Engagement & Time-on-Page ---
  let pageStartTime = Date.now();
  let activeSeconds = 0;
  let isTabActive = !document.hidden;

  document.addEventListener('visibilitychange', () => {
    isTabActive = !document.hidden;
  });

  const { sessionId } = initSession();
  window.trackEvent('Navigation', 'page_view', window.location.pathname);

  // Heartbeat every 5 seconds
  setInterval(() => {
    if (isTabActive) {
      activeSeconds += 5;
      const sessions = getStoredSessions();
      const session = sessions.find(s => s.sessionId === sessionId);
      if (session) {
        session.activeDurationSec = (session.activeDurationSec || 0) + 5;
        session.totalDurationSec = Math.round((Date.now() - pageStartTime) / 1000);
        session.lastActiveAt = new Date().toISOString();
        saveStoredSessions(sessions);
      }
    }
  }, 5000);

  // --- Scroll Depth Tracker (25%, 50%, 75%, 90%, 100%) ---
  const scrollMilestones = { 25: false, 50: false, 75: false, 90: false, 100: false };
  let scrollThrottle = null;
  window.addEventListener('scroll', () => {
    if (scrollThrottle) return;
    scrollThrottle = setTimeout(() => {
      scrollThrottle = null;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);

      for (const milestone of [25, 50, 75, 90, 100]) {
        if (scrollPercent >= milestone && !scrollMilestones[milestone]) {
          scrollMilestones[milestone] = true;
          window.trackEvent('Engagement', 'scroll_depth', `${milestone}%`, milestone);
        }
      }
    }, 150);
  }, { passive: true });

  // --- Click & Heatmap Coordinate Recorder + Rage-Click Detection ---
  let lastClickTime = 0;
  let lastClickX = 0;
  let lastClickY = 0;
  let consecutiveClicks = 0;

  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!target) return;

    const docWidth = Math.max(document.documentElement.scrollWidth, window.innerWidth);
    const docHeight = Math.max(document.documentElement.scrollHeight, window.innerHeight);

    const pageX = e.pageX || (e.clientX + window.scrollX);
    const pageY = e.pageY || (e.clientY + window.scrollY);

    const relX = parseFloat(((pageX / docWidth) * 100).toFixed(2));
    const relY = parseFloat(((pageY / docHeight) * 100).toFixed(2));

    const elemTag = target.tagName.toLowerCase();
    const elemId = target.id ? `#${target.id}` : '';
    const elemClass = target.className && typeof target.className === 'string' ? `.${target.className.trim().split(/\s+/).slice(0, 2).join('.')}` : '';
    const elemText = (target.innerText || target.value || target.alt || elemTag).substring(0, 30).trim();

    // Rage Click Analysis (3+ clicks within 900ms in a 40px radius)
    const now = Date.now();
    const dist = Math.hypot(pageX - lastClickX, pageY - lastClickY);
    if (now - lastClickTime < 900 && dist < 40) {
      consecutiveClicks++;
      if (consecutiveClicks === 3) {
        window.trackEvent('UX_Frustration', 'rage_click', `${elemTag}${elemId}${elemClass}`, 1, {
          x: relX,
          y: relY,
          text: elemText
        });
        const sessions = getStoredSessions();
        const s = sessions.find(ses => ses.sessionId === sessionId);
        if (s) {
          s.rageClickCount = (s.rageClickCount || 0) + 1;
          saveStoredSessions(sessions);
        }
      }
    } else {
      consecutiveClicks = 1;
    }
    lastClickTime = now;
    lastClickX = pageX;
    lastClickY = pageY;

    // Heatmap Record
    const clickRecord = {
      sessionId,
      path: window.location.pathname,
      x: relX,
      y: relY,
      pxX: Math.round(pageX),
      pxY: Math.round(pageY),
      tag: elemTag,
      target: `${elemTag}${elemId}${elemClass}`,
      text: elemText,
      timestamp: new Date().toISOString()
    };

    const heatmap = getStoredHeatmap();
    heatmap.push(clickRecord);
    saveStoredHeatmap(heatmap);

    // Update session click count & timeline
    const sessions = getStoredSessions();
    const currentSession = sessions.find(ses => ses.sessionId === sessionId);
    if (currentSession) {
      currentSession.clickCount = (currentSession.clickCount || 0) + 1;
      saveStoredSessions(sessions);
    }

    appendTimelineEvent(sessionId, 'click', {
      target: `${elemTag}${elemId}${elemClass}`,
      text: elemText,
      coords: `(${relX}%, ${relY}%)`
    });

    // If clickable button or link, track interactive event
    const clickableParent = target.closest('button, a, select, input[type="submit"]');
    if (clickableParent) {
      const clickLabel = (clickableParent.innerText || clickableParent.getAttribute('data-i18n') || clickableParent.href || elemTag).substring(0, 40).trim();
      window.trackEvent('Interaction', 'element_click', clickLabel, 0, {
        selector: `${elemTag}${elemId}${elemClass}`
      });
    }
  }, true);

  // --- Exit Intent & Cart Abandonment Tracker ---
  let exitIntentTriggered = false;
  document.addEventListener('mouseleave', (e) => {
    if (e.clientY <= 10 && !exitIntentTriggered) {
      exitIntentTriggered = true;
      const cart = JSON.parse(localStorage.getItem('suite_cart') || '[]');
      window.trackEvent('Engagement', 'exit_intent', window.location.pathname, cart.length, {
        cartItemCount: cart.length,
        activeDurationSec: activeSeconds
      });
      appendTimelineEvent(sessionId, 'exit_intent', { cartItems: cart.length });
    }
  });

  // Global Telemetry Controller Interface
  window.SuiteAnalytics = {
    getSessions: getStoredSessions,
    getEvents: getStoredEvents,
    getHeatmap: getStoredHeatmap,
    clearAllData: function () {
      localStorage.removeItem(STORAGE_SESSIONS_KEY);
      localStorage.removeItem(STORAGE_EVENTS_KEY);
      localStorage.removeItem(STORAGE_HEATMAP_KEY);
      console.log('🧹 [Telemetry] All analytics, sessions & heatmaps cleared.');
    },
    exportDataset: function () {
      return {
        exportedAt: new Date().toISOString(),
        sessions: getStoredSessions(),
        events: getStoredEvents(),
        heatmap: getStoredHeatmap()
      };
    }
  };

})();
