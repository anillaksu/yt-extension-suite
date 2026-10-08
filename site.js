// forfor.site/store — ortak hareket katmanı. İçerik JS'e bağlı değildir: betik çalışmazsa her şey görünür kalır.
(function () {
  'use strict';
  var azalt = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!azalt && 'IntersectionObserver' in window) document.documentElement.classList.add('hareket-on');

  function hazir(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

  // Eski yerel "telemetri" betiğinin (analytics.js, 08.10.2026 kaldırıldı) ziyaretçi tarayıcısında bıraktığı kayıtları temizle.
  try { ['suite_analytics_sessions', 'suite_analytics_events', 'suite_analytics_heatmap', 'suite_visitor_id'].forEach(function (k) { localStorage.removeItem(k); }); } catch (e) { /* depo kapalıysa temizlenecek bir şey de yoktur */ }

  // Eklentilerden gelen satın alma bağlantısı: .../#satin-al → bu sayfanın ürünü, #satin-al-paket → paket; ödeme penceresi kendiliğinden açılır.
  // Pencere koşulları ve cayma hakkı onayını aldığı için eklentiler doğrudan Polar'a değil buraya yönlendirir (YAYIN-SOZLESMESI.md).
  window.addEventListener('load', function () {
    var m = location.hash.match(/^#satin-al(-paket)?$/);
    if (!m || typeof window.openCheckoutModal !== 'function') return;
    var urun = m[1] ? 'bundle_suite' : /zen-cinema-pro/.test(location.pathname) ? 'yt_accelerator' : /screen-pdf-capture/.test(location.pathname) ? 'clean_capture' : null;
    if (urun) setTimeout(function () { window.openCheckoutModal(urun); }, 350);
  });

  hazir(function () {
    // Üst çubuk: kaydırınca cam zemin.
    var ust = document.querySelector('.ust');
    var dolu = function () { if (ust) ust.classList.toggle('dolu', window.scrollY > 8); };
    dolu(); window.addEventListener('scroll', dolu, { passive: true });

    // Mobil menü.
    var ac = document.querySelector('.menu-ac');
    if (ac && ust) {
      ac.addEventListener('click', function () {
        var acik = ust.classList.toggle('acik');
        ac.setAttribute('aria-expanded', acik ? 'true' : 'false');
      });
      ust.querySelectorAll('.menu a').forEach(function (a) { a.addEventListener('click', function () { ust.classList.remove('acik'); ac.setAttribute('aria-expanded', 'false'); }); });
    }

    // Kaydırınca belirme (sıralı gecikme aynı kaptaki kardeşlere).
    if (document.documentElement.classList.contains('hareket-on')) {
      var gozcu = new IntersectionObserver(function (girdiler) {
        girdiler.forEach(function (g) { if (g.isIntersecting) { g.target.classList.add('gorundu'); gozcu.unobserve(g.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      document.querySelectorAll('[data-belir], .sahne').forEach(function (el) {
        var kardes = el.parentElement ? Array.prototype.filter.call(el.parentElement.children, function (c) { return c.hasAttribute('data-belir'); }) : [];
        var sira = kardes.indexOf(el);
        if (sira > 0) el.style.setProperty('--gecik', Math.min(sira, 5) * 0.08 + 's');
        gozcu.observe(el);
      });
      // Güvenlik: bir sebeple gözlemci tetiklenmezse 2.5 sn sonra hepsini göster.
      setTimeout(function () { document.querySelectorAll('[data-belir]:not(.gorundu), .sahne:not(.gorundu)').forEach(function (el) { el.classList.add('gorundu'); }); }, 2500);
    }

    // Ekran görüntüleri dile göre: Türkçe arayüzde tr, diğer dillerde en görselleri.
    function gorselDili() {
      var dil = (typeof currentLang === 'string' && currentLang === 'tr') ? 'tr' : 'en';
      document.querySelectorAll('img[data-dil-src]').forEach(function (img) {
        var src = img.getAttribute('data-dil-src').replace('{dil}', dil);
        if (img.getAttribute('src') !== src) img.setAttribute('src', src);
      });
    }
    gorselDili();
    var secici = document.getElementById('lang-switch');
    if (secici) secici.addEventListener('change', function () { setTimeout(gorselDili, 0); });

    // Kartlarda imleci izleyen ışık.
    if (!azalt && window.matchMedia('(hover: hover)').matches) {
      document.addEventListener('pointermove', function (e) {
        var kart = e.target.closest && e.target.closest('.kart');
        if (!kart) return;
        var r = kart.getBoundingClientRect();
        kart.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        kart.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, { passive: true });
    }
  });
})();
