# YouTube Extension Suite - Automated GCP Deployment Script
$ErrorActionPreference = "Stop"

$PROJECT_ID = "yt-extension-backend-507011"
$REGION = "europe-west1"
$SERVICE_NAME = "yt-license-service"

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "🚀 YT Extension Backend Deployment Pipeline (GCP)" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Check gcloud CLI
Write-Host "`n[1/5] Checking gcloud CLI..." -ForegroundColor Yellow
gcloud --version
if ($LASTEXITCODE -ne 0) {
    Write-Error "gcloud CLI bulunamadı! Lütfen Google Cloud SDK'nın kurulu olduğundan emin olun."
}

# 2. Set Project
Write-Host "`n[2/5] Setting active project to $PROJECT_ID..." -ForegroundColor Yellow
gcloud config set project $PROJECT_ID

# 3. Enable Required APIs
Write-Host "`n[3/5] Enabling GCP APIs (Cloud Run, Cloud Build, Firestore, Artifact Registry)..." -ForegroundColor Yellow
gcloud services enable run.googleapis.com cloudbuild.googleapis.com firestore.googleapis.com artifactregistry.googleapis.com

# 4. Check / Create Firestore Database
Write-Host "`n[4/5] Checking Firestore database..." -ForegroundColor Yellow
try {
    gcloud firestore databases describe --database="(default)" 2>$null
    Write-Host "✅ Firestore default database already exists." -ForegroundColor Green
} catch {
    Write-Host "⚠️ Creating Firestore database in region $REGION..." -ForegroundColor Yellow
    gcloud firestore databases create --location=$REGION --type=firestore-native
}

# 5. Deploy Cloud Run Service
Write-Host "`n[5/5] Deploying backend to Cloud Run ($SERVICE_NAME in $REGION)..." -ForegroundColor Yellow
gcloud run deploy $SERVICE_NAME `
    --source ./backend `
    --region $REGION `
    --allow-unauthenticated `
    --set-env-vars GCP_PROJECT_ID=$PROJECT_ID,MAX_DEVICES_PER_LICENSE=1

if ($LASTEXITCODE -eq 0) {
    $SERVICE_URL = (gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)").Trim()
    Write-Host "`n====================================================" -ForegroundColor Green
    Write-Host "🎉 DEPLOYMENT BAŞARIYLA TAMAMLANDI!" -ForegroundColor Green
    Write-Host "📡 Cloud Run Canlı URL: $SERVICE_URL" -ForegroundColor Cyan
    Write-Host "🔑 Sağlık Kontrolü: $SERVICE_URL/api/health" -ForegroundColor Cyan
    Write-Host "🛍️ Shopify Webhook URL: $SERVICE_URL/api/shopify/order-paid" -ForegroundColor Cyan
    Write-Host "====================================================" -ForegroundColor Green
} else {
    Write-Error "Cloud Run deployment başarısız oldu. Lütfen logları inceleyiniz."
}
