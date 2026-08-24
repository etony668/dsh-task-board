# Install the dsh-task-board plugin into the current DSH runtime (Windows PowerShell).
# Usage: .\reinstall.ps1            (run again after every DSH upgrade)
#        .\reinstall.ps1 -RuntimeRoot "C:\path\to\runtime"   (manual override)
param(
    [string]$RuntimeRoot = ""
)
$ErrorActionPreference = "Stop"

$PluginDir = (Resolve-Path $PSScriptRoot).Path

# --- Locate the DSH runtime root -------------------------------------------
$candidates = @()
if ($RuntimeRoot) { $candidates += $RuntimeRoot }
$candidates += "$env:USERPROFILE\AppData\Local\DeepSeek Harness Glass\runtime"
$candidates += "$env:USERPROFILE\.dsh\runtime"

$Root = $null
foreach ($d in $candidates) {
    if (Test-Path (Join-Path $d "current")) { $Root = $d; break }
}
if (-not $Root) {
    Write-Host "DSH runtime directory not found. Specify it explicitly:" -ForegroundColor Yellow
    Write-Host '  .\reinstall.ps1 -RuntimeRoot "C:\path\to\DeepSeek Harness Glass\runtime"' -ForegroundColor Yellow
    exit 1
}

# Resolve the active version: "current" may be a symlink/junction with a
# relative target like "versions\b150a..." or a plain directory marker.
$current = Get-Item (Join-Path $Root "current")
$version = $null
if ($current.Target) {
    $version = ($current.Target -replace '^.*versions[/\\]', '')
}
if (-not $version) { $version = $current.Name }
Write-Host "Runtime root: $Root"
Write-Host "Active version: $version"

# --- 1) Copy into the runtime node_modules --------------------------------
$Target = Join-Path $Root "versions\$version\node_modules\@etony668\dsh-task-board"
$TargetDir = Split-Path $Target -Parent
New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null
if (Test-Path $Target) { Remove-Item -Recurse -Force $Target }
Copy-Item -Recurse -Force (Join-Path $PluginDir "*") $Target
Write-Host "Installed to $Target"

# --- 2) Profile fallback link (node resolves plugins from ~/.dsh/profiles/web).
#        A junction needs no admin rights; fall back to a copy if it fails.
$ProfilesNm = "$env:USERPROFILE\.dsh\profiles\node_modules\@etony668"
New-Item -ItemType Directory -Force -Path $ProfilesNm | Out-Null
$LinkPath = Join-Path $ProfilesNm "dsh-task-board"
if (Test-Path $LinkPath) {
    Remove-Item -Recurse -Force $LinkPath
}
try {
    New-Item -ItemType Junction -Path $LinkPath -Target $Target | Out-Null
    Write-Host "Linked $LinkPath -> $Target"
} catch {
    Copy-Item -Recurse -Force $Target $LinkPath
    Write-Host "Junction failed, copied fallback to $LinkPath"
}

# --- 3) Ensure the patch entry exists (hint only; install.ps1 writes it) ---
$Patch = "$env:USERPROFILE\.dsh\cordis.patch.yml"
if (Test-Path $Patch) {
    $has = Select-String -Path $Patch -Pattern "dsh-task-board" -Quiet
    if (-not $has) {
        Write-Host "Add this to $Patch (or run .\install.ps1 to do it automatically):" -ForegroundColor Yellow
        Write-Host "  - insert:" -ForegroundColor Yellow
        Write-Host "      - id: task-board" -ForegroundColor Yellow
        Write-Host "        name: '@etony668/dsh-task-board'" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Done. Refresh the DSH page (or restart DSH) and the 'Task Board' tab appears after 'Trajectory'."
