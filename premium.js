// Premium hareket katmanı: kaydırınca belirme, kart ışığı/eğimi, mıknatıslı düğme, ilerleme çizgisi.
// Hareket azaltılmışsa yalnız statik iyileştirmeler kalır; hiçbir içerik JS'e bağımlı değildir.
(function () {
  var azalt = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var dokunmatik = window.matchMedia("(hover: none)").matches;
  var kok = document.documentElement;
  kok.classList.add("pr-on");

  function hazir(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  hazir(function () {
    // İmza çizgisi: başlıkla alt başlık arasında
    var baslik = document.querySelector(".hero .hero-title");
    if (baslik && !document.querySelector(".pr-signature")) {
      var cizgi = document.createElement("span");
      cizgi.className = "pr-signature";
      cizgi.setAttribute("aria-hidden", "true");
      baslik.insertAdjacentElement("afterend", cizgi);
    }

    // İlerleme çizgisi + gezinme çubuğu
    var ilerleme = document.createElement("div");
    ilerleme.className = "pr-progress";
    ilerleme.setAttribute("aria-hidden", "true");
    document.body.appendChild(ilerleme);
    var nav = document.querySelector(".navbar");
    var bekliyor = false;
    function kaydirma() {
      bekliyor = false;
      var y = window.scrollY;
      var boy = document.documentElement.scrollHeight - window.innerHeight;
      ilerleme.style.setProperty("--pr-p", boy > 0 ? (y / boy).toFixed(4) : 0);
      if (nav) nav.classList.toggle("pr-scrolled", y > 24);
    }
    window.addEventListener("scroll", function () {
      if (!bekliyor) { bekliyor = true; requestAnimationFrame(kaydirma); }
    }, { passive: true });
    kaydirma();

    if (azalt || !("IntersectionObserver" in window)) return;

    // Kaydırınca belirme: bölüm başlıkları, ızgara öğeleri, kartlar
    var hedefler = document.querySelectorAll(
      ".section .container > h2, .section .container > p, .section .container > div:not(.grid-3):not(.grid-2), " +
      ".grid-3 > *, .grid-2 > *, .footer-grid > *"
    );
    var gozcu = new IntersectionObserver(function (girdiler) {
      girdiler.forEach(function (g) {
        if (g.isIntersecting) { g.target.classList.add("pr-in"); gozcu.unobserve(g.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    hedefler.forEach(function (el) {
      if (el.closest(".hero, .modal-overlay, .cart-drawer")) return;
      var kardes = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty("--pr-i", Math.min(kardes, 5));
      el.classList.add("pr-reveal");
      gozcu.observe(el);
    });

    if (dokunmatik) return;

    // Kartlar: imleç ışığı + hafif eğim (en fazla 3 derece)
    document.querySelectorAll(".product-card").forEach(function (kart) {
      kart.addEventListener("pointermove", function (e) {
        var r = kart.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;
        var y = (e.clientY - r.top) / r.height;
        kart.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
        kart.style.setProperty("--my", (y * 100).toFixed(1) + "%");
        kart.style.setProperty("--ry", ((x - 0.5) * 6).toFixed(2) + "deg");
        kart.style.setProperty("--rx", ((0.5 - y) * 6).toFixed(2) + "deg");
      });
      kart.addEventListener("pointerleave", function () {
        kart.style.setProperty("--rx", "0deg");
        kart.style.setProperty("--ry", "0deg");
      });
    });

    // Birincil düğmeler: imlece doğru en fazla 4 px çekilir
    document.querySelectorAll(".btn-primary").forEach(function (d) {
      d.addEventListener("pointermove", function (e) {
        var r = d.getBoundingClientRect();
        d.style.setProperty("--bx", ((e.clientX - r.left - r.width / 2) / r.width * 8).toFixed(1) + "px");
        d.style.setProperty("--by", ((e.clientY - r.top - r.height / 2) / r.height * 8).toFixed(1) + "px");
      });
      d.addEventListener("pointerleave", function () {
        d.style.setProperty("--bx", "0px");
        d.style.setProperty("--by", "0px");
      });
    });
  });
})();
