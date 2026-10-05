/**
 * Sepet / checkout duman testi (tarayici gerektirmez).
 * Gercek bir DOM taklidi kurar, sayfadaki <script> sirasini AYNI sirayla
 * yukler ve "Hemen Satın Al" dugmesinin gercekten urun yukleyip yuklemedigini
 * olcer. Amac: `PRODUCTS_DB is not defined` turunun geri donmedigini kanitlamak.
 *
 * Kullanim: node araclar/sepet-test.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PAGES = [
  'index.html',
  'store.html',
  'screen-pdf-capture/index.html',
  'zen-cinema-pro/index.html',
  'privacy/index.html',
  'terms/index.html',
  'privacy.html',
  'terms.html',
];

function makeDom() {
  const mem = new Map();
  const activeClasses = new Map();
  const mk = (id = '') => ({
    id,
    style: new Proxy({}, { set: () => true, get: () => '' }),
    dataset: {},
    classList: {
      add: (c) => { const s = activeClasses.get(id) || new Set(); s.add(c); activeClasses.set(id, s); },
      remove: (c) => { activeClasses.get(id)?.delete(c); },
      toggle: () => {},
      contains: (c) => !!activeClasses.get(id)?.has(c),
    },
    children: [], innerHTML: '', textContent: '', innerText: '', value: '', checked: false,
    appendChild(c) { this.children.push(c); return c; },
    focus() {}, querySelector: () => null, querySelectorAll: () => [],
    setAttribute() {}, addEventListener() {},
  });
  const nodes = new Map();
  for (const id of [
    'checkout-modal', 'checkout-order-summary', 'checkout-total-amount', 'checkout-email',
    'checkout-terms', 'btn-submit-order', 'cart-drawer-items', 'cart-drawer-subtotal',
    'cart-overlay', 'cart-drawer', 'order-success-modal',
  ]) nodes.set(id, mk(id));

  const doc = {
    title: 'test',
    getElementById: (id) => nodes.get(id) || null,
    querySelectorAll: () => [],
    querySelector: () => null,
    createElement: () => mk(),
    addEventListener() {},
    body: mk('body'),
  };
  const ls = {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => mem.set(k, String(v)),
    removeItem: (k) => mem.delete(k),
  };
  return { doc, ls, isActive: (id, c) => !!activeClasses.get(id)?.has(c) };
}

const SKIP = ['analytics.js', 'premium.js'];

function runPage(pageRel, { withCatalog, cartOverride }) {
  const html = readFileSync(join(ROOT, pageRel), 'utf8');
  const srcs = [...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map((m) => m[1]);
  const base = pageRel.includes('/') ? pageRel.slice(0, pageRel.lastIndexOf('/') + 1) : '';

  const { doc, ls, isActive } = makeDom();
  const sandbox = {
    document: doc, localStorage: ls, console,
    setTimeout: () => 0, clearTimeout: () => {},
    URLSearchParams,
    fetch: async () => { throw new Error('test: fetch yok'); },
    navigator: { clipboard: null },
    location: { _h: 'https://forfor.site/store/', pathname: '/store/', search: '' },
    history: { replaceState() {} },
    alert() {},
  };
  Object.defineProperty(sandbox.location, 'href', {
    get() { return sandbox.location._h; },
    set(v) { sandbox.location.redirected = v; },
  });
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);

  const loaded = [];
  for (const src of srcs) {
    if (SKIP.some((s) => src.includes(s))) continue;
    const isCatalog = src.includes('catalog.js');
    if (isCatalog && !withCatalog) continue;
    const rel = (base + src.split('?')[0]).replace(/^\.\.\//, '');
    try {
      const code = (src.includes('cart.js') && cartOverride)
        ? readFileSync(cartOverride, 'utf8')
        : readFileSync(join(ROOT, rel), 'utf8');
      vm.runInContext(code, sandbox, { filename: rel });
      loaded.push(rel);
    } catch (e) {
      return { pageRel, phase: 'yukleme', ok: false, detail: `${rel} -> ${e.name}: ${e.message}` };
    }
  }

  // "Hemen Satın Al" butonuna tikla
  try {
    vm.runInContext("openCheckoutModal('clean_capture')", sandbox, { filename: 'tiklama' });
  } catch (e) {
    return { pageRel, phase: 'tiklama', ok: false, detail: `${e.name}: ${e.message}`, loaded };
  }

  // let/const vm globalinde property olmadigi icin iceriden okumaliz
  const items = vm.runInContext('checkoutItems', sandbox);
  const total = doc.getElementById('checkout-total-amount').textContent;
  const summary = doc.getElementById('checkout-order-summary').innerHTML;
  const modalAktif = isActive('checkout-modal', 'active');

  const problems = [];
  if (!Array.isArray(items) || items.length !== 1) problems.push(`checkoutItems=${JSON.stringify(items)}`);
  else if (!String(items[0].checkoutUrl || '').startsWith('https://buy.polar.sh/')) problems.push(`checkoutUrl=${items[0].checkoutUrl}`);
  if (!modalAktif) problems.push('modal acilmadi');
  if (!/\d/.test(total)) problems.push(`toplam=${total}`);
  if (!summary.includes('clean_capture') && !summary.includes('299')) problems.push('ozet bos');

  return { pageRel, ok: problems.length === 0, problems, items, total, modalAktif, loaded };
}

let fail = 0;

// Orijinal (HEAD) cart.js + catalog.js YOK = Canli'deki BOZUK hal.
const HEAD_CART = join(process.env.TEMP || '/tmp', 'opencode', 'cart-HEAD.js');
const headCart = existsSync(HEAD_CART) ? HEAD_CART : null;

console.log('=== 1) ORIJINAL cart.js (HEAD) + catalog.js YOK -> hata bekleniyor ===');
if (!headCart) {
  console.log('  [ATLANDI] cart-HEAD.js bulunamadi (git show HEAD:cart.js ile olustur)');
} else {
  for (const p of PAGES) {
    const r = runPage(p, { withCatalog: false, cartOverride: headCart });
    if (/PRODUCTS_DB is not defined/.test(r.detail || '')) {
      console.log(`  [OK] ${p.padEnd(30)} -> ${r.detail.split('\n')[0].slice(0, 70)}`);
    } else {
      console.log(`  [FAIL] ${p.padEnd(30)} beklenen hata gelmedi: ${r.detail || JSON.stringify(r.problems)}`);
      fail++;
    }
  }
}

console.log('\n=== 2) catalog.js YOK + YENI cart.js -> ReferenceError OLMAZ, kullanici bilgilendirilir ===');
for (const p of PAGES) {
  const r = runPage(p, { withCatalog: false });
  if (r.ok) { fail++; console.log(`  [FAIL] ${p.padEnd(30)} beklenmedik sekilde basarili`); }
  else console.log(`  [OK] ${p.padEnd(30)} -> cokum yok, toast ile bilgilendirildi`);
}

console.log('\n=== 3) catalog.js VAR (DUZELTILMIS HAL) -> butonlar calismali ===');
for (const p of PAGES) {
  const r = runPage(p, { withCatalog: true });
  if (r.ok) {
    console.log(`  [OK] ${p.padEnd(30)} -> ${r.items[0].slug} | ${r.total} | modal=${r.modalAktif}`);
  } else {
    console.log(`  [FAIL] ${p.padEnd(30)} ${r.detail || r.problems.join('; ')}`);
    fail++;
  }
}

console.log(fail === 0 ? '\nBARYON YESIL: tum sayfalar gecti.' : `\nBARYON KIRMIZI: ${fail} hata var.`);
process.exit(fail === 0 ? 0 : 1);
