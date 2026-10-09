// Kullanım: node araclar/site-metin.mjs (metinler) → node araclar/sayfa-uret.mjs → node araclar/urun-senkron.mjs
// forfor.site/store — 6 sayfayı ortak parçalardan üretir (üst çubuk, alt bilgi, sepet/ödeme pencereleri tek kaynak).
// Statik metinler i18n.js'in Türkçesidir; dil değişince i18n.js data-i18n öğelerinin içini değiştirir.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';

const KOK = 'C:\\Users\\anil\\yt-extension-suite';
const oku = (y) => fs.readFileSync(path.join(KOK, y), 'utf8');
const hash = (y) => { const b = fs.readFileSync(path.join(KOK, y)); return crypto.createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex').slice(0, 8); };

// Türkçe sözlük: statik metin = tr
const ctx = { localStorage: { getItem: () => 'tr', setItem() {} }, document: { addEventListener() {}, querySelectorAll: () => [] } };
vm.createContext(ctx); vm.runInContext(oku('i18n.js') + '\nthis.T = TRANSLATIONS;', ctx);
const TR = ctx.T.tr;
const t = (k) => { if (TR[k] == null) throw new Error('i18n anahtarı yok: ' + k); return TR[k]; };
const i = (k, etiket = 'span', ek = '') => `<${etiket} data-i18n="${k}"${ek ? ' ' + ek : ''}>${t(k)}</${etiket}>`;
const urun = JSON.parse(oku('urunler.json')).urunler;
// Yalnız USD (Polar USD tahsil eder; urun-senkron alanIcerigi ile aynı biçim olmalı).
const fiyat = (slug) => `$${urun[slug].fiyat.usd.toFixed(2)}`;
const surum = (slug) => `v${urun[slug].surum}`;
const tarih = (slug) => `<time datetime="${urun[slug].son_guncelleme}">${urun[slug].son_guncelleme}</time>`;

const IKON = {
  sepet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2"/><circle cx="10" cy="20" r="1.2"/><circle cx="17" cy="20" r="1.2"/></svg>',
  kalkan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7 3v5.5c0 4.3-3 8-7 9.5-4-1.5-7-5.2-7-9.5V6l7-3z"/><path d="M9 12l2 2 4-4"/></svg>',
  anahtar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M14 9l2 2"/></svg>',
  cihaz: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
  kilit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
  sinema: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/></svg>',
  not: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  kare: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  altyazi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 13h4M13 13h4M7 16h7"/></svg>',
  defter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/></svg>',
  yorum: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/></svg>',
  tamsayfa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="2.5" width="12" height="19" rx="2"/><path d="M9 7h6M9 10h6M9 13h6M9 16h3"/></svg>',
  ekran: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M9 21h6"/></svg>',
  bolge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><rect x="8" y="8" width="8" height="8" rx="1" stroke-dasharray="2 2"/></svg>',
  hedef: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 3l5 15 2.5-6.5L19 9z"/></svg>',
  pdf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M8.5 14h7M8.5 17h5"/></svg>',
  kalem: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/></svg>',
  indir: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="18" height="18"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>'
};
const ok = '<span class="ok" aria-hidden="true">→</span>';

// Kurulum tek yoldan: Chrome Web Store (urunler.json cws, kaynağı registry). Yayında değilse #kurulum açıklamasına iner; zip verilmez.
const cws = (slug) => { const c = urun[slug].cws; if (!c) throw new Error('cws bilgisi yok: ' + slug); return c; };
function kur(slug, sinif = 'birincil', simge = true, ekStil = '') {
  const c = cws(slug);
  const st = ekStil ? ` style="${ekStil}"` : '';
  return c.yayinda
    ? `<a href="${c.url}" target="_blank" rel="noopener" class="dugme ${sinif}"${st}>${simge ? IKON.indir : ''}<span data-i18n="s2cKur">${t('s2cKur')}</span></a>`
    : `<a href="#kurulum" class="dugme ${sinif} inceleme"${st}><span data-i18n="s2CwsInceleme">${t('s2CwsInceleme')}</span></a>`;
}

const MARKA_SVG = `<svg class="marka-isaret" viewBox="0 0 34 34" aria-hidden="true"><defs><linearGradient id="mz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#352E26"/><stop offset="1" stop-color="#16130F"/></linearGradient><radialGradient id="mi" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#F2C987" stop-opacity=".9"/><stop offset="1" stop-color="#D9A864" stop-opacity="0"/></radialGradient></defs><rect x=".5" y=".5" width="33" height="33" rx="10" fill="url(#mz)" stroke="rgba(255,240,220,.16)"/><path d="M8.5 22.5a8.5 8.5 0 0 1 17 0" fill="none" stroke="#EEE8DC" stroke-width="2.2" stroke-linecap="round"/><circle cx="17" cy="22" r="7" fill="url(#mi)"/><circle cx="17" cy="22" r="3.2" fill="#D9A864"/></svg>`;
const FAVICON = "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 34"><rect width="34" height="34" rx="10" fill="#1F1B16"/><path d="M8.5 22.5a8.5 8.5 0 0 1 17 0" fill="none" stroke="#EEE8DC" stroke-width="2.4" stroke-linecap="round"/><circle cx="17" cy="22" r="3.6" fill="#D9A864"/></svg>`);

function bas({ baslik, aciklama, k, aktif, ek = '' }) {
  const v = (y) => `${k}${y}?v=${hash(y)}`;
  const menu = [['urunler', '/store/index.html#eklentiler', 's2NavUrunler'], ['zen', '/store/zen-cinema-pro/', null, 'Zen Cinema'], ['cc', '/store/screen-pdf-capture/', null, 'Clean Capture'], ['magaza', '/store/', 's2NavMagaza'], ['lisans', '/store/#lisans', 's2NavLisans']];
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${baslik}</title>
  <meta name="description" content="${aciklama}">
  <meta name="theme-color" content="#12100D">
  <link rel="icon" href="${FAVICON}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${v('site.css')}">${ek}
  <script src="${v('i18n.js')}" defer></script>
  <script src="${v('catalog.js')}" defer></script>
  <script src="${v('cart.js')}" defer></script>
  <script src="${v('site.js')}" defer></script>
</head>
<body>
  <div class="alan-serit">
    <div class="kap">
      <a href="https://forfor.site/" class="ana-don"><span aria-hidden="true">←</span> forfor.site</a>
      <span class="alan-ad"><i aria-hidden="true"></i><span data-i18n="s2MagazaAlan">${t('s2MagazaAlan')}</span></span>
    </div>
  </div>
  <header class="ust">
    <div class="kap">
      <a href="/store/index.html" class="marka" aria-label="Anıl Aksu Studio">${MARKA_SVG}<span>Anıl Aksu <small>Studio</small></span></a>
      <nav class="menu" aria-label="Site">
${menu.map(([ad, href, key, ad2]) => `        <a href="${href}"${ad === aktif ? ' class="aktif" aria-current="page"' : ''}${key ? ` data-i18n="${key}">${t(key)}` : `>${ad2}`}</a>`).join('\n')}
      </nav>
      <div class="ust-arac">
        <button class="cart-nav-btn" onclick="openCart()" aria-label="${t('s2Sepet')}">${IKON.sepet}<span class="yazi" data-i18n="s2Sepet">${t('s2Sepet')}</span><span class="cart-badge" id="nav-cart-badge" style="display: none;">0</span></button>
        <select id="lang-switch" class="lang-select-dropdown" onchange="applyLanguage(this.value)" aria-label="Dil / Language">
          <option value="tr">TR</option><option value="en">EN</option><option value="es">ES</option><option value="de">DE</option>
        </select>
        <button class="menu-ac" aria-label="Menü" aria-expanded="false"><span></span></button>
      </div>
    </div>
  </header>
`;
}

function son() {
  return `
  <footer class="footer">
    <div class="kap">
      <div class="footer-grid">
        <div>
          <a href="/store/index.html" class="marka">${MARKA_SVG}<span>Anıl Aksu <small>Studio</small></span></a>
          ${i('s2FootDesc', 'p')}
        </div>
        <div>
          ${i('s2NavUrunler', 'h4')}
          <a href="/store/zen-cinema-pro/">Zen Cinema</a>
          <a href="/store/screen-pdf-capture/">Clean Capture</a>
          <a href="/store/" data-i18n="s2NavMagaza">${t('s2NavMagaza')}</a>
        </div>
        <div>
          ${i('s2FootYasal', 'h4')}
          <a href="/store/privacy/" data-i18n="navPrivacy">${t('navPrivacy')}</a>
          <a href="/store/terms/" data-i18n="navTerms">${t('navTerms')}</a>
          <a href="/store/#lisans" data-i18n="s2NavLisans">${t('s2NavLisans')}</a>
        </div>
        <div>
          <h4>Studio</h4>
          <a href="https://forfor.site/yazilar">Yazılar · Blog</a>
          <a href="https://github.com/anillaksu" target="_blank" rel="noopener">GitHub</a>
        </div>
        <div>
          ${i('s2FootIletisim', 'h4')}
          <a href="mailto:support@forfor.site" class="eposta">support@forfor.site</a>
          <a href="https://forfor.site/iletisim">forfor.site/iletisim</a>
        </div>
      </div>
      <div class="footer-alt">${i('s2FootHaklar')}${i('s2FootOdeme')}</div>
    </div>
  </footer>

  <div class="cart-drawer-overlay" id="cart-overlay" onclick="closeCart()"></div>
  <aside class="cart-drawer" id="cart-drawer" aria-label="${t('s2Sepet')}">
    <div class="cart-drawer-header">
      <div class="cart-drawer-title">${i('navCart')}</div>
      <button class="cart-close-btn" onclick="closeCart()" aria-label="${t('s2Kapat')}">✕</button>
    </div>
    <div class="cart-drawer-body" id="cart-drawer-items"></div>
    <div class="cart-drawer-footer">
      <div class="cart-subtotal-row"><span class="cart-subtotal-label" data-i18n="s2Toplam">${t('s2Toplam')}</span><span class="cart-subtotal-val" id="cart-drawer-subtotal">$0.00</span></div>
      <button onclick="openCheckoutModal()" class="btn-primary"><span data-i18n="s2CheckoutBaslik">${t('s2CheckoutBaslik')}</span>${ok}</button>
    </div>
  </aside>

  <div class="modal-overlay" id="checkout-modal" role="dialog" aria-modal="true">
    <div class="modal-content">
      <button class="modal-close" onclick="closeCheckoutModal()" aria-label="${t('s2Kapat')}">✕</button>
      ${i('s2CheckoutBaslik', 'h3')}
      ${i('s2CheckoutAlt', 'p')}
      <div class="modal-ozet" id="checkout-order-summary"></div>
      <div class="modal-toplam"><span data-i18n="s2Toplam">${t('s2Toplam')}</span><strong id="checkout-total-amount">$0.00</strong></div>
      ${i('s2UsdNot', 'p', 'class="fiyat-not"')}
      <form onsubmit="submitCheckout(event)">
        <div class="form-group">
          <label class="form-label" for="checkout-email" data-i18n="s2EpostaEtiket">${t('s2EpostaEtiket')}</label>
          <input type="email" id="checkout-email" required placeholder="adiniz@example.com" class="form-input" autocomplete="email">
          <p class="fiyat-not" data-i18n="s2EpostaIpucu">${t('s2EpostaIpucu')}</p>
        </div>
        <div class="form-group">
          <label class="form-label" for="checkout-name" data-i18n="s2AdEtiket">${t('s2AdEtiket')}</label>
          <input type="text" id="checkout-name" class="form-input" autocomplete="name">
        </div>
        <div class="guven">${IKON.kalkan}<div><b data-i18n="s2GuvenB">${t('s2GuvenB')}</b><span data-i18n="s2GuvenM">${t('s2GuvenM')}</span></div></div>
        <label class="checkbox-label"><input type="checkbox" id="checkout-terms" required><span><a href="/store/terms/" target="_blank" data-i18n="modalCheckoutTermsPart1">${t('modalCheckoutTermsPart1')}</a> · <a href="/store/privacy/" target="_blank" data-i18n="modalCheckoutTermsPart2">${t('modalCheckoutTermsPart2')}</a> <span data-i18n="modalCheckoutTermsPart3">${t('modalCheckoutTermsPart3')}</span></span></label>
        <button type="submit" id="btn-submit-order" class="btn-primary"><span data-i18n="s2OdemeyeGec">${t('s2OdemeyeGec')}</span>${ok}</button>
      </form>
    </div>
  </div>

  <div class="modal-overlay" id="order-success-modal" role="dialog" aria-modal="true">
    <div class="modal-content">
      <button class="modal-close" onclick="closeSuccessModal()" aria-label="${t('s2Kapat')}">✕</button>
      <div id="order-success-details"></div>
      <button onclick="closeSuccessModal()" class="btn-secondary" style="margin-top: 20px;" data-i18n="successCloseBtn">${t('successCloseBtn')}</button>
    </div>
  </div>
</body>
</html>
`;
}

const sahne = (k1, k2, rozet, buz = false, dil = false) => {
  const img = (src, alt, yukle) => dil ? `<img data-dil-src="${src}" src="${src.replace('{dil}', 'tr')}" alt="${alt}" width="1280" height="800"${yukle}>` : `<img src="${src}" alt="${alt}" width="1280" height="800"${yukle}>`;
  return `<div class="sahne${buz ? ' buz' : ''}" aria-hidden="false">
        <div class="isik"></div>
        <div class="katman k1">${img(k1[0], k1[1], ' loading="lazy" decoding="async"')}</div>
        <div class="katman k2">${img(k2[0], k2[1], ' fetchpriority="high" decoding="async"')}</div>
        ${rozet ? `<div class="rozet">${rozet}</div>` : ''}
      </div>`;
};
const tikli = (anahtarlar, buz = false) => `<ul class="tikli${buz ? ' buz' : ''}">${anahtarlar.map((k) => `<li data-i18n="${k}">${t(k)}</li>`).join('')}</ul>`;
const kartIkon = (ikon, bk, mk, ek = '', buz = false) => `<article class="kart" data-belir><div class="simge-kutu${buz ? ' buz' : ''}">${ikon}</div>${i(bk, 'h3')}${i(mk, 'p')}${ek}</article>`;
const kisayol = (...t) => `<div class="kisayol">${t.map((x) => `<kbd>${x}</kbd>`).join('')}</div>`;
const sepetDugme = (slug) => `<button onclick="addToCart('${slug}')" class="btn-cart-action price-cart" aria-label="${t('s2SepeteEkle')}" title="${t('s2SepeteEkle')}">${IKON.sepet}</button>`;

const LISANS = `
  <section class="bolum cizgili" id="lisans">
    <div class="dar">
      <div class="lisans-kutu" data-belir>
        <div class="simge-kutu" style="margin: 0 auto 16px;">${IKON.anahtar}</div>
        ${i('s2LisansBaslik', 'h3')}
        ${i('s2LisansAlt', 'p')}
        <form onsubmit="searchLicenses(event); return false;" id="license-recovery-form" class="lisans-form">
          <input type="text" id="recovery-query" placeholder="${t('s2LisansYer')}" data-i18n-placeholder="s2LisansYer" class="form-input" autocomplete="off" spellcheck="false">
          <button type="submit" id="recovery-submit-btn" class="dugme birincil" data-i18n="recoveryBtn">${t('recoveryBtn')}</button>
        </form>
        <div id="recovery-results" style="margin-top: 18px;"></div>
        <p style="margin-top: 14px; font-size: 14px;"><a href="https://polar.sh/anil-aksu/portal" target="_blank" rel="noopener" style="color: var(--vurgu-acik);"><span data-i18n="s2LisansPortal">${t('s2LisansPortal')}</span> ↗</a></p>
      </div>
    </div>
  </section>`;

// ---------------- Ana sayfa ----------------
function anaSayfa() {
  const k = '/store/';
  return bas({ baslik: 'Anıl Aksu Studio — Zen Cinema ve Clean Capture', aciklama: 'Sakin, işe yarayan tarayıcı eklentileri: YouTube için Zen Cinema ve tam sayfa ekran görüntüsü için Clean Capture. Veriler cihazda kalır, lisans bir kez alınır.', k, aktif: '' }) + `
  <main>
    <section class="kahraman">
      <div class="kap">
        <div>
          ${i('s2HubEtiket', 'span', 'class="etiket"').replace('<span data-i18n="s2HubEtiket" class="etiket">', '<span class="etiket" data-i18n="s2HubEtiket">')}
          ${i('s2HubBaslik', 'h1')}
          ${i('s2HubGiris', 'p', 'class="giris"')}
          <div class="eylemler">
            <a href="#eklentiler" class="dugme birincil"><span data-i18n="s2HubCta1">${t('s2HubCta1')}</span>${ok}</a>
            <a href="/store/" class="dugme ikincil" data-i18n="s2HubCta2">${t('s2HubCta2')}</a>
          </div>
          <div class="not">${i('s2HubNot1')}${i('s2HubNot2')}${i('s2HubNot3')}</div>
        </div>
        ${sahne([`${k}assets/clean-capture/1-full-page.jpg`, 'Clean Capture'], [`${k}assets/zen-cinema/v110-{dil}-1-sinema.jpg`, 'Zen Cinema'], `<img src="${k}assets/logos/yt_accelerator.png" width="40" height="40" alt=""><img src="${k}assets/logos/clean_capture.png" width="40" height="40" alt="">`, false, true)}
      </div>
    </section>

    <section class="bolum" id="eklentiler">
      <div class="kap">
        <div class="bolum-bas" data-belir>
          <span class="etiket" data-i18n="s2UrunlerEtiket">${t('s2UrunlerEtiket')}</span>
          ${i('s2UrunlerBaslik', 'h2')}
          ${i('s2UrunlerAlt', 'p')}
        </div>

        <div class="urun-satir" data-belir>
          <div class="urun-metin">
            <div class="urun-kimlik"><img src="${k}assets/logos/yt_accelerator.png" alt="" width="56" height="56"><div><div class="ad">Zen Cinema Pro</div><div class="alt"><span data-i18n="s2ZenTag">${t('s2ZenTag')}</span></div></div></div>
            ${i('s2ZenOzet', 'p')}
            ${tikli(['s2ZenL1', 's2ZenL2', 's2ZenL3', 's2ZenL4'])}
            <div class="fiyat-satir">
              <div><div class="fiyat" data-urun="yt_accelerator" data-urun-alan="fiyat">${fiyat('yt_accelerator')}</div><div class="fiyat-not" data-i18n="s2OmurBoyu">${t('s2OmurBoyu')}</div></div>
              <a href="/store/zen-cinema-pro/" class="dugme ikincil kucuk"><span data-i18n="s2Incele">${t('s2Incele')}</span>${ok}</a>
              <button onclick="openCheckoutModal('yt_accelerator')" class="dugme birincil kucuk" data-i18n="s2SatinAl">${t('s2SatinAl')}</button>
            </div>
          </div>
          <a href="/store/zen-cinema-pro/" class="cerceve"><img data-dil-src="${k}assets/zen-cinema/v110-{dil}-2-not.jpg" src="${k}assets/zen-cinema/v110-tr-2-not.jpg" alt="Zen Cinema" width="1280" height="800" loading="lazy" decoding="async"></a>
        </div>

        <div class="urun-satir ters" data-belir>
          <div class="urun-metin">
            <div class="urun-kimlik"><img src="${k}assets/logos/clean_capture.png" alt="" width="56" height="56"><div><div class="ad">Clean Capture Pro</div><div class="alt"><span data-i18n="s2CcTag">${t('s2CcTag')}</span></div></div></div>
            ${i('s2CcOzet', 'p')}
            ${tikli(['s2CcL1', 's2CcL2', 's2CcL3', 's2CcL4'], true)}
            <div class="fiyat-satir">
              <div><div class="fiyat" data-urun="clean_capture" data-urun-alan="fiyat">${fiyat('clean_capture')}</div><div class="fiyat-not" data-i18n="s2OmurBoyu">${t('s2OmurBoyu')}</div></div>
              <a href="/store/screen-pdf-capture/" class="dugme ikincil kucuk"><span data-i18n="s2Incele">${t('s2Incele')}</span>${ok}</a>
              <button onclick="openCheckoutModal('clean_capture')" class="dugme birincil kucuk" data-i18n="s2SatinAl">${t('s2SatinAl')}</button>
            </div>
          </div>
          <a href="/store/screen-pdf-capture/" class="cerceve"><img src="${k}assets/clean-capture/3-editor.jpg" alt="Clean Capture" width="1280" height="800" loading="lazy" decoding="async"></a>
        </div>

        <div class="paket" data-belir>
          <div class="ikili"><img src="${k}assets/logos/yt_accelerator.png" alt="" width="52" height="52"><img src="${k}assets/logos/clean_capture.png" alt="" width="52" height="52"></div>
          <div>${i('s2PaketBaslik', 'h3')}${i('s2PaketAlt', 'p')}</div>
          <div class="sag"><div class="fiyat" data-urun="bundle_suite" data-urun-alan="fiyat">${fiyat('bundle_suite')}</div><button onclick="openCheckoutModal('bundle_suite')" class="dugme birincil"><span data-i18n="s2PaketCta">${t('s2PaketCta')}</span>${ok}</button></div>
        </div>
      </div>
    </section>

    <section class="bolum cizgili">
      <div class="kap">
        <div class="bolum-bas" data-belir>
          <span class="etiket" data-i18n="s2IlkeEtiket">${t('s2IlkeEtiket')}</span>
          ${i('s2IlkeBaslik', 'h2')}
        </div>
        <div class="izgara uc">
          ${kartIkon(IKON.cihaz, 's2Ilke1B', 's2Ilke1M')}
          ${kartIkon(IKON.kalkan, 's2Ilke2B', 's2Ilke2M')}
          ${kartIkon(IKON.kilit, 's2Ilke3B', 's2Ilke3M')}
        </div>
      </div>
    </section>
${LISANS}
  </main>
` + son();
}

// ---------------- Mağaza ----------------
function magaza() {
  const k = '/store/';
  const kart = ({ slug, logo, ad, tag, ozet, ozellikler, detay, featured }) => `
        <div class="product-card${featured ? ' featured' : ''}" data-belir>
          ${featured ? `<div class="badge-featured" data-i18n="s2EnIyi">${t('s2EnIyi')}</div>` : ''}
          <div class="card-logo${logo.length > 1 ? ' card-logo-paket' : ''}">${logo.map((l) => `<img src="${k}assets/logos/${l}.png" alt="" width="58" height="58" decoding="async">`).join('')}</div>
          <h3 class="card-title">${ad}</h3>
          ${i(tag, 'div', 'class="card-tagline"').replace(`<div data-i18n="${tag}" class="card-tagline">`, `<div class="card-tagline" data-i18n="${tag}">`)}
          ${urun[slug].surum ? `<div class="card-meta"><span class="meta-pill" data-urun="${slug}" data-urun-alan="surum">${surum(slug)}</span><span class="meta-pill" data-urun="${slug}" data-urun-alan="guncelleme">${tarih(slug)}</span></div>` : ''}
          <p class="card-desc" data-i18n="${ozet}">${t(ozet)}</p>
          <ul class="feature-list">${ozellikler.map((o) => `<li data-i18n="${o}">${t(o)}</li>`).join('')}</ul>
          <div class="price-box">
            <div><div class="price-amount" data-urun="${slug}" data-urun-alan="fiyat">${fiyat(slug)}</div><div class="price-period" data-i18n="${featured ? 's2PaketFiyatNot' : 's2OmurBoyu'}">${t(featured ? 's2PaketFiyatNot' : 's2OmurBoyu')}</div></div>
            ${sepetDugme(slug)}
          </div>
          <div class="card-actions">
            <button onclick="openCheckoutModal('${slug}')" class="btn-primary" data-i18n="s2SatinAl">${t('s2SatinAl')}</button>
            ${detay ? `<a href="${detay}" class="btn-secondary" data-i18n="s2Incele">${t('s2Incele')}</a>` : ''}
          </div>
        </div>`;
  const satir = (key, u, p) => `<tr><td data-i18n="${key}">${t(key)}</td>${[u, p].map((x) => x === true ? '<td class="var">✓</td>' : x === false ? '<td class="yok">—</td>' : `<td${x.pro ? ' class="pro"' : ''} data-i18n="${x.k}">${t(x.k)}</td>`).join('')}</tr>`;
  return bas({ baslik: 'Mağaza — Anıl Aksu Studio', aciklama: 'Zen Cinema Pro ve Clean Capture Pro ömür boyu lisansları. Ödeme Polar üzerinden, üyelik gerekmez.', k, aktif: 'magaza' }) + `
  <main>
    <section class="kahraman orta">
      <div class="kap">
        <div>
          <span class="etiket" data-i18n="s2MagEtiket">${t('s2MagEtiket')}</span>
          ${i('s2MagBaslik', 'h1')}
          ${i('s2MagAlt', 'p', 'class="giris"')}
          <div class="not">${i('s2HubNot1')}${i('s2HubNot2')}${i('s2HubNot3')}</div>
        </div>
      </div>
    </section>

    <section class="bolum" style="padding-top: 0;">
      <div class="kap">
        <div class="grid-3">
        <!-- GEN:PRODUCTS:START -->${kart({ slug: 'yt_accelerator', logo: ['yt_accelerator'], ad: 'Zen Cinema Pro', tag: 's2ZenTag', ozet: 's2ZenOzet', ozellikler: ['s2ZenK1', 's2ZenK2', 's2ZenK3', 's2ZenK4', 's2ZenK5'], detay: '/store/zen-cinema-pro/' })}${kart({ slug: 'clean_capture', logo: ['clean_capture'], ad: 'Clean Capture Pro', tag: 's2CcTag', ozet: 's2CcOzet', ozellikler: ['s2CcK1', 's2CcK2', 's2CcK3', 's2CcK4', 's2CcK5'], detay: '/store/screen-pdf-capture/' })}${kart({ slug: 'bundle_suite', logo: ['yt_accelerator', 'clean_capture'], ad: 'Zen Cinema + Clean Capture', tag: 's2PaketTag', ozet: 's2PaketAlt', ozellikler: ['s2PaketK1', 's2PaketK2', 's2PaketK3', 's2PaketK4'], featured: true })}
        <!-- GEN:PRODUCTS:END -->
        </div>
      </div>
    </section>

    <section class="bolum cizgili">
      <div class="dar">
        <div class="bolum-bas orta" data-belir>
          <span class="etiket" data-i18n="s2KarsEtiket">${t('s2KarsEtiket')}</span>
          ${i('s2KarsBaslik', 'h2')}
        </div>
        <div class="tablo-kap" data-belir>
          <table class="tablo">
            <thead><tr><th data-i18n="s2KarsOzellik">${t('s2KarsOzellik')}</th><th data-i18n="s2Ucretsiz">${t('s2Ucretsiz')}</th><th data-i18n="s2Pro">${t('s2Pro')}</th></tr></thead>
            <tbody>
              <tr class="grup"><td colspan="3">Zen Cinema</td></tr>
              ${satir('s2KZ1', true, true)}
              ${satir('s2KZ2', { k: 's2UcVideo' }, { k: 's2Sinirsiz', pro: true })}
              ${satir('s2KZ3', false, true)}
              <tr class="grup"><td colspan="3">Clean Capture</td></tr>
              ${satir('s2KC1', true, true)}
              ${satir('s2KC2', true, true)}
              ${satir('s2KC3', true, true)}
              ${satir('s2KC4', false, true)}
              ${satir('s2KC5', false, true)}
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="bolum cizgili">
      <div class="dar">
        <div class="bolum-bas orta" data-belir>
          <span class="etiket" data-i18n="s2SssEtiket">${t('s2SssEtiket')}</span>
          ${i('s2SssBaslik', 'h2')}
        </div>
        <div class="sss" data-belir>
          <details open><summary data-i18n="s2S1">${t('s2S1')}</summary><p data-i18n="s2C1">${t('s2C1')}</p></details>
          <details><summary data-i18n="faqQ2">${t('faqQ2')}</summary><p data-i18n="s2C2">${t('s2C2')}</p></details>
          <details><summary data-i18n="s2S6">${t('s2S6')}</summary><p data-i18n="s2C6">${t('s2C6')}</p></details>
          <details><summary data-i18n="s2S3">${t('s2S3')}</summary><p data-i18n="s2C3">${t('s2C3')}</p></details>
          <details><summary data-i18n="s2S4">${t('s2S4')}</summary><p data-i18n="s2C4">${t('s2C4')}</p></details>
          <details><summary data-i18n="faqQ5">${t('faqQ5')}</summary><p data-i18n="faqA5">${t('faqA5')}</p></details>
        </div>
      </div>
    </section>

${LISANS}
  </main>
` + son();
}

// ---------------- Zen Cinema ----------------
function zen() {
  const k = '/store/';
  const g = (n, ad, key, genis) => `<figure${genis ? ' class="genis"' : ''} data-belir><img data-dil-src="${k}assets/zen-cinema/v110-{dil}-${n}-${ad}.jpg" src="${k}assets/zen-cinema/v110-tr-${n}-${ad}.jpg" alt="${t(key)}" width="1280" height="800" loading="lazy" decoding="async"><figcaption data-i18n="${key}">${t(key)}</figcaption></figure>`;
  const Z = cws('yt_accelerator');
  return bas({ baslik: 'Zen Cinema — YouTube için sinema görünümü ve video defteri', aciklama: 'YouTube\'u sayfa içinde sakin bir sinemaya çevirir; saniyeye bağlı not, kare ve altyazı satırını bir deftere kaydeder, o anı anan yorumları gösterir.', k, aktif: 'zen' }) + `
  <main>
    <section class="kahraman">
      <div class="kap">
        <div>
          <img class="urun-kahraman-simge" src="${k}assets/logos/yt_accelerator.png" alt="Zen Cinema" width="84" height="84">
          <span class="etiket" data-i18n="s2zEtiket">${t('s2zEtiket')}</span>
          ${i('s2zBaslik', 'h1')}
          ${i('s2zGiris', 'p', 'class="giris"')}
          <div class="eylemler">
            <button onclick="openCheckoutModal('yt_accelerator')" class="dugme birincil"><span data-i18n="s2SatinAl">${t('s2SatinAl')}</span> · <b class="dugme-fiyat" data-urun="yt_accelerator" data-urun-alan="fiyat">${fiyat('yt_accelerator')}</b></button>
            ${kur('yt_accelerator', 'ikincil')}
          </div>
          <div class="not">${i('s2HubNot3')}${i('s2HubNot2')}${i('s2zNot3')}</div>
        </div>
        ${sahne([`${k}assets/zen-cinema/v110-{dil}-3-defter-paneli.jpg`, 'Zen Cinema'], [`${k}assets/zen-cinema/v110-{dil}-1-sinema.jpg`, 'Zen Cinema'], '<kbd>Alt</kbd><kbd>C</kbd>', false, true)}
      </div>
    </section>

    <section class="bolum cizgili">
      <div class="kap">
        <div class="bolum-bas" data-belir>
          <span class="etiket" data-i18n="s2zHareketEtiket">${t('s2zHareketEtiket')}</span>
          ${i('s2zHareketBaslik', 'h2')}
          ${i('s2zHareketAlt', 'p')}
        </div>
        <div class="izgara uc">
          ${kartIkon(IKON.sinema, 's2zH1B', 's2zH1M', kisayol('Alt', 'C'))}
          ${kartIkon(IKON.not, 's2zH2B', 's2zH2M', kisayol('Alt', 'N'))}
          ${kartIkon(IKON.kare, 's2zH3B', 's2zH3M', kisayol('Alt', 'S'))}
          ${kartIkon(IKON.altyazi, 's2zH4B', 's2zH4M', kisayol('Alt', 'T'))}
          ${kartIkon(IKON.defter, 's2zH5B', 's2zH5M', `<div class="kisayol"><span class="hap" data-i18n="s2zDugme">${t('s2zDugme')}</span></div>`)}
          ${kartIkon(IKON.yorum, 's2zH6B', 's2zH6M', `<div class="kisayol"><span class="hap" data-i18n="s2zSekme">${t('s2zSekme')}</span></div>`)}
        </div>
      </div>
    </section>

    <section class="bolum cizgili">
      <div class="kap">
        <div class="bolum-bas" data-belir>
          <span class="etiket" data-i18n="s2zGaleriEtiket">${t('s2zGaleriEtiket')}</span>
          ${i('s2zGaleriBaslik', 'h2')}
        </div>
        <div class="galeri">
          ${g(1, 'sinema', 's2zG1', true)}
          ${g(2, 'not', 's2zG2')}
          ${g(3, 'defter-paneli', 's2zG3')}
          ${g(4, 'anlar', 's2zG4')}
          ${g(5, 'defter-sayfasi', 's2zG5')}
        </div>
      </div>
    </section>

    <section class="bolum cizgili">
      <div class="kap">
        <div class="bolum-bas orta" data-belir>
          <span class="etiket" data-i18n="s2zPlanEtiket">${t('s2zPlanEtiket')}</span>
          ${i('s2zPlanBaslik', 'h2')}
        </div>
        <div class="izgara iki" style="max-width: 900px; margin-inline: auto;">
          <article class="kart" data-belir>
            ${i('s2Ucretsiz', 'h3')}
            <div class="fiyat" style="margin: 6px 0 4px;">$0</div>
            ${tikli(['s2zU1', 's2zU2', 's2zU3'])}
            ${kur('yt_accelerator', 'ikincil', false, 'width: 100%;')}
          </article>
          <article class="kart" data-belir style="border-color: rgba(217,168,100,.4);">
            ${i('s2Pro', 'h3')}
            <div class="fiyat" style="margin: 6px 0 4px;" data-urun="yt_accelerator" data-urun-alan="fiyat">${fiyat('yt_accelerator')}</div>
            ${tikli(['s2zP1', 's2zP2', 's2zP3', 's2zP4'])}
            <div style="display: flex; gap: 8px;"><button onclick="openCheckoutModal('yt_accelerator')" class="dugme birincil" style="flex: 1;" data-i18n="s2SatinAl">${t('s2SatinAl')}</button>${sepetDugme('yt_accelerator')}</div>
          </article>
        </div>
      </div>
    </section>

    <section class="bolum cizgili">
      <div class="kap">
        <div class="bolum-bas" data-belir>
          <span class="etiket" data-i18n="s2zSpecEtiket">${t('s2zSpecEtiket')}</span>
          ${i('s2zSpecBaslik', 'h2')}
        </div>
        <dl class="ozellik-listesi" data-belir>
          ${[1, 2, 3, 4, 5, 6].map((n) => `<div><dt data-i18n="s2zS${n}">${t('s2zS' + n)}</dt><dd data-i18n="s2zS${n}V">${t('s2zS' + n + 'V')}</dd></div>`).join('\n          ')}
          <div><dt data-i18n="s2zS7">${t('s2zS7')}</dt><dd>${urun.yt_accelerator.surum
            ? `<span data-urun="yt_accelerator" data-urun-alan="surum">${surum('yt_accelerator')}</span> · <span data-urun="yt_accelerator" data-urun-alan="guncelleme">${tarih('yt_accelerator')}</span>`
            : `<span data-i18n="s2CwsInceleme">${t('s2CwsInceleme')}</span>`}</dd></div>
        </dl>
      </div>
    </section>

    <section class="bolum cizgili" id="kurulum">
      <div class="dar">
        <div class="bolum-bas orta" data-belir>
          <span class="etiket" data-i18n="s2zKurEtiket">${t('s2zKurEtiket')}</span>
          ${i('s2KurBaslik', 'h2')}
          ${i('s2zKurAlt', 'p')}
        </div>
        <div class="kart" data-belir style="padding: clamp(24px, 4vw, 40px);">
          <div style="text-align: center; margin-bottom: 22px;">${Z.yayinda
            ? `<a href="${Z.url}" target="_blank" rel="noopener" class="dugme birincil">${IKON.indir}<span data-i18n="s2cKur">${t('s2cKur')}</span></a>`
            : `<span class="dugme birincil inceleme" aria-disabled="true"><span data-i18n="s2CwsInceleme">${t('s2CwsInceleme')}</span></span>${i('s2zKurBekle', 'p', 'class="inceleme-not"')}`}</div>
          <ol class="tikli" style="list-style: none;">${[1, 2, 3].map((n) => `<li data-i18n="s2KurA${n}">${t('s2KurA' + n)}</li>`).join('')}</ol>
        </div>
      </div>
    </section>

    <section class="bolum">
      <div class="kap">
        <div class="son-cagri" data-belir>
          ${i('s2zSonBaslik', 'h2')}
          ${i('s2zSonAlt', 'p')}
          <div class="eylemler">
            <button onclick="openCheckoutModal('yt_accelerator')" class="dugme birincil"><span data-i18n="s2SatinAl">${t('s2SatinAl')}</span>${ok}</button>
            ${kur('yt_accelerator', 'ikincil', false)}
          </div>
        </div>
      </div>
    </section>
  </main>
` + son();
}

// ---------------- Clean Capture ----------------
function cc() {
  const k = '/store/';
  const CWS = cws('clean_capture').url;
  const g = (dosya, key, genis) => `<figure${genis ? ' class="genis"' : ''} data-belir><img src="${k}assets/clean-capture/${dosya}.jpg" alt="${t(key)}" width="1280" height="800" loading="lazy" decoding="async"><figcaption data-i18n="${key}">${t(key)}</figcaption></figure>`;
  const izin = [['activeTab', 's2cIz1'], ['scripting', 's2cIz2'], ['debugger', 's2cIz3'], ['downloads', 's2cIz4'], ['offscreen', 's2cIz5'], ['storage', 's2cIz6']];
  return bas({ baslik: 'Clean Capture — tam sayfa ekran görüntüsü ve PDF', aciklama: 'Web sayfalarını tek parça yakalar; PNG, JPEG ya da çok sayfalı PDF olarak kaydeder. Yakalama tamamen tarayıcıda olur.', k, aktif: 'cc' }) + `
  <main>
    <section class="kahraman">
      <div class="kap">
        <div>
          <img class="urun-kahraman-simge" src="${k}assets/logos/clean_capture.png" alt="Clean Capture" width="84" height="84">
          <span class="etiket buz" data-i18n="s2cEtiket">${t('s2cEtiket')}</span>
          ${i('s2cBaslik', 'h1')}
          ${i('s2cGiris', 'p', 'class="giris"')}
          <div class="eylemler">
            <a href="${CWS}" target="_blank" rel="noopener" class="dugme birincil">${IKON.indir}<span data-i18n="s2cKur">${t('s2cKur')}</span></a>
            <button onclick="openCheckoutModal('clean_capture')" class="dugme ikincil"><span>Pro</span> · <b class="dugme-fiyat" data-urun="clean_capture" data-urun-alan="fiyat">${fiyat('clean_capture')}</b></button>
          </div>
          <div class="not">${i('s2cNot1')}${i('s2HubNot3')}${i('s2zNot3')}</div>
        </div>
        ${sahne([`${k}assets/clean-capture/3-editor.jpg`, 'Clean Capture'], [`${k}assets/clean-capture/1-full-page.jpg`, 'Clean Capture'], '', true)}
      </div>
    </section>

    <section class="bolum cizgili">
      <div class="kap">
        <div class="bolum-bas" data-belir>
          <span class="etiket buz" data-i18n="s2cOzEtiket">${t('s2cOzEtiket')}</span>
          ${i('s2cOzBaslik', 'h2')}
          ${i('s2cOzAlt', 'p')}
        </div>
        <div class="izgara uc">
          ${kartIkon(IKON.tamsayfa, 's2cO1B', 's2cO1M', '', true)}
          ${kartIkon(IKON.ekran, 's2cO2B', 's2cO2M', '', true)}
          ${kartIkon(IKON.bolge, 's2cO3B', 's2cO3M', '', true)}
          ${kartIkon(IKON.hedef, 's2cO4B', 's2cO4M', '<div class="kisayol"><span class="hap">Pro</span></div>', true)}
          ${kartIkon(IKON.pdf, 's2cO5B', 's2cO5M', '<div class="kisayol"><span class="hap">Pro</span></div>', true)}
          ${kartIkon(IKON.kalem, 's2cO6B', 's2cO6M', '', true)}
        </div>
      </div>
    </section>

    <section class="bolum cizgili">
      <div class="kap">
        <div class="galeri">
          ${g('1-full-page', 's2cG1', true)}
          ${g('2-pro', 's2cG2')}
          ${g('3-editor', 's2cG3')}
          ${g('4-blur', 's2cG4', true)}
        </div>
      </div>
    </section>

    <section class="bolum cizgili">
      <div class="kap">
        <div class="bolum-bas orta" data-belir>
          <span class="etiket buz" data-i18n="s2zPlanEtiket">${t('s2zPlanEtiket')}</span>
          ${i('s2zPlanBaslik', 'h2')}
        </div>
        <div class="izgara iki" style="max-width: 900px; margin-inline: auto;">
          <article class="kart" data-belir>
            ${i('s2Ucretsiz', 'h3')}
            <div class="fiyat" style="margin: 6px 0 4px;">$0</div>
            ${tikli(['s2cU1', 's2cU2', 's2cU3', 's2zU3'], true)}
            <a href="${CWS}" target="_blank" rel="noopener" class="dugme ikincil" style="width: 100%;" data-i18n="s2cKur">${t('s2cKur')}</a>
          </article>
          <article class="kart" data-belir style="border-color: rgba(142,197,232,.4);">
            ${i('s2Pro', 'h3')}
            <div class="fiyat" style="margin: 6px 0 4px;" data-urun="clean_capture" data-urun-alan="fiyat">${fiyat('clean_capture')}</div>
            ${tikli(['s2cP1', 's2cP2', 's2zP4'], true)}
            <div style="display: flex; gap: 8px;"><button onclick="openCheckoutModal('clean_capture')" class="dugme birincil" style="flex: 1;" data-i18n="s2SatinAl">${t('s2SatinAl')}</button>${sepetDugme('clean_capture')}</div>
          </article>
        </div>
      </div>
    </section>

    <section class="bolum cizgili">
      <div class="kap">
        <div class="bolum-bas" data-belir>
          <span class="etiket buz" data-i18n="s2zSpecEtiket">${t('s2zSpecEtiket')}</span>
          ${i('s2cIzinBaslik', 'h2')}
          ${i('s2Ilke1M', 'p')}
        </div>
        <dl class="ozellik-listesi" data-belir>
          ${izin.map(([ad, key]) => `<div><dt><code>${ad}</code></dt><dd data-i18n="${key}">${t(key)}</dd></div>`).join('\n          ')}
          <div><dt data-i18n="s2zS7">${t('s2zS7')}</dt><dd><span data-urun="clean_capture" data-urun-alan="surum">${surum('clean_capture')}</span> · <span data-urun="clean_capture" data-urun-alan="guncelleme">${tarih('clean_capture')}</span></dd></div>
        </dl>
      </div>
    </section>

    <section class="bolum">
      <div class="kap">
        <div class="son-cagri" data-belir style="border-color: rgba(142,197,232,.3);">
          ${i('s2cSonBaslik', 'h2')}
          ${i('s2cSonAlt', 'p')}
          <div class="eylemler">
            <a href="${CWS}" target="_blank" rel="noopener" class="dugme birincil"><span data-i18n="s2cKur">${t('s2cKur')}</span>${ok}</a>
            <button onclick="openCheckoutModal('clean_capture')" class="dugme ikincil" data-i18n="s2SatinAl">${t('s2SatinAl')}</button>
          </div>
        </div>
      </div>
    </section>
  </main>
` + son();
}

// ---------------- Yasal sayfalar: gövde eski dosyadan alınır, satır içi stiller temizlenir ----------------
// Yasal gövde tek kaynaktan: D:\extension\legal\*.html (YAYIN-SOZLESMESI.md). Burada yalnız sayfa kabuğu eklenir, metin yamalanmaz.
function yasal(kaynak, baslik, k) {
  let govde = kaynak.replace(/<!--[\s\S]*?-->/g, '').trim();
  if (!govde.startsWith('<h1') || !govde.includes('yasal-govde')) throw new Error('yasal kaynak biçimi beklenen gibi değil');
  govde = govde.replace('<h1', '<h1 style="font-size: clamp(34px, 4.6vw, 54px); margin-bottom: 10px;"');
  return bas({ baslik, aciklama: baslik + ' — Anıl Aksu Studio', k, aktif: '' }) + `
  <main class="bolum" style="padding-top: clamp(40px, 6vw, 72px);">
    <div class="dar">
      <a href="/store/" class="fiyat-not" data-i18n="s2GeriMagaza">${t('s2GeriMagaza')}</a>
      <div style="margin-top: 22px;">
${govde}
      </div>
      </div>
    </div>
  </main>
` + son();
}

const CIKTI = {
  'index.html': anaSayfa(),
  'store.html': magaza(),
  'zen-cinema-pro/index.html': zen(),
  'screen-pdf-capture/index.html': cc()
};
// Yasal sayfalar: tek kaynak D:\extension\legal (gizlilik.html, kosullar.html).
const YASAL = process.env.YASAL_KAYNAK || 'D:\\extension\\legal';
for (const [y, b, dosya] of [['privacy/index.html', 'Gizlilik Politikası', 'gizlilik.html'], ['terms/index.html', 'Kullanım ve Satış Koşulları', 'kosullar.html'], ['privacy.html', 'Gizlilik Politikası', 'gizlilik.html'], ['terms.html', 'Kullanım ve Satış Koşulları', 'kosullar.html']]) {
  CIKTI[y] = yasal(fs.readFileSync(path.join(YASAL, dosya), 'utf8'), b, '/store/');
}
for (const [y, h] of Object.entries(CIKTI)) {
  fs.writeFileSync(path.join(KOK, y), h, 'utf8');
  console.log(`${y.padEnd(32)} ${(h.length / 1024).toFixed(1)} KB`);
}
