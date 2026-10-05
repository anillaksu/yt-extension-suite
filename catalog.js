/**
 * ÜRETİLDİ — elle düzenlemeyin. Kaynak: catalog/registry.json
 * Üretici: scripts/gen/gen-catalog.js — değişiklik için registry.json'ı düzenleyip yeniden üretin.
 */
const PRODUCTS_DB = {
  "yt_accelerator": {
    "id": "ff0461f9-ae7e-4a31-9ac3-a3bd77d5027e",
    "slug": "yt_accelerator",
    "productId": "ff0461f9-ae7e-4a31-9ac3-a3bd77d5027e",
    "nameKey": "p1Title",
    "icon": "⚡",
    "priceTry": 499,
    "priceUsd": 19.99,
    "url": "/yt-extension-suite/",
    "polarPriceId": "754b8849-861e-4221-9576-755bd80bce1b",
    "checkoutUrl": "https://buy.polar.sh/polar_cl_PSlObXBqmnn6MMU7VbiPUZoOznY7MwkBf85Cv0GvXDv"
  },
  "ff0461f9-ae7e-4a31-9ac3-a3bd77d5027e": {
    "id": "ff0461f9-ae7e-4a31-9ac3-a3bd77d5027e",
    "slug": "yt_accelerator",
    "productId": "ff0461f9-ae7e-4a31-9ac3-a3bd77d5027e",
    "nameKey": "p1Title",
    "icon": "⚡",
    "priceTry": 499,
    "priceUsd": 19.99,
    "url": "/yt-extension-suite/",
    "polarPriceId": "754b8849-861e-4221-9576-755bd80bce1b",
    "checkoutUrl": "https://buy.polar.sh/polar_cl_PSlObXBqmnn6MMU7VbiPUZoOznY7MwkBf85Cv0GvXDv"
  },
  "clean_capture": {
    "id": "eff8d686-e897-4b69-9842-c5736d3d3360",
    "slug": "clean_capture",
    "productId": "eff8d686-e897-4b69-9842-c5736d3d3360",
    "nameKey": "p2Title",
    "icon": "📸",
    "priceTry": 299,
    "priceUsd": 11.99,
    "url": "/screen-pdf-capture/",
    "polarPriceId": "663256bd-fc8a-46fd-849d-c0001b19d7c0",
    "checkoutUrl": "https://buy.polar.sh/polar_cl_kBWTcTdoTsvTcoiSfik2VpBdnve2whd0eit3A1EQX4r"
  },
  "eff8d686-e897-4b69-9842-c5736d3d3360": {
    "id": "eff8d686-e897-4b69-9842-c5736d3d3360",
    "slug": "clean_capture",
    "productId": "eff8d686-e897-4b69-9842-c5736d3d3360",
    "nameKey": "p2Title",
    "icon": "📸",
    "priceTry": 299,
    "priceUsd": 11.99,
    "url": "/screen-pdf-capture/",
    "polarPriceId": "663256bd-fc8a-46fd-849d-c0001b19d7c0",
    "checkoutUrl": "https://buy.polar.sh/polar_cl_kBWTcTdoTsvTcoiSfik2VpBdnve2whd0eit3A1EQX4r"
  },
  "bundle_suite": {
    "id": "5ddcf5ac-9f93-4770-818e-5acb025ead6d",
    "slug": "bundle_suite",
    "productId": "5ddcf5ac-9f93-4770-818e-5acb025ead6d",
    "nameKey": "bundleTitle",
    "icon": "💎",
    "priceTry": 649,
    "priceUsd": 24.99,
    "url": "/store/",
    "polarPriceId": "7c1c6aee-8853-47cd-94e3-e792cbd0aecd",
    "checkoutUrl": "https://buy.polar.sh/polar_cl_wTAMpilwQZu65m8fhARB6uWAr6d0MUmNOm3Es0eFlWc"
  },
  "5ddcf5ac-9f93-4770-818e-5acb025ead6d": {
    "id": "5ddcf5ac-9f93-4770-818e-5acb025ead6d",
    "slug": "bundle_suite",
    "productId": "5ddcf5ac-9f93-4770-818e-5acb025ead6d",
    "nameKey": "bundleTitle",
    "icon": "💎",
    "priceTry": 649,
    "priceUsd": 24.99,
    "url": "/store/",
    "polarPriceId": "7c1c6aee-8853-47cd-94e3-e792cbd0aecd",
    "checkoutUrl": "https://buy.polar.sh/polar_cl_wTAMpilwQZu65m8fhARB6uWAr6d0MUmNOm3Es0eFlWc"
  }
};

// Destek/bağış ürünleri (05.10.2026). Bunlar LİSANS İÇERMEZ; Polar'da
// license_keys benefit'i olmadan açıldılar (scripts/polar-bagis-urunleri.mjs).
// Bu yüzden sepete/cart.js'e GİRMEZLER — doğrudan kendi checkout linklerine
// giderler. Eski hata buradan geliyordu: $5 yazan buton 11.99$ cekiyordu.
// Kullanım: <a href="https://buy.polar.sh/..."> — doğrudan ödeme.
const DONATIONS_DB = {
  "destek_5": {
    "slug": "destek_5",
    "ad": "Destek — Tek Seferlik $5",
    "usd": 5,
    "periyet": null,
    "productId": "7e418a38-d44f-4c99-b0f6-d2e652ce246b",
    "polarPriceId": "2af3d4c2-ef22-4792-b435-957d147ced4c",
    "checkoutUrl": "https://buy.polar.sh/polar_cl_gMZKK5Yoy6WPy2bcItgDQRSrhVP4QRcwpd4oJ1sjG6o",
    "lisansIcerir": false
  },
  "destek_10": {
    "slug": "destek_10",
    "ad": "Destek — Tek Seferlik $10",
    "usd": 10,
    "periyet": null,
    "productId": "41b44d22-fd89-4d9b-aa4b-528252e18dc0",
    "polarPriceId": "4c0f6331-ce6e-4ec7-9e9e-9c7d4d4bffff",
    "checkoutUrl": "https://buy.polar.sh/polar_cl_TVQaDmFOjrGKkPKifstCrXVTjeubgyjhBpMNz4XWsju",
    "lisansIcerir": false
  },
  "destek_25": {
    "slug": "destek_25",
    "ad": "Destek — Tek Seferlik $25",
    "usd": 25,
    "periyet": null,
    "productId": "79046590-a7ed-4813-8e1b-5148f82ef168",
    "polarPriceId": "b03c26eb-4089-4c87-917f-31b780f30f13",
    "checkoutUrl": "https://buy.polar.sh/polar_cl_PUJcp4kBySOMH6M42YKDUu8joiwApTJzCyJgU3DEx9I",
    "lisansIcerir": false
  },
  "destek_aylik_5": {
    "slug": "destek_aylik_5",
    "ad": "Destek — Aylık $5",
    "usd": 5,
    "periyet": "month",
    "productId": "ff37ff7b-5d04-4611-b8e4-f98fd404abb3",
    "polarPriceId": "b69d1e4b-3fd9-4429-a0e9-072949e9b4f8",
    "checkoutUrl": "https://buy.polar.sh/polar_cl_0ZQBSaPEJOyTz4qim6gcWI8bTdIEUCnp6hFZ03ZpBfl",
    "lisansIcerir": false
  },
  "destek_aylik_10": {
    "slug": "destek_aylik_10",
    "ad": "Destek — Aylık $10",
    "usd": 10,
    "periyet": "month",
    "productId": "8c0d151b-183c-4c00-89e1-123dc9e1812a",
    "polarPriceId": "85480fd0-8190-4e9c-ab7d-cabc7a01b845",
    "checkoutUrl": "https://buy.polar.sh/polar_cl_RqCzNQ0t34pvEgDakTWlvBi9RVwjyhrvoj06A0DdtOl",
    "lisansIcerir": false
  },
  "destek_aylik_20": {
    "slug": "destek_aylik_20",
    "ad": "Destek — Aylık $20",
    "usd": 20,
    "periyet": "month",
    "productId": "4b39346e-53f3-4363-839f-7cc94049106d",
    "polarPriceId": "1952d2f8-54e9-49cb-b36b-397a815f90cc",
    "checkoutUrl": "https://buy.polar.sh/polar_cl_dyNJlBlLbAC1mVQ4rf0OAjYZYw1HgNx2LTVNS1PYRSl",
    "lisansIcerir": false
  }
};

const CATALOG_ORGANIZATION_ID = "450fc977-6d1a-4af9-b6b7-a3313b344595";
