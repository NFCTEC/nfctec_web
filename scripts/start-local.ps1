# Start NFCTEC CMS locally (Windows)
$root = Split-Path -Parent $PSScriptRoot
$pgBin = Join-Path $root ".pg\pgsql\bin"
$pgData = Join-Path $root ".pg\data"

if (Test-Path "$pgBin\pg_ctl.exe") {
  $status = & "$pgBin\pg_ctl.exe" -D $pgData status 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Starting PostgreSQL..."
    & "$pgBin\pg_ctl.exe" -D $pgData -l (Join-Path $root ".pg\postgres.log") start
    Start-Sleep -Seconds 2
  } else {
    Write-Host "PostgreSQL already running"
  }
} else {
  Write-Warning "Portable PostgreSQL not found in .pg/. Run setup first or use Docker."
}

Write-Host "Starting API on http://localhost:3000 ..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\api'; npm run start:dev"

Start-Sleep -Seconds 3
Write-Host "Starting Admin on http://localhost:5173 ..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\apps\admin'; npm run dev"

Write-Host ""
Write-Host "Admin login: admin@nfctec.com / changeme123"
Write-Host "Open http://localhost:5173 in your browser"
