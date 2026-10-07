// Site etkileşim testi: sepet, ödeme penceresi, dil değişimi, mobil menü, SSS. Yerel sunucu, ağa ödeme isteği gitmez.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire('D:\\extension\\package.json');
const puppeteer = require('puppeteer-core');
const KOK = 'C:\\Users\\anil\\yt-extension-suite';
const CIKTI = path.join(process.env.TEMP, 'site-etkilesim'); fs.mkdirSync(CIKTI, { recursive: true });
const TUR = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json' };
const s = http.createServer((q, c) => {
  let u = decodeURIComponent(new URL(q.url, 'http://x').pathname);
  if (!u.startsWith('/store')) { c.writeHead(404); return c.end(); }
  u = u.slice(6) || '/';
  let p = path.join(KOK, u);
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, u === '/' ? 'store.html' : 'index.html');
  if (!fs.existsSync(p)) { c.writeHead(404); return c.end(); }
  c.writeHead(200, { 'content-type': TUR[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(c);
}).listen(0);
const URL0 = `http://127.0.0.1:${s.address().port}`;
const b = await puppeteer.launch({ executablePath: 'C:\\Users\\anil\\AppData\\Local\\ms-playwright\\chromium-1234\\chrome-win64\\chrome.exe', headless: true });
let gecti = 0, kaldi = 0;
const ok = (ad, kosul, ek = '') => { if (kosul) { gecti++; console.log('  ✓ ' + ad); } else { kaldi++; console.log('  ✗ ' + ad + (ek ? ' — ' + ek : '')); } };
const bekle = (ms) => new Promise((r) => setTimeout(r, ms));
try {
  const p = await b.newPage();
  const hatalar = [];
  p.on('pageerror', (e) => hatalar.push(e.message));
  // Ödeme isteğini dışarı çıkarmadan yakala.
  await p.setRequestInterception(true);
  const disari = [];
  p.on('request', (r) => { const u = r.url(); if (!u.startsWith(URL0) && !u.includes('fonts.g')) { disari.push(u); return r.abort(); } r.continue(); });
  await p.setViewport({ width: 1440, height: 900 });
  await p.evaluateOnNewDocument(() => { try { localStorage.clear(); localStorage.setItem('suite_lang', 'tr'); } catch (e) {} });
  await p.goto(URL0 + '/store/', { waitUntil: 'networkidle2' });

  // Sepete ekle → rozet
  await p.click('.product-card .price-cart');
  await bekle(400);
  const rozet = await p.$eval('#nav-cart-badge', (e) => ({ g: getComputedStyle(e).display !== 'none', m: e.textContent.trim() }));
  ok('sepete ekle: rozet 1 gösteriyor', rozet.g && rozet.m === '1', JSON.stringify(rozet));
  await p.click('.cart-nav-btn');
  await bekle(700);
  const cekmece = await p.$eval('#cart-drawer', (e) => ({ acik: e.classList.contains('active'), x: Math.round(e.getBoundingClientRect().left), urun: e.querySelectorAll('.cart-item').length }));
  ok('sepet çekmecesi açıldı, 1 ürün', cekmece.acik && cekmece.urun === 1 && cekmece.x < 1440, JSON.stringify(cekmece));
  await p.screenshot({ path: path.join(CIKTI, 'etk-1-sepet.png') });
  await p.click('.cart-drawer-footer .btn-primary');
  await bekle(600);
  const modal = await p.$eval('#checkout-modal', (e) => ({ acik: e.classList.contains('active'), ozet: e.querySelector('#checkout-order-summary').textContent.trim().slice(0, 60), toplam: e.querySelector('#checkout-total-amount').textContent }));
  ok('ödeme penceresi açıldı, özet ve toplam dolu', modal.acik && modal.ozet.length > 3 && /\d/.test(modal.toplam), JSON.stringify(modal));
  await p.screenshot({ path: path.join(CIKTI, 'etk-2-odeme.png') });
  await p.type('#checkout-email', 'deneme@example.com');
  ok('koşullar kutusu işaretsiz gelir (açık onay)', await p.$eval('#checkout-terms', (e) => !e.checked));
  await p.click('#checkout-terms');
  await p.click('#btn-submit-order');
  await bekle(1500);
  ok('Ödemeye geç: Polar ödeme adresine yönlendirme denendi (engellendi)', disari.some((u) => /polar\.sh/.test(u)), disari.slice(0, 3).join(' | '));
  await p.keyboard.press('Escape');

  // Dil: EN → başlık ve görsel
  await p.goto(URL0 + '/store/zen-cinema-pro/', { waitUntil: 'networkidle2' });
  await p.select('#lang-switch', 'en');
  await bekle(500);
  const en = await p.evaluate(() => ({ h1: document.querySelector('h1').textContent.trim(), img: document.querySelector('.galeri img').getAttribute('src') }));
  ok('EN: başlık İngilizce', /Learn without/.test(en.h1), en.h1);
  ok('EN: ekran görüntüleri İngilizce', /v110-en-/.test(en.img), en.img);
  await p.select('#lang-switch', 'tr');
  await bekle(300);
  const tr = await p.evaluate(() => document.querySelector('.galeri img').getAttribute('src'));
  ok('TR\'ye dönünce görseller Türkçe', /v110-tr-/.test(tr), tr);
  const bos = await p.evaluate(() => ['en', 'es', 'de'].flatMap((d) => { applyLanguage(d); return [...document.querySelectorAll('[data-i18n]')].filter((e) => !e.textContent.trim()).map((e) => d + ':' + e.dataset.i18n); }));
  ok('ES/DE/EN: boş kalan metin yok', bos.length === 0, bos.slice(0, 5).join(', '));
  await p.evaluate(() => applyLanguage('tr'));

  // Telefon: menü
  const t = await b.newPage();
  await t.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await t.goto(URL0 + '/store/index.html', { waitUntil: 'networkidle2' });
  const once = await t.$eval('.menu', (e) => getComputedStyle(e).visibility);
  await t.tap('.menu-ac');
  await bekle(500);
  const sonra = await t.$eval('.menu', (e) => ({ v: getComputedStyle(e).visibility, n: e.querySelectorAll('a').length }));
  ok('telefon: menü kapalı başlar, düğmeyle açılır', once === 'hidden' && sonra.v === 'visible' && sonra.n === 5, `${once} → ${JSON.stringify(sonra)}`);
  await t.screenshot({ path: path.join(CIKTI, 'etk-3-tel-menu.png') });
  // Telefon: SSS
  await t.goto(URL0 + '/store/', { waitUntil: 'networkidle2' });
  const sss = await t.evaluate(() => { const d = document.querySelectorAll('.sss details')[1]; d.querySelector('summary').click(); return d.open; });
  ok('SSS: soruya dokununca açılıyor', sss);
  ok('JS hatası yok', hatalar.length === 0, hatalar.join(' | '));
} catch (e) { kaldi++; console.log('✗ TEST DURDU: ' + e.message); }
await b.close(); s.close();
console.log(`\nSONUÇ: ${gecti} geçti, ${kaldi} kaldı`);
process.exit(kaldi ? 1 : 0);
