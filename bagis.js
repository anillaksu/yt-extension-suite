/**
 * bagis.js — Destek/bağış düğmelerini Polar'ın KENDİ fiyatından üretir.
 *
 * NEDEN AYRI DOSYA (ve neden çalışma anında üretiliyor):
 *   Eski hata şuydu: $5 yazan düğmeler `openCheckoutModal('clean_capture')`
 *   çağırıyordu, yani 11.99$ ürününü açıyordu. Ekranda yazan tutar ile
 *   tahsil edilen tutar ayrışıyordu (chargeback riski).
 *
 *   Burada düğmeler DOĞRUDAN kendi Polar checkout linkine gider ve etiketleri
 *   de DONATIONS_DB'den (Polar'dan üretilmiş catalog.js) okunur. Yani ekranda
 *   yazan tutar ile tahsil edilen tutar AYNI KAYNAKTAN gelir; ayrışamaz.
 *
 *   Bağış ürünleri sepete GİRMEZ: Polar'da license_keys benefit'i yoktur,
 *   lisans içermez (scripts/polar-bagis-urunleri.mjs).
 *
 * catalog.js yüklenemezse sessizce ölü düğme bırakmaz, açıklama gösterir.
 */
(function () {
  'use strict';

  function para(n) {
    return '$' + Number(n).toFixed(2).replace(/\.00$/, '');
  }

  function kutu(d, vurgu) {
    return `
        <a class="btn-${vurgu ? 'primary' : 'secondary'}"
           href="#"
           data-bagis-slug="${d.slug}"
           style="flex:1; padding:14px 8px; justify-content:center; font-size:1.02rem; font-weight:800; text-align:center;">
          <span>${vurgu ? '💎' : '☕'} ${para(d.usd)}${d.periyet ? '/ay' : ''}</span>
        </a>`;
  }

  function ciz() {
    const kap = document.getElementById('bagis-kutulari');
    if (!kap) return;

    const DB = (typeof DONATIONS_DB !== 'undefined' && DONATIONS_DB) ? DONATIONS_DB : null;
    if (!DB || !Object.keys(DB).length) {
      kap.innerHTML = `
        <p style="color:#f87171; font-size:0.92rem; text-align:center;">
          ⚠️ Destek seçenekleri şu anda yüklenemedi. Lütfen sayfayı yenileyin.
        </p>`;
      return;
    }

    const tek = ['destek_5', 'destek_10', 'destek_25'].map((s) => DB[s]).filter(Boolean);
    const aylik = ['destek_aylik_5', 'destek_aylik_10', 'destek_aylik_20'].map((s) => DB[s]).filter(Boolean);

    let html = '';

    html += `
      <div style="background: rgba(15,23,42,0.8); border:1px solid var(--border-color); border-radius:18px; padding:30px;">
        <h3 style="font-size:1.25rem; font-weight:800; color:#fff; margin-bottom:8px;" data-i18n="bagisTekTitle">☕ Tek Seferlik Destek</h3>
        <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:20px;" data-i18n="bagisTekDesc">Tek bir ödeme. Bağışınız lisans içermez.</p>
        <div style="display:flex; gap:10px;">${tek.map((d, i) => kutu(d, i === 2)).join('')}</div>
      </div>`;

    if (aylik.length) {
      html += `
      <div style="background: rgba(15,23,42,0.8); border:1px solid var(--border-color); border-radius:18px; padding:30px; position:relative;">
        <div style="position:absolute; top:-12px; right:24px; background:#00f0ff; color:#000; font-size:0.7rem; font-weight:900; padding:3px 8px; border-radius:4px;" data-i18n="bagisPopuler">En Popüler</div>
        <h3 style="font-size:1.25rem; font-weight:800; color:#fff; margin-bottom:8px;" data-i18n="bagisAylikTitle">🔁 Aylık Destek</h3>
        <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:20px;" data-i18n="bagisAylikDesc">Her ay tekrarlanan destek. İstediğiniz zaman iptal edilebilir.</p>
        <div style="display:flex; gap:10px;">${aylik.map((d, i) => kutu(d, i === 1)).join('')}</div>
      </div>`;
    }

    kap.innerHTML = `<div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(320px,1fr)); gap:24px;">${html}</div>`;

    // href'leri Polar'ın kendi verisinden bağla (etiket ile aynı kaynak).
    kap.querySelectorAll('[data-bagis-slug]').forEach((a) => {
      const d = DB[a.getAttribute('data-bagis-slug')];
      if (!d || !d.checkoutUrl) { a.remove(); return; }
      a.href = d.checkoutUrl;
      a.target = '_blank';
      a.rel = 'noopener';
      a.setAttribute('data-tutar', String(d.usd));
      if (d.periyet) a.setAttribute('data-periyet', d.periyet);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ciz);
  } else {
    ciz();
  }

  // Dil değişince yeniden çiz (etiketler data-i18n ile güncellenir).
  document.addEventListener('langchange', () => setTimeout(ciz, 0));
})();
