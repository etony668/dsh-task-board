# One-click install of dsh-task-board for Windows PowerShell:
#   1. copy this package to ~\.dsh\plugins\dsh-task-board
#   2. install into the runtime node_modules + profile fallback (reinstall.ps1)
#   3. append the plugin row to ~\.dsh\cordis.patch.yml (skipped if present)
# Usage: .\install.ps1
$ErrorActionPreference = "Stop"

$PluginDir = (Resolve-Path $PSScriptRoot).Path
$HomeDsh = "$env:USERPROFILE\.dsh"
$PluginHome = "$HomeDsh\plugins\dsh-task-board"

# --- 1) Copy to ~\.dsh\plugins\dsh-task-board (skip when already there) ---
if ($PluginDir -ne $PluginHome) {
    New-Item -ItemType Directory -Force -Path (Split-Path $PluginHome -Parent) | Out-Null
    if (Test-Path $PluginHome) { Remove-Item -Recurse -Force $PluginHome }
    Copy-Item -Recurse -Force $PluginDir $PluginHome
    Write-Host "Copied plugin to $PluginHome"
    $PluginDir = $PluginHome
}

# --- 2) Install into the runtime ------------------------------------------
& (Join-Path $PluginDir "reinstall.ps1")

# --- 3) Append the patch entry --------------------------------------------
$Patch = "$HomeDsh\cordis.patch.yml"
$Entry = @(
    "- insert:",
    "    - id: task-board",
    "      name: '@deepseek-ai/dsh-task-board'"
)
$has = $false
if (Test-Path $Patch) {
    $has = Select-String -Path $Patch -Pattern "name: '@deepseek-ai/dsh-task-board'" -Quiet
}
if ($has) {
    Write-Host "cordis.patch.yml already contains the plugin row, skipped."
} else {
    $Lines = @()
    if (Test-Path $Patch) { $Lines += Get-Content $Patch }
    else { $Lines += "# DSH user patch layer: `$DSH_HOME/cordis.patch.yml" }
    $Lines += $Entry
    $Lines | Set-Content -Path $Patch -Encoding UTF8
    Write-Host "Appended plugin row to $Patch"
}

Write-Host ""
Write-Host "Done. Refresh the DSH page (or restart DSH) and the 'Task Board' tab appears after 'Trajectory'."
