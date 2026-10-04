// Mağazayı ürünlerin gerçek durumuyla eşitler (tek kaynak → tüm yüzeyler).
//   Kaynaklar : catalog/registry.json (fiyat, ad) + her eklentinin kaynak klasörü (manifest sürümü, son değişiklik, logo)
//   Hedefler  : urunler.json, assets/logos/*.png, catalog.js fiyatları, i18n.js fiyat metinleri (4 dil),
//               sayfalardaki [data-urun][data-urun-alan] alanları, statik metin = i18n tr (metin-esitle)
// Kullanım:
//   node araclar/urun-senkron.mjs            → yerelde günceller, ne değiştiğini yazar
//   node araclar/urun-senkron.mjs --kontrol  → hiçbir şey yazmaz; fark varsa çıkış 1
//   node araclar/urun-senkron.mjs --yayinla  → günceller; değişiklik varsa yalnız bu dosyaları commit + push (CANLIYA ÇIKAR)
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, copyFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { SAYFALAR, turkceSozluk, esitle } from "./metin-esitle.mjs";

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KAYIT = process.env.URUN_KAYIT || "D:/CHROME_STORE_EXTENSIONS_PROJECTS/catalog/registry.json";

// Her ürünün GERÇEK kaynak klasörü ve fiyatı içeren i18n anahtarları.
// Zen Cinema Pro: sinema modu yalnız Desktop\extension'da var (D:\...\yt-player-accelerator-pro eski kopya).
const URUNLER = {
  yt_accelerator: { ad: "Zen Cinema Pro", dizin: process.env.KAYNAK_ZEN || "C:/Users/anil/Desktop/extension", fiyatAnahtarlari: ["p1Price", "ytBtnBuy"] },
  clean_capture: { ad: "Clean Full Page & PDF Capture Pro", dizin: process.env.KAYNAK_CAPTURE || "D:/CHROME_STORE_EXTENSIONS_PROJECTS/clean-full-page-pdf-capture/extension", fiyatAnahtarlari: ["p2Price", "capBtnBuy"] },
  bundle_suite: { ad: "Ultimate Extension Suite Bundle Pass", dizin: null, fiyatAnahtarlari: ["bundlePrice"] },
};

const arg = new Set(process.argv.slice(2));
const KONTROL = arg.has("--kontrol");
const YAYINLA = arg.has("--yayinla");
const degisen = new Set();

function oku(yol) { return readFileSync(path.join(KOK, yol), "utf8"); }
function yaz(yol, icerik) {
  const tam = path.join(KOK, yol);
  if (existsSync(tam) && readFileSync(tam, "utf8") === icerik) return;
  degisen.add(yol.replace(/\\/g, "/"));
  if (!KONTROL) { mkdirSync(path.dirname(tam), { recursive: true }); writeFileSync(tam, icerik, "utf8"); }
}
const ozet = (b) => createHash("sha256").update(b).digest("hex");

// Kaynak klasördeki en yeni dosya tarihi (gizli klasörler ve node_modules hariç)
function sonDegisiklik(dizin) {
  let en = 0;
  (function gez(d) {
    for (const ad of readdirSync(d)) {
      if (ad.startsWith(".") || ad === "node_modules") continue;
      const y = path.join(d, ad);
      const s = statSync(y);
      if (s.isDirectory()) gez(y);
      else if (s.mtimeMs > en) en = s.mtimeMs;
    }
  })(dizin);
  return new Date(en).toISOString().slice(0, 10);
}

const fiyatMetni = (f) => `₺${f.try} / $${f.usd.toFixed(2)}`;
const FIYAT_KALIBI = /₺\s?[\d.,]+\s*\/\s*\$\s?[\d.,]+/;

// 1) Gerçeği topla
const kayit = JSON.parse(readFileSync(KAYIT, "utf8").replace(/^\uFEFF/, ""));
const veri = { kaynak: "catalog/registry.json + eklenti manifestleri", urunler: {} };
for (const [slug, u] of Object.entries(URUNLER)) {
  const k = kayit.products.find((p) => p.slug === slug);
  if (!k) throw new Error(`registry'de ürün yok: ${slug}`);
  if (k.status !== "live") throw new Error(`ürün canlı değil (${k.status}): ${slug} — mağazada gösterilemez`);
  const kayitUrun = { ad: u.ad, fiyat: { try: k.price.try, usd: k.price.usd }, odeme: k.polar?.checkout_url || null };
  if (u.dizin) {
    if (!existsSync(path.join(u.dizin, "manifest.json"))) throw new Error(`kaynak bulunamadı: ${u.dizin}`);
    const m = JSON.parse(readFileSync(path.join(u.dizin, "manifest.json"), "utf8").replace(/^\uFEFF/, ""));
    kayitUrun.surum = m.version;
    kayitUrun.son_guncelleme = sonDegisiklik(u.dizin);
    const ikon = path.join(u.dizin, "icons", "icon128.png");
    if (existsSync(ikon)) {
      const hedef = `assets/logos/${slug}.png`;
      const tam = path.join(KOK, hedef);
      const yeni = readFileSync(ikon);
      if (!existsSync(tam) || ozet(readFileSync(tam)) !== ozet(yeni)) {
        degisen.add(hedef);
        if (!KONTROL) { mkdirSync(path.dirname(tam), { recursive: true }); copyFileSync(ikon, tam); }
      }
      kayitUrun.logo = hedef;
    }
  }
  veri.urunler[slug] = kayitUrun;
}

// 2) urunler.json (herkese açık özet; anahtar/kimlik içermez)
yaz("urunler.json", JSON.stringify(veri, null, 2) + "\n");

// 3) catalog.js fiyatları (sepet toplamı buradan hesaplanır)
{
  const js = oku("catalog.js");
  const bas = js.indexOf("const PRODUCTS_DB = ") + "const PRODUCTS_DB = ".length;
  const son = js.indexOf("};", bas) + 1;
  const db = JSON.parse(js.slice(bas, son));
  for (const kayitDb of Object.values(db)) {
    const v = veri.urunler[kayitDb.slug];
    if (v) { kayitDb.priceTry = v.fiyat.try; kayitDb.priceUsd = v.fiyat.usd; }
  }
  yaz("catalog.js", js.slice(0, bas) + JSON.stringify(db, null, 2) + js.slice(son));
}

// 4) i18n.js fiyat metinleri (4 dilde "₺X / $Y" kalıbı)
{
  let js = oku("i18n.js");
  for (const [slug, u] of Object.entries(URUNLER)) {
    for (const anahtar of u.fiyatAnahtarlari) {
      const satir = new RegExp(`(\\n\\s*${anahtar}:\\s*")([^"\\n]*)(")`, "g");
      js = js.replace(satir, (t, a, metin, c) => a + metin.replace(FIYAT_KALIBI, fiyatMetni(veri.urunler[slug].fiyat)) + c);
    }
  }
  yaz("i18n.js", js);
}

// 5) Sayfalardaki veri alanları + statik metni i18n tr ile eşitle
//    <x data-urun="slug" data-urun-alan="surum|guncelleme|fiyat">…</x>
const ALAN = /(<([a-z0-9]+)\b[^>]*\bdata-urun="([a-z_]+)"[^>]*\bdata-urun-alan="([a-z]+)"[^>]*>)([\s\S]*?)(<\/\2>)/g;
function alanIcerigi(v, alan) {
  if (alan === "surum") return v.surum ? `v${v.surum}` : null;
  if (alan === "guncelleme") return v.son_guncelleme ? `<time datetime="${v.son_guncelleme}">${v.son_guncelleme}</time>` : null;
  if (alan === "fiyat") return `₺${v.fiyat.try} <span class="price-usd">/ $${v.fiyat.usd.toFixed(2)}</span>`;
  return null;
}
// i18n.js 4. adımda yazıldıysa sözlük dosyadan taze okunur
for (const s of SAYFALAR) {
  let html = oku(s);
  html = html.replace(ALAN, (t, ac, etiket, slug, alan, ic, kapa) => {
    const v = veri.urunler[slug];
    const yeni = v && alanIcerigi(v, alan);
    return yeni == null ? t : ac + yeni + kapa;
  });
  if (!KONTROL) html = esitle(html, turkceSozluk()).yeni;
  yaz(s, html);
}

// 6) Rapor + isteğe bağlı yayın
for (const [slug, v] of Object.entries(veri.urunler)) {
  console.log(`${slug.padEnd(15)} ${v.surum ? "v" + v.surum : "-"}  ${v.son_guncelleme || "-"}  ${fiyatMetni(v.fiyat)}`);
}
console.log(degisen.size ? `değişen: ${[...degisen].join(", ")}` : "değişiklik yok");
if (KONTROL && degisen.size) process.exitCode = 1;

if (YAYINLA && degisen.size) {
  const git = (...a) => execFileSync("git", ["-C", KOK, ...a], { encoding: "utf8" }).trim();
  git("add", "--", ...degisen);
  // Yalnız bu dosyalar: başka hazırlanmış (staged) değişiklik varsa yayına karışmaz
  git("commit", "-q", "-m", `Ürün verisi otomatik güncellendi: ${[...degisen].join(", ")}`, "--", ...degisen);
  git("push", "-q", "origin", "HEAD");
  console.log(`yayınlandı: ${git("log", "-1", "--format=%h")}`);
}
