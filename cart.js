/**
 * Universal Shopping Cart, Checkout & License Delivery Engine
 * YT Extension Suite & Software Marketplace
 *
 * Backend'den tam kopuş: bu dosya artık hiçbir lisans/checkout işini
 * kendi Cloud Run backend'ine sormaz. Ödeme ve lisans teslimatı %100
 * Polar.sh üzerinden yürür (checkout linkleri + Polar'ın gönderdiği e-posta +
 * Polar'ın public customer-portal license-key validate ucu).
 *
 * Faz 2.1/2.2: ürün verisi artık burada elle yazılmıyor. Tek gerçek kaynak
 * catalog/registry.json'dır; PRODUCTS_DB ve CATALOG_ORGANIZATION_ID
 * catalog.js'ten gelir (bkz. scripts/gen/gen-catalog.js). Bu dosyanın
 * catalog.js'ten SONRA yüklendiğinden emin olun (bkz. store.html/index.html
 * script sırası).
 */

const POLAR_ORGANIZATION_ID = typeof CATALOG_ORGANIZATION_ID !== 'undefined'
  ? CATALOG_ORGANIZATION_ID
  : '450fc977-6d1a-4af9-b6b7-a3313b344595'; // catalog.js yüklenmediyse son çare
const POLAR_VALIDATE_ENDPOINT = 'https://api.polar.sh/v1/customer-portal/license-keys/validate';

function getProductName(productId) {
  const prod = PRODUCTS_DB[productId];
  if (!prod) return productId;
  if (typeof t === 'function' && prod.nameKey) {
    return t(prod.nameKey);
  }
  return prod.name || productId;
}

let cart = JSON.parse(localStorage.getItem('suite_cart') || '[]');
let currentCurrency = localStorage.getItem('suite_currency') || 'TRY';

function saveCart() {
  localStorage.setItem('suite_cart', JSON.stringify(cart));
  updateCartBadge();
  renderCartDrawer();
}

function updateCartBadge() {
  const count = cart.reduce((acc, item) => acc + item.qty, 0);
  const badges = document.querySelectorAll('.cart-badge');
  badges.forEach(b => {
    b.textContent = count;
    b.style.display = count > 0 ? 'inline-block' : 'none';
  });
}

function addToCart(productId, autoOpen = true) {
  const prod = PRODUCTS_DB[productId];
  if (!prod) return;

  const existing = cart.find(item => item.id === prod.id || item.slug === productId || item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: prod.id,
      slug: prod.slug || productId,
      icon: prod.icon,
      priceTry: prod.priceTry,
      priceUsd: prod.priceUsd,
      polarPriceId: prod.polarPriceId,
      productId: prod.productId || prod.id,
      checkoutUrl: prod.checkoutUrl,
      qty: 1
    });
  }

  saveCart();
  const name = getProductName(productId);
  showToast(`🛒 ${name}`);
  if (typeof window.trackEvent === 'function') {
    window.trackEvent('Ecommerce', 'add_to_cart', name, prod.priceTry);
  }
  if (autoOpen) openCart();
}

function removeFromCart(productId) {
  const prod = PRODUCTS_DB[productId];
  const targetId = prod ? prod.id : productId;
  cart = cart.filter(item => item.id !== targetId && item.id !== productId && item.slug !== productId);
  saveCart();
  if (typeof window.trackEvent === 'function') {
    window.trackEvent('Ecommerce', 'remove_from_cart', productId);
  }
}

function updateQty(productId, delta) {
  const prod = PRODUCTS_DB[productId];
  const targetId = prod ? prod.id : productId;
  const item = cart.find(i => i.id === targetId || i.id === productId || i.slug === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId);
  } else {
    saveCart();
  }
}

function getCartTotal() {
  const totalTry = cart.reduce((acc, item) => acc + (item.priceTry * item.qty), 0);
  const totalUsd = cart.reduce((acc, item) => acc + (item.priceUsd * item.qty), 0);
  return { totalTry, totalUsd };
}

function renderCartDrawer() {
  const drawerBody = document.getElementById('cart-drawer-items');
  const subtotalEl = document.getElementById('cart-drawer-subtotal');
  if (!drawerBody || !subtotalEl) return;

  const emptyText = typeof t === 'function' ? t('cartEmpty') : 'Sepetinizde henüz ürün bulunmuyor.';
  const exploreText = typeof t === 'function' ? t('cartExploreStore') : 'Mağazayı İncele →';

  if (cart.length === 0) {
    drawerBody.innerHTML = `
      <div class="cart-empty-state">
        <div style="font-size: 3rem; margin-bottom: 12px;">🛒</div>
        <p>${emptyText}</p>
        <a href="../store/" style="display: inline-block; margin-top: 14px; color: var(--accent-cyan); font-weight: 700;">${exploreText}</a>
      </div>
    `;
    subtotalEl.textContent = '₺0.00';
    return;
  }

  let html = '';
  cart.forEach(item => {
    const itemName = getProductName(item.id);
    html += `
      <div class="cart-item">
        <div class="cart-item-icon">${item.icon}</div>
        <div class="cart-item-details">
          <div class="cart-item-title">${itemName}</div>
          <div class="cart-item-price">₺${item.priceTry} × ${item.qty}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button onclick="updateQty('${item.id}', -1)" style="background: #334155; border: none; color: #fff; width: 24px; height: 24px; border-radius: 6px; cursor: pointer;">-</button>
          <span style="font-weight: 700;">${item.qty}</span>
          <button onclick="updateQty('${item.id}', 1)" style="background: #334155; border: none; color: #fff; width: 24px; height: 24px; border-radius: 6px; cursor: pointer;">+</button>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" title="Kaldır">✕</button>
      </div>
    `;
  });

  const totals = getCartTotal();
  drawerBody.innerHTML = html;
  subtotalEl.textContent = `₺${totals.totalTry} (${totals.totalUsd.toFixed(2)} USD)`;
}

function openCart() {
  const overlay = document.getElementById('cart-overlay');
  const drawer = document.getElementById('cart-drawer');
  if (overlay && drawer) {
    renderCartDrawer();
    overlay.classList.add('active');
    drawer.classList.add('active');
  }
}

function closeCart() {
  const overlay = document.getElementById('cart-overlay');
  const drawer = document.getElementById('cart-drawer');
  if (overlay && drawer) {
    overlay.classList.remove('active');
    drawer.classList.remove('active');
  }
}

// Checkout Modal Handlers
let selectedPaymentMethod = 'polar';

function selectPaymentMethod(method) {
  selectedPaymentMethod = method;
  document.querySelectorAll('.payment-method-card').forEach(c => {
    c.classList.toggle('selected', c.dataset.method === method);
  });
}

function openCheckoutModal(singleProductId = null) {
  closeCart();
  if (singleProductId) {
    addToCart(singleProductId, false);
  }
  if (cart.length === 0) {
    showToast('⚠️ ' + (typeof t === 'function' ? t('cartEmpty') : 'Sepetiniz boş.'));
    return;
  }

  const modal = document.getElementById('checkout-modal');
  const summaryEl = document.getElementById('checkout-order-summary');
  const totalEl = document.getElementById('checkout-total-amount');

  if (summaryEl && totalEl) {
    const totals = getCartTotal();
    summaryEl.innerHTML = cart.map(i => {
      const itemName = getProductName(i.id);
      return `<div style="display:flex; justify-content:space-between; margin-bottom:6px;"><span>${i.icon} ${itemName} (${i.qty}x)</span><strong>₺${i.priceTry * i.qty}</strong></div>`;
    }).join('');
    totalEl.textContent = `₺${totals.totalTry} / $${totals.totalUsd.toFixed(2)} USD`;
  }

  if (modal) {
    // Re-apply language to ensure modal fields are 100% translated
    if (typeof applyLanguage === 'function') {
      applyLanguage(currentLang);
    }
    modal.classList.add('active');
    if (typeof window.trackEvent === 'function') {
      window.trackEvent('Ecommerce', 'checkout_modal_opened', (cart[0]?.id || 'bundle_suite'));
    }
  }
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.remove('active');
}

// Checkout Submission — doğrudan Polar'ın gerçek checkout linkine gider.
// Hiçbir ara backend çağrısı yok; buy.polar.sh dışında hiçbir adrese POST atılmaz.
async function submitCheckout(event) {
  if (event) event.preventDefault();

  const email = document.getElementById('checkout-email')?.value?.trim();
  const termsAccepted = document.getElementById('checkout-terms')?.checked;
  const btnSubmit = document.getElementById('btn-submit-order');

  if (!email || !email.includes('@')) {
    alert(typeof t === 'function' ? t('modalCheckoutEmailLabel') : 'Lütfen geçerli bir e-posta adresi giriniz.');
    return;
  }

  if (!termsAccepted) {
    alert('Please accept terms & privacy policy.');
    return;
  }

  const item = cart[0] || PRODUCTS_DB.bundle_suite;
  const directCheckoutUrl = item.checkoutUrl || PRODUCTS_DB[item.productId || item.id]?.checkoutUrl || PRODUCTS_DB.bundle_suite.checkoutUrl;

  if (typeof window.trackEvent === 'function') {
    window.trackEvent('Ecommerce', 'polar_checkout_redirect', item.id, item.priceTry);
  }

  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.textContent = '🔒 Polar Güvenli Ödemeye Yönlendiriliyor...';
  }

  const checkoutUrlWithEmail = email ? `${directCheckoutUrl}?customer_email=${encodeURIComponent(email)}` : directCheckoutUrl;

  cart = [];
  saveCart();
  window.location.href = checkoutUrlWithEmail;
}

// order-success-modal artık otomatik açılmıyor (bkz. DOMContentLoaded), ama
// index.html/store.html'deki kapatma butonu bu fonksiyona onclick ile bağlı —
// kaldırılırsa ReferenceError verir, o yüzden stub olarak kalıyor.
function closeSuccessModal() {
  const modal = document.getElementById('order-success-modal');
  if (modal) modal.classList.remove('active');
}

// Global Toast Notification Helper
function showToast(message) {
  let toast = document.getElementById('portal-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'portal-toast';
    toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#10b981;color:#fff;padding:12px 20px;border-radius:10px;font-weight:700;font-size:0.9rem;box-shadow:0 10px 25px rgba(0,0,0,0.5);z-index:999999;transition:opacity 0.3s, transform 0.3s;opacity:0;transform:translateY(10px);pointer-events:none;';
    document.body.appendChild(toast);
  }
  toast.innerText = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
  }, 3000);
}

// Global Copy Helper
function copyLicenseKey(key) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(key).then(() => {
      showToast('✅ Lisans anahtarı kopyalandı!');
    }).catch(() => {
      prompt('Lisans Anahtarınız:', key);
    });
  } else {
    prompt('Lisans Anahtarınız:', key);
  }
}

// Self-Service License Recovery
// Kimliksiz e-posta sorgusu YOK (başkasının anahtarını döndürmez). Yalnızca
// kullanıcının elindeki anahtarı doğrudan Polar'ın public validate ucuna karşı
// doğrular — hiçbir ara backend'e uğramaz.
async function searchLicenses(event) {
  if (event) {
    try { event.preventDefault(); } catch (e) {}
    try { event.stopPropagation(); } catch (e) {}
  }
  const inputEl = document.getElementById('recovery-query');
  const resultsEl = document.getElementById('recovery-results');
  if (!resultsEl) return false;

  const rawQuery = inputEl?.value?.trim();
  if (!rawQuery) {
    resultsEl.innerHTML = `
      <div style="background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 10px; padding: 12px; color: #fbbf24; font-size: 0.9rem; margin-top: 10px; text-align: left;">
        ⚠️ Lütfen Polar'ın satın alma sonrası size verdiği lisans anahtarını giriniz.
      </div>
    `;
    inputEl?.focus();
    return false;
  }

  if (rawQuery.includes('@')) {
    resultsEl.innerHTML = `
      <div style="background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 10px; padding: 14px; color: #7dd3fc; font-size: 0.9rem; margin-top: 10px; text-align: left;">
        📧 Güvenlik nedeniyle e-posta ile sorgulama yapılmıyor — bu, başkasının lisansının
        çalınmasını engeller. Lisans anahtarınız satın alma sırasında Polar tarafından
        e-postanıza gönderildi. Bulamıyorsanız <strong>support@forfor.site</strong> adresine
        satın alma e-postanızın kime ait olduğunu belirterek yazın.
      </div>
    `;
    return false;
  }

  resultsEl.innerHTML = '<div style="color: #fbbf24; padding: 14px; font-weight: 600; font-size: 0.95rem;">🔍 Polar üzerinde doğrulanıyor...</div>';

  try {
    const resp = await fetch(POLAR_VALIDATE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: rawQuery, organization_id: POLAR_ORGANIZATION_ID })
    });
    const data = await resp.json();

    if (resp.ok && (data.status === 'granted' || data.status === 'active' || data.id)) {
      resultsEl.innerHTML = `
        <div style="background: rgba(16, 185, 129, 0.12); border: 1px solid #10b981; border-radius: 12px; padding: 18px; margin: 14px 0; text-align: left;">
          <div style="color: #10b981; font-weight: 800; font-size: 1rem; margin-bottom: 6px;">✅ Lisans Geçerli & Aktif</div>
          <div style="color: #38bdf8; font-family: monospace; font-size: 1.1rem; font-weight: 800; margin: 10px 0; word-break: break-all;">${rawQuery}</div>
          <button type="button" onclick="copyLicenseKey('${rawQuery.replace(/'/g, "\\'")}')" style="background: linear-gradient(135deg, #10b981, #059669); border:none; color:#fff; border-radius:8px; padding:8px 18px; font-weight:700; font-size:0.88rem; cursor:pointer;">📋 Lisans Kodunu Kopyala</button>
        </div>
      `;
    } else {
      resultsEl.innerHTML = `
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 10px; padding: 14px; color: #f87171; font-size: 0.9rem; margin-top: 10px; text-align: left;">
          ⚠️ <strong>"${rawQuery}"</strong> Polar'da geçerli bir lisans anahtarı olarak bulunamadı.<br>
          <span style="font-size: 0.82rem; color: #94a3b8; margin-top: 4px; display: inline-block;">Anahtarı kopyala-yapıştır ile girdiğinizden emin olun. Sorun devam ederse support@forfor.site.</span>
        </div>
      `;
    }
  } catch (e) {
    resultsEl.innerHTML = `<div style="color: #f87171; padding: 12px; text-align: left;">⚠️ Doğrulama sunucusuna ulaşılamadı: ${e.message}. Lütfen tekrar deneyiniz.</div>`;
  }
  return false;
}

// Initialization & Post-Payment Handler
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  renderCartDrawer();

  // Polar checkout'tan başarıyla dönen kullanıcıya bilgi ver.
  // Burada hiçbir lisans anahtarı UYDURULMAZ ve hiçbir admin/generate-license
  // çağrısı yapılmaz — gerçek anahtar Polar'ın kendi e-postasıyla gelir.
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('success') === 'true') {
    window.history.replaceState({}, document.title, window.location.pathname);

    if (typeof window.trackEvent === 'function') {
      window.trackEvent('Ecommerce', 'purchase_success', urlParams.get('product') || 'unknown', 0);
    }

    setTimeout(() => {
      showToast('🎉 Ödeme alındı! Lisans anahtarınız Polar tarafından e-postanıza gönderiliyor.');
    }, 400);
  }
});
