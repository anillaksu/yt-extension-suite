// Sayfaların ilk (statik) metnini i18n.js'teki Türkçe metinle eşitler.
// Neden: i18n.js açılışta [data-i18n] öğelerini innerHTML ile yeniden yazar; statik metin farklıysa
// sayfa yüklenirken yazılar ve düğme genişlikleri sıçrar (layout shift).
// Kullanım: node araclar/metin-esitle.mjs [--kontrol]   (--kontrol: yazmaz, fark varsa çıkış 1)
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const SAYFALAR = ["index.html", "store.html", "zen-cinema-pro/index.html", "screen-pdf-capture/index.html", "privacy/index.html", "terms/index.html"];

export function turkceSozluk() {
  const kod = readFileSync(path.join(KOK, "i18n.js"), "utf8") + "\n;globalThis.__T = TRANSLATIONS;";
  const ortam = { localStorage: { getItem: () => null, setItem() {} }, document: { addEventListener() {} } };
  vm.runInNewContext(kod, ortam, { filename: "i18n.js" });
  return ortam.__T.tr;
}

// <etiket ... data-i18n="anahtar" ...>içerik</etiket> — içerikte aynı etiket iç içe ise atlanır (güvenli değil).
const OGE = /<([a-zA-Z][a-zA-Z0-9]*)(\s[^>]*?\bdata-i18n="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/g;

export function esitle(html, sozluk) {
  let degisen = 0;
  const atlanan = [];
  const yeni = html.replace(OGE, (tum, etiket, nitelik, anahtar, ic) => {
    const hedef = sozluk[anahtar];
    if (hedef === undefined) return tum;
    if (new RegExp(`<${etiket}[\\s>]`, "i").test(ic)) { atlanan.push(anahtar); return tum; }
    if (ic.trim() === hedef.trim()) return tum;
    degisen++;
    return `<${etiket}${nitelik}>${hedef}</${etiket}>`;
  });
  return { yeni, degisen, atlanan };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const kontrol = process.argv.includes("--kontrol");
  const sozluk = turkceSozluk();
  let toplam = 0;
  for (const s of SAYFALAR) {
    const yol = path.join(KOK, s);
    const html = readFileSync(yol, "utf8");
    const { yeni, degisen, atlanan } = esitle(html, sozluk);
    toplam += degisen;
    console.log(`${s}: ${degisen} metin eşitlendi${atlanan.length ? `, atlanan (iç içe): ${atlanan.join(", ")}` : ""}`);
    if (!kontrol && degisen) writeFileSync(yol, yeni, "utf8");
  }
  console.log(`toplam: ${toplam}${kontrol ? " (yazılmadı)" : ""}`);
  if (kontrol && toplam) process.exitCode = 1;
}
