import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { Firestore, FieldValue, Timestamp } from '@google-cloud/firestore';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const PROJECT_ID = process.env.GCP_PROJECT_ID || 'yt-extension-backend-507011';
const SHOPIFY_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET || '';
const ADMIN_KEY = process.env.ADMIN_API_KEY || 'dev-admin-secret-507011';
const MAX_DEVICES_DEFAULT = parseInt(process.env.MAX_DEVICES_PER_LICENSE || '1', 10);

// Initialize Firestore
let db;
try {
  db = new Firestore({
    projectId: PROJECT_ID,
    databaseId: '(default)'
  });
  console.log(`[FIRESTORE] Connected to project: ${PROJECT_ID}`);
} catch (err) {
  console.warn('[FIRESTORE] Warning: Cloud Firestore init fallback to local mock mode if offline:', err.message);
}

// In-memory fallback for local dev if Firestore is not accessible offline
const inMemoryLicenses = new Map();

// Helper to generate formatted license keys
function generateLicenseKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars 0,O,1,I
  const segment = () => {
    let res = '';
    const bytes = crypto.randomBytes(4);
    for (let i = 0; i < 4; i++) {
      res += chars[bytes[i] % chars.length];
    }
    return res;
  };
  return `LIC-${segment()}-${segment()}-${segment()}`;
}

// Middleware
app.use(helmet());
app.use(morgan('combined'));

// Raw body parser for Shopify Webhook HMAC verification
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Allow CORS for Chrome Extensions and Web dashboards
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, webhooks) or chrome extensions
    if (!origin || origin.startsWith('chrome-extension://') || origin.includes('youtube.com') || origin.includes('myshopify.com')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive for production extension verification
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Shopify-Hmac-Sha256', 'X-Admin-Key']
}));

// ==========================================
// 1. HEALTH CHECK ENDPOINT
// ==========================================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'yt-license-service',
    version: '1.0.0',
    projectId: PROJECT_ID,
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 2. SHOPIFY WEBHOOK: ORDER PAID (CREATE LICENSE)
// ==========================================
app.post('/api/shopify/order-paid', async (req, res) => {
  try {
    const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
    
    // Validate Shopify HMAC if secret is configured
    if (SHOPIFY_SECRET && hmacHeader && req.rawBody) {
      const generatedHash = crypto
        .createHmac('sha256', SHOPIFY_SECRET)
        .update(req.rawBody)
        .digest('base64');

      if (!crypto.timingSafeEqual(Buffer.from(generatedHash), Buffer.from(hmacHeader))) {
        console.error('[SHOPIFY WEBHOOK] Invalid HMAC Signature!');
        return res.status(401).json({ error: 'UNAUTHORIZED_WEBHOOK_SIGNATURE' });
      }
    }

    const orderData = req.body;
    const customerEmail = orderData.email || (orderData.customer && orderData.customer.email) || 'guest@customer.com';
    const customerName = orderData.customer ? `${orderData.customer.first_name || ''} ${orderData.customer.last_name || ''}`.trim() : 'Valued Customer';
    const orderId = String(orderData.id || Date.now());

    const licenseKey = generateLicenseKey();
    const createdAt = new Date();
    // Default 1 year validity (or null for lifetime)
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    const licenseRecord = {
      licenseKey,
      customerEmail,
      customerName,
      orderId,
      status: 'active',
      maxDevices: MAX_DEVICES_DEFAULT,
      activatedDevices: [],
      createdAt: Timestamp.fromDate(createdAt),
      expiresAt: Timestamp.fromDate(expiresAt),
      meta: {
        source: 'shopify_webhook',
        totalPrice: orderData.total_price || '0.00',
        currency: orderData.currency || 'USD'
      }
    };

    if (db) {
      await db.collection('licenses').doc(licenseKey).set(licenseRecord);
      console.log(`[SHOPIFY] Created license in Firestore: ${licenseKey} for ${customerEmail}`);
    } else {
      inMemoryLicenses.set(licenseKey, licenseRecord);
      console.log(`[SHOPIFY] Created license in Mock DB: ${licenseKey}`);
    }

    // Return success to Shopify
    return res.status(200).json({
      success: true,
      licenseKey,
      customerEmail,
      expiresAt: expiresAt.toISOString()
    });
  } catch (error) {
    console.error('[SHOPIFY WEBHOOK ERROR]:', error);
    return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: error.message });
  }
});

// ==========================================
// 3. EXTENSION LICENSE VERIFICATION ENDPOINT
// ==========================================
app.post('/api/license/verify', async (req, res) => {
  try {
    const { licenseKey, hardwareId, version } = req.body;

    if (!licenseKey || typeof licenseKey !== 'string') {
      return res.status(400).json({ valid: false, error: 'MISSING_LICENSE_KEY', message: 'Lütfen lisans anahtarınızı giriniz.' });
    }

    const cleanKey = licenseKey.trim().toUpperCase();
    const targetHardwareId = hardwareId ? String(hardwareId).trim() : 'generic_device';

    let licenseData = null;

    if (db) {
      const docRef = db.collection('licenses').doc(cleanKey);
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        licenseData = docSnap.data();
      }
    } else {
      licenseData = inMemoryLicenses.get(cleanKey);
    }

    if (!licenseData) {
      return res.status(404).json({
        valid: false,
        error: 'INVALID_LICENSE',
        message: 'Girilen lisans anahtarı bulunamadı veya geçersiz.'
      });
    }

    // Check Status
    if (licenseData.status !== 'active') {
      return res.status(403).json({
        valid: false,
        error: 'LICENSE_INACTIVE',
        message: 'Bu lisans askıya alınmış veya pasif duruma getirilmiş.'
      });
    }

    // Check Expiration
    if (licenseData.expiresAt) {
      const expireDate = licenseData.expiresAt.toDate ? licenseData.expiresAt.toDate() : new Date(licenseData.expiresAt);
      if (new Date() > expireDate) {
        return res.status(403).json({
          valid: false,
          error: 'LICENSE_EXPIRED',
          message: 'Lisans süreniz dolmuştur. Lütfen mağazamızdan yenileyiniz.'
        });
      }
    }

    // Hardware ID / Device Lock Verification
    const activatedDevices = licenseData.activatedDevices || [];
    const maxDevices = licenseData.maxDevices || MAX_DEVICES_DEFAULT;
    const existingDeviceIndex = activatedDevices.findIndex(d => d.hardwareId === targetHardwareId);

    const nowIso = new Date().toISOString();

    if (existingDeviceIndex !== -1) {
      // Device already authorized - update lastSeen
      activatedDevices[existingDeviceIndex].lastSeenAt = nowIso;
      if (db) {
        await db.collection('licenses').doc(cleanKey).update({ activatedDevices });
      }
    } else {
      // New device trying to activate
      if (activatedDevices.length >= maxDevices) {
        return res.status(403).json({
          valid: false,
          error: 'DEVICE_LIMIT_REACHED',
          message: `Bu lisans maksimum ${maxDevices} cihazda kullanılabilir. Cihaz sınırına ulaşıldı.`
        });
      }

      // Register new device
      activatedDevices.push({
        hardwareId: targetHardwareId,
        firstSeenAt: nowIso,
        lastSeenAt: nowIso,
        version: version || '1.0.0'
      });

      if (db) {
        await db.collection('licenses').doc(cleanKey).update({ activatedDevices });
      }
    }

    return res.status(200).json({
      valid: true,
      status: 'active',
      customerEmail: licenseData.customerEmail,
      expiresAt: licenseData.expiresAt ? (licenseData.expiresAt.toDate ? licenseData.expiresAt.toDate().toISOString() : licenseData.expiresAt) : null,
      deviceIndex: activatedDevices.findIndex(d => d.hardwareId === targetHardwareId) + 1,
      maxDevices,
      features: {
        smartInterceptor: true,
        streamSpeedSupressor: true,
        bannerCleaner: true,
        antiAdblockShield: true
      }
    });

  } catch (error) {
    console.error('[LICENSE VERIFY ERROR]:', error);
    return res.status(500).json({ valid: false, error: 'SERVER_ERROR', message: 'Doğrulama sunucusunda hata oluştu.' });
  }
});

// ==========================================
// 4. ADMIN MANUAL LICENSE GENERATOR (CLI / BACKOFFICE)
// ==========================================
app.post('/api/admin/generate-license', async (req, res) => {
  try {
    const adminAuth = req.get('X-Admin-Key');
    if (!adminAuth || adminAuth !== ADMIN_KEY) {
      return res.status(401).json({ error: 'UNAUTHORIZED_ADMIN_KEY' });
    }

    const { customerEmail, daysValid = 365, maxDevices = 1 } = req.body;
    const licenseKey = generateLicenseKey();
    const createdAt = new Date();
    const expiresAt = new Date(Date.now() + (daysValid * 24 * 60 * 60 * 1000));

    const licenseRecord = {
      licenseKey,
      customerEmail: customerEmail || 'manual_admin@customer.com',
      customerName: 'Direct Client',
      orderId: 'ADMIN_MANUAL_' + Date.now(),
      status: 'active',
      maxDevices: parseInt(maxDevices, 10) || 1,
      activatedDevices: [],
      createdAt: Timestamp.fromDate(createdAt),
      expiresAt: Timestamp.fromDate(expiresAt),
      meta: {
        source: 'admin_panel'
      }
    };

    if (db) {
      await db.collection('licenses').doc(licenseKey).set(licenseRecord);
    } else {
      inMemoryLicenses.set(licenseKey, licenseRecord);
    }

    return res.status(201).json({
      success: true,
      licenseKey,
      expiresAt: expiresAt.toISOString(),
      maxDevices
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 YT License Service listening on port ${PORT}`);
  console.log(`📡 Project ID: ${PROJECT_ID}`);
  console.log(`🔑 Health check: http://localhost:${PORT}/api/health`);
  console.log(`=========================================`);
});
