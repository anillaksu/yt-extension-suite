# Otomatik hazırla, Anıl onaylasın: ürün verisini ayrı dalda günceller ve PR açar.
# Canlı (master) DEĞİŞMEZ; PR'ı birleştirmek = onay = yayın (GitHub Pages).
# Zamanlanmış görev: "UrunSenkronPR" (günde bir + oturum açılışı). Günlük: logs\urun-pr.log (çalışma ağacının dışında).
param(
  [string]$Depo = 'C:\Users\anil\yt-extension-suite',
  [string]$Calisma = (Join-Path $env:LOCALAPPDATA 'urun-senkron\calisma'),
  [string]$Dal = 'urun-guncelleme',
  [switch]$Deneme   # push/PR yapmaz; yalnız ne değişeceğini yazar
)
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.Encoding]::UTF8   # node ciktisi gunlukte bozulmasin
$gunluk = Join-Path (Split-Path $Calisma) 'urun-pr.log'
New-Item -ItemType Directory -Force (Split-Path $Calisma) | Out-Null
function Yaz($m) { "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') $m" | Add-Content -Path $gunluk -Encoding utf8; $m }
function GitCalistir { & git.exe @args; if ($LASTEXITCODE -ne 0) { throw "git $($args -join ' ') -> $LASTEXITCODE" } }

try {
  GitCalistir -C $Depo fetch -q origin master
  if (-not (Test-Path (Join-Path $Calisma '.git'))) { Git -C $Depo worktree add -q --detach $Calisma origin/master }
  # Otomasyona ayrılmış çalışma ağacı: her tur canlının en güncel haliyle başlar
  GitCalistir -C $Calisma checkout -q -B $Dal origin/master
  GitCalistir -C $Calisma reset -q --hard origin/master

  $cikti = & node (Join-Path $Calisma 'araclar\urun-senkron.mjs') 2>&1
  if ($LASTEXITCODE -ne 0) { throw "urun-senkron hata: $($cikti -join ' | ')" }
  Yaz ($cikti -join ' | ') | Out-Null

  GitCalistir -C $Calisma add -A
  & git.exe -C $Calisma diff --cached --quiet
  if ($LASTEXITCODE -eq 0) { Yaz 'degisiklik yok; PR acilmadi'; exit 0 }

  if ($Deneme) { Yaz ('DENEME: degisecek -> ' + ((& git.exe -C $Calisma diff --cached --stat) -join ' | ')); exit 0 }
  GitCalistir -C $Calisma commit -q -m "Ürün verisi güncellendi (otomatik hazırlık)" -m ($cikti -join "`n")
  GitCalistir -C $Calisma push -q -f origin $Dal

  $acik = & gh pr list -R anillaksu/yt-extension-suite --head $Dal --state open --json number -q '.[0].number'
  $cit = '```'
  $govde = @(
    'Otomatik hazırlandı: araclar/urun-pr.ps1 (registry + eklenti manifestleri).', '',
    $cit, ($cikti -join "`n"), $cit, '',
    '**Birleştirmek = canlıya yayın.** Değişen dosyalar yukarıda.'
  ) -join "`n"
  if ($acik) {
    & gh pr edit $acik -R anillaksu/yt-extension-suite --body $govde | Out-Null
    Yaz "PR #$acik guncellendi"
  } else {
    $url = & gh pr create -R anillaksu/yt-extension-suite --base master --head $Dal --title "Ürün verisi güncellendi — onayın bekleniyor" --body $govde
    Yaz "PR acildi: $url"
  }
} catch {
  Yaz "HATA: $($_.Exception.Message)"
  exit 1
}
