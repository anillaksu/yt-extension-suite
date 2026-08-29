/**
 * YouTube Media Player Accelerator - Multi-Language Popup Controller
 */

const I18N = {
  en: {
    appName: "YT Accelerator",
    statusActive: "Active (Pro)",
    statusInactive: "Inactive",
    licenseHeader: "🔑 License Activation",
    licenseDesc: "Enter your license key purchased from our official store:",
    enterLicenseKey: "LIC-XXXX-XXXX-XXXX",
    btnActivate: "Activate",
    btnVerifying: "Checking...",
    btnBuy: "🛒 Get a License Key",
    advancedSettings: "Advanced",
    serverUrlLabel: "API Endpoint:",
    btnSave: "Save",
    userLabel: "User:",
    expiresLabel: "Expires:",
    deviceIdLabel: "Device ID:",
    smartFeaturesHeader: "⚙️ Acceleration Engine",
    featureInterceptorTitle: "Stream Interceptor Engine",
    featureInterceptorDesc: "0ms zero-latency video player pipeline",
    featureBannerTitle: "Visual Cleaner & Optimizer",
    featureBannerDesc: "Cleans sidebar clutter and optimizes layout",
    featureShieldTitle: "Anti-Interruption Shield",
    featureShieldDesc: "Auto-dismisses playback interruption modals",
    featureSpeedTitle: "16x Fast-Forward Accelerator",
    featureSpeedDesc: "Auto-skips buffer stalls and stream pauses",
    btnSupport: "Support & Docs",
    lifetime: "Lifetime",
    licensedCustomer: "Licensed Customer",
    apiSaved: "API endpoint saved successfully.",
    licenseChecking: "Verifying license with server...",
    licenseSuccess: "🎉 License successfully activated!",
    enterValidKey: "Please enter a valid license key.",
    deviceLimitReached: "Device limit reached. License is locked to another browser.",
    licenseExpired: "License has expired. Please renew."
  },
  tr: {
    appName: "YT Hızlandırıcı",
    statusActive: "Aktif (Pro)",
    statusInactive: "Pasif",
    licenseHeader: "🔑 Lisans Aktivasyonu",
    licenseDesc: "Mağazamızdan satın aldığınız lisans anahtarınızı giriniz:",
    enterLicenseKey: "LIC-XXXX-XXXX-XXXX",
    btnActivate: "Doğrula",
    btnVerifying: "Kontrol Ediliyor...",
    btnBuy: "🛒 Lisans Satın Al",
    advancedSettings: "Gelişmiş",
    serverUrlLabel: "API Sunucu URL:",
    btnSave: "Kaydet",
    userLabel: "Kullanıcı:",
    expiresLabel: "Bitiş Tarihi:",
    deviceIdLabel: "Cihaz Kimliği:",
    smartFeaturesHeader: "⚙️ Akıllı Motor Özellikleri",
    featureInterceptorTitle: "Ana Motor Koruması",
    featureInterceptorDesc: "0ms gecikmesiz API stream interceptor",
    featureBannerTitle: "Görsel Temizleyici & Optimizasyon",
    featureBannerDesc: "Kenar çubuğu ve öneri alanını temizler",
    featureShieldTitle: "Anti-Adblock Popup Kalkanı",
    featureShieldDesc: "Oynatma kesintisi uyarılarını otomatik kapatır",
    featureSpeedTitle: "16x Hızlandırıcı & Atlayıcı",
    featureSpeedDesc: "Akış takılmalarını ve arabelleği anında geçer",
    btnSupport: "Destek & Kılavuz",
    lifetime: "Ömür Boyu (Lifetime)",
    licensedCustomer: "Lisanslı Müşteri",
    apiSaved: "API sunucu adresi başarıyla kaydedildi.",
    licenseChecking: "Lisans sunucu ile doğrulanıyor...",
    licenseSuccess: "🎉 Lisans başarıyla doğrulandı ve aktif edildi!",
    enterValidKey: "Lütfen geçerli bir lisans anahtarı giriniz.",
    deviceLimitReached: "Cihaz sınırına ulaşıldı. Lisans başka bir tarayıcıya kilitli.",
    licenseExpired: "Lisans süresi dolmuş. Lütfen yenileyiniz."
  },
  es: {
    appName: "YT Acelerador",
    statusActive: "Activo (Pro)",
    statusInactive: "Inactivo",
    licenseHeader: "🔑 Activación de Licencia",
    licenseDesc: "Ingrese su clave de licencia comprada en nuestra tienda:",
    enterLicenseKey: "LIC-XXXX-XXXX-XXXX",
    btnActivate: "Activar",
    btnVerifying: "Verificando...",
    btnBuy: "🛒 Obtener Licencia",
    advancedSettings: "Avanzado",
    serverUrlLabel: "Punto de enlace API:",
    btnSave: "Guardar",
    userLabel: "Usuario:",
    expiresLabel: "Vence:",
    deviceIdLabel: "ID Dispositivo:",
    smartFeaturesHeader: "⚙️ Motor de Aceleración",
    featureInterceptorTitle: "Motor Interceptor de Flujo",
    featureInterceptorDesc: "Canalización de reproductor con latencia cero 0ms",
    featureBannerTitle: "Limpiador Visual y Optimizador",
    featureBannerDesc: "Limpia la barra lateral y optimiza el diseño",
    featureShieldTitle: "Escudo Anti-Interrupciones",
    featureShieldDesc: "Cierra automáticamente modales de interrupción",
    featureSpeedTitle: "Acelerador de Avance Rápido 16x",
    featureSpeedDesc: "Salta paradas de búfer y pausas de transmisión",
    btnSupport: "Soporte y Guía",
    lifetime: "De por vida",
    licensedCustomer: "Cliente con Licencia",
    apiSaved: "Dirección de API guardada correctamente.",
    licenseChecking: "Verificando licencia con el servidor...",
    licenseSuccess: "🎉 ¡Licencia activada con éxito!",
    enterValidKey: "Ingrese una clave de licencia válida.",
    deviceLimitReached: "Límite de dispositivos alcanzado. Bloqueado en otro navegador.",
    licenseExpired: "La licencia ha caducado. Por favor renueve."
  },
  de: {
    appName: "YT Beschleuniger",
    statusActive: "Aktiv (Pro)",
    statusInactive: "Inaktiv",
    licenseHeader: "🔑 Lizenzaktivierung",
    licenseDesc: "Geben Sie Ihren erworbenen Lizenzschlüssel ein:",
    enterLicenseKey: "LIC-XXXX-XXXX-XXXX",
    btnActivate: "Aktivieren",
    btnVerifying: "Überprüfen...",
    btnBuy: "🛒 Lizenz kaufen",
    advancedSettings: "Erweitert",
    serverUrlLabel: "API-Endpunkt:",
    btnSave: "Speichern",
    userLabel: "Benutzer:",
    expiresLabel: "Gültig bis:",
    deviceIdLabel: "Geräte-ID:",
    smartFeaturesHeader: "⚙️ Beschleunigungs-Engine",
    featureInterceptorTitle: "Stream-Interceptor-Engine",
    featureInterceptorDesc: "0ms verzögerungsfreie Videoplayer-Pipeline",
    featureBannerTitle: "Visueller Reiniger & Optimierer",
    featureBannerDesc: "Bereinigt Seitenleisten und optimiert das Layout",
    featureShieldTitle: "Anti-Unterbrechungs-Schild",
    featureShieldDesc: "Schließt automatisch störende Wiedergabedialoge",
    featureSpeedTitle: "16x Schnellvorlauf-Beschleuniger",
    featureSpeedDesc: "Überspringt Pufferstaus und Unterbrechungen",
    btnSupport: "Support & Anleitung",
    lifetime: "Lebenslang",
    licensedCustomer: "Lizenzierter Kunde",
    apiSaved: "API-Adresse erfolgreich gespeichert.",
    licenseChecking: "Lizenz wird auf dem Server überprüft...",
    licenseSuccess: "🎉 Lizenz erfolgreich aktiviert!",
    enterValidKey: "Bitte geben Sie einen gültigen Lizenzschlüssel ein.",
    deviceLimitReached: "Gerätelimit erreicht. Lizenz ist an einen anderen Browser gebunden.",
    licenseExpired: "Lizenz ist abgelaufen. Bitte erneuern."
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements
  const langSelect = document.getElementById('lang-select');
  const statusPill = document.getElementById('status-pill');
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');

  const licenseSection = document.getElementById('license-section');
  const licenseInfoCard = document.getElementById('license-info-card');
  const licenseInput = document.getElementById('license-input');
  const activateBtn = document.getElementById('activate-btn');
  const licenseMsg = document.getElementById('license-msg');

  const userEmail = document.getElementById('user-email');
  const expireDate = document.getElementById('expire-date');
  const deviceIdText = document.getElementById('device-id-text');

  const toggleMain = document.getElementById('toggle-main');
  const toggleBanner = document.getElementById('toggle-banner');
  const toggleShield = document.getElementById('toggle-shield');
  const toggleSpeed = document.getElementById('toggle-speed');

  const toggleAdvanced = document.getElementById('toggle-advanced');
  const advancedConfig = document.getElementById('advanced-config');
  const customApiInput = document.getElementById('custom-api-input');
  const saveApiBtn = document.getElementById('save-api-btn');

  // Determine current language
  let currentLang = 'en';
  const savedLangData = await chrome.storage.local.get(['uiLanguage']);
  if (savedLangData.uiLanguage && I18N[savedLangData.uiLanguage]) {
    currentLang = savedLangData.uiLanguage;
  } else {
    const browserLang = (navigator.language || 'en').slice(0, 2).toLowerCase();
    if (I18N[browserLang]) {
      currentLang = browserLang;
    }
  }

  langSelect.value = currentLang;

  function applyTranslations(lang) {
    const t = I18N[lang] || I18N.en;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (t[key]) {
        el.textContent = t[key];
      }
    });

    if (t.enterLicenseKey) {
      licenseInput.placeholder = t.enterLicenseKey;
    }
  }

  applyTranslations(currentLang);

  langSelect.addEventListener('change', async () => {
    currentLang = langSelect.value;
    await chrome.storage.local.set({ uiLanguage: currentLang });
    applyTranslations(currentLang);
    const freshData = await chrome.storage.local.get(['isLicensed', 'expiresAt', 'customerEmail']);
    updateLicenseUI(freshData);
  });

  // Load Initial State
  const data = await chrome.storage.local.get([
    'isLicensed',
    'licenseKey',
    'customerEmail',
    'expiresAt',
    'hardwareId',
    'isEnabled',
    'features',
    'apiUrl'
  ]);

  if (data.apiUrl) {
    customApiInput.value = data.apiUrl;
  }

  if (data.hardwareId) {
    deviceIdText.textContent = data.hardwareId;
  } else {
    chrome.runtime.sendMessage({ action: 'GET_DEVICE_ID' }, (res) => {
      if (res && res.hardwareId) {
        deviceIdText.textContent = res.hardwareId;
      }
    });
  }

  // Set Toggles
  toggleMain.checked = data.isEnabled !== false;
  if (data.features) {
    toggleBanner.checked = data.features.bannerCleaner !== false;
    toggleShield.checked = data.features.antiAdblockShield !== false;
    toggleSpeed.checked = data.features.streamSpeedSupressor !== false;
  }

  // Render License UI
  updateLicenseUI(data);

  // Activate Button Click Handler
  activateBtn.addEventListener('click', async () => {
    const t = I18N[currentLang] || I18N.en;
    const key = licenseInput.value.trim().toUpperCase();
    if (!key) {
      showMsg(t.enterValidKey, 'error');
      return;
    }

    activateBtn.disabled = true;
    activateBtn.textContent = t.btnVerifying;
    showMsg(t.licenseChecking, '');

    chrome.runtime.sendMessage({
      action: 'VERIFY_LICENSE',
      licenseKey: key,
      apiUrl: customApiInput.value.trim() || undefined
    }, (response) => {
      activateBtn.disabled = false;
      activateBtn.textContent = t.btnActivate;

      if (response && response.success) {
        showMsg(t.licenseSuccess, 'success');
        setTimeout(async () => {
          const freshData = await chrome.storage.local.get([
            'isLicensed',
            'licenseKey',
            'customerEmail',
            'expiresAt',
            'hardwareId'
          ]);
          updateLicenseUI(freshData);
        }, 600);
      } else {
        let errText = response && response.error ? response.error : 'License verification failed.';
        if (errText.includes('DEVICE_LIMIT')) {
          errText = t.deviceLimitReached;
        } else if (errText.includes('EXPIRED')) {
          errText = t.licenseExpired;
        }
        showMsg('❌ ' + errText, 'error');
      }
    });
  });

  // Toggle handlers
  toggleMain.addEventListener('change', async () => {
    await chrome.storage.local.set({ isEnabled: toggleMain.checked });
  });

  const saveFeatures = async () => {
    const features = {
      smartInterceptor: toggleMain.checked,
      bannerCleaner: toggleBanner.checked,
      antiAdblockShield: toggleShield.checked,
      streamSpeedSupressor: toggleSpeed.checked
    };
    await chrome.storage.local.set({ features });
  };

  toggleBanner.addEventListener('change', saveFeatures);
  toggleShield.addEventListener('change', saveFeatures);
  toggleSpeed.addEventListener('change', saveFeatures);

  // Advanced section toggle
  toggleAdvanced.addEventListener('click', () => {
    advancedConfig.classList.toggle('hidden');
  });

  saveApiBtn.addEventListener('click', async () => {
    const t = I18N[currentLang] || I18N.en;
    const url = customApiInput.value.trim();
    if (url) {
      await chrome.storage.local.set({ apiUrl: url });
      showMsg(t.apiSaved, 'success');
    }
  });

  // Helpers
  function updateLicenseUI(storedData) {
    const t = I18N[currentLang] || I18N.en;
    const isLicensed = storedData.isLicensed === true;

    if (isLicensed) {
      statusPill.classList.add('active');
      statusText.textContent = t.statusActive;
      licenseSection.classList.add('hidden');
      licenseInfoCard.classList.remove('hidden');

      userEmail.textContent = storedData.customerEmail || t.licensedCustomer;
      if (storedData.expiresAt) {
        const d = new Date(storedData.expiresAt);
        expireDate.textContent = isNaN(d.getTime()) ? storedData.expiresAt : d.toLocaleDateString();
      } else {
        expireDate.textContent = t.lifetime;
      }
    } else {
      statusPill.classList.remove('active');
      statusText.textContent = t.statusInactive;
      licenseSection.classList.remove('hidden');
      licenseInfoCard.classList.add('hidden');

      if (storedData.licenseKey) {
        licenseInput.value = storedData.licenseKey;
      }
    }
  }

  function showMsg(text, type) {
    if (!text) {
      licenseMsg.classList.add('hidden');
      return;
    }
    licenseMsg.textContent = text;
    licenseMsg.className = 'msg-box ' + (type || '');
    licenseMsg.classList.remove('hidden');
  }
});
