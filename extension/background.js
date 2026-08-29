/**
 * YouTube Media Player Accelerator - Background Service Worker
 * Manages device fingerprinting, license verification, and background synchronization.
 */

// Default Configuration
const DEFAULT_API_URL = 'https://yt-license-service-74070171768.europe-west1.run.app';

// Generate or retrieve persistent hardware device ID
async function getOrCreateDeviceId() {
  const result = await chrome.storage.local.get('hardwareId');
  if (result.hardwareId) {
    return result.hardwareId;
  }
  const newId = 'dev_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  await chrome.storage.local.set({ hardwareId: newId });
  return newId;
}

// Check license with backend API
async function verifyLicenseWithServer(licenseKey, apiUrl) {
  const hardwareId = await getOrCreateDeviceId();
  const endpoint = (apiUrl || DEFAULT_API_URL) + '/api/license/verify';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        licenseKey: licenseKey.trim().toUpperCase(),
        hardwareId,
        version: chrome.runtime.getManifest().version
      })
    });

    const data = await response.json();
    if (response.ok && data.valid) {
      await chrome.storage.local.set({
        isLicensed: true,
        licenseKey: licenseKey.trim().toUpperCase(),
        customerEmail: data.customerEmail,
        expiresAt: data.expiresAt,
        lastVerifiedAt: new Date().toISOString(),
        features: data.features || {}
      });
      return { success: true, data };
    } else {
      await chrome.storage.local.set({ isLicensed: false, licenseError: data.message || 'Geçersiz Lisans' });
      return { success: false, error: data.message || 'Geçersiz lisans anahtarı.' };
    }
  } catch (err) {
    console.error('[BACKGROUND] License verification network error:', err);
    return { success: false, error: 'Doğrulama sunucusuna bağlanılamadı. İnternet bağlantınızı kontrol ediniz.' };
  }
}

// On install / update
chrome.runtime.onInstalled.addListener(async (details) => {
  await getOrCreateDeviceId();

  const data = await chrome.storage.local.get(['isLicensed', 'isEnabled', 'apiUrl']);
  if (data.isLicensed === undefined) {
    await chrome.storage.local.set({
      isLicensed: false,
      isEnabled: true,
      apiUrl: DEFAULT_API_URL,
      features: {
        smartInterceptor: true,
        bannerCleaner: true,
        streamSpeedSupressor: true,
        antiAdblockShield: true
      }
    });
  }

  // Set up periodic verification alarm (every 24 hours)
  chrome.alarms.create('check_license_periodically', { periodInMinutes: 1440 });
});

// Periodic alarm handler
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'check_license_periodically') {
    const stored = await chrome.storage.local.get(['licenseKey', 'apiUrl']);
    if (stored.licenseKey) {
      await verifyLicenseWithServer(stored.licenseKey, stored.apiUrl);
    }
  }
});

// Message listener from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'VERIFY_LICENSE') {
    verifyLicenseWithServer(request.licenseKey, request.apiUrl).then(sendResponse);
    return true; // Keep channel open for async response
  }
  if (request.action === 'GET_DEVICE_ID') {
    getOrCreateDeviceId().then(id => sendResponse({ hardwareId: id }));
    return true;
  }
});
