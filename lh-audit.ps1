# Deterministic Lighthouse harness: kill -> build -> verify -> serve -> verify build id -> 3x audit
param([string]$Tag = "run", [string]$Url = "http://localhost:3009")
$ErrorActionPreference = "Continue"
$p = (Get-NetTCPConnection -LocalPort 3009 -State Listen -ErrorAction SilentlyContinue).OwningProcess | Select-Object -First 1
if ($p) { cmd /c "taskkill /F /PID $p" | Out-Null; Start-Sleep -Seconds 2 }
if ((Get-NetTCPConnection -LocalPort 3009 -State Listen -ErrorAction SilentlyContinue)) { Write-Output "FATAL: port 3009 still busy"; exit 1 }
cmd /c "npx next build --webpack > lh-build.log 2>&1"
if ($LASTEXITCODE -ne 0) { Write-Output "FATAL: build failed"; Get-Content lh-build.log -Tail 5; exit 1 }
$buildId = Get-Content .next/BUILD_ID
Write-Output "BUILD_ID: $buildId"
Start-Process -NoNewWindow -FilePath "cmd" -ArgumentList "/c","npx next start -p 3009 > lh-server.log 2>&1"
Start-Sleep -Seconds 8
$html = (Invoke-WebRequest -Uri "http://localhost:3009" -UseBasicParsing -TimeoutSec 30).Content
if ($html -notmatch [regex]::Escape($buildId)) { Write-Output "FATAL: server not serving current build"; exit 1 }
Write-Output "server verified on build $buildId"
foreach ($i in 1..3) {
  npx lighthouse $Url --only-categories=performance --form-factor=mobile --screenEmulation.mobile --chrome-flags="--headless=new" --output=json --output-path="lh-$Tag-$i.json" --quiet 2>$null | Out-Null
  Write-Output "audit $i done"
}
node -e "const m=['first-contentful-paint','largest-contentful-paint','speed-index','total-blocking-time','cumulative-layout-shift'];const runs=[1,2,3].map(i=>require('./lh-$Tag-'+i+'.json'));const med=a=>a.sort((x,y)=>x-y)[1];console.log('$Tag | perf', med(runs.map(r=>Math.round(r.categories.performance.score*100))), '| FCP', (med(runs.map(r=>r.audits[m[0]].numericValue))/1000).toFixed(1)+'s | LCP', (med(runs.map(r=>r.audits[m[1]].numericValue))/1000).toFixed(1)+'s | SI', (med(runs.map(r=>r.audits[m[2]].numericValue))/1000).toFixed(1)+'s | TBT', Math.round(med(runs.map(r=>r.audits[m[3]].numericValue)))+'ms | CLS', med(runs.map(r=>r.audits[m[4]].numericValue)).toFixed(3))"
