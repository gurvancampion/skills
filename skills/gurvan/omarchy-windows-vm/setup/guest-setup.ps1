# One-time Windows guest setup for winvm. Run as Administrator inside the VM:
#   powershell -ExecutionPolicy Bypass -File \\host.lan\Data\winvm-guest-setup.ps1 -PublicKey '<winvm key>'
# Safe to re-run.
param([Parameter(Mandatory = $true)][string]$PublicKey)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

Write-Host '== OpenSSH server'
if ((Get-WindowsCapability -Online -Name 'OpenSSH.Server*').State -ne 'Installed') {
  Write-Host '   downloading from Windows Update, often 5-15 minutes with no output...'
  Add-WindowsCapability -Online -Name 'OpenSSH.Server~~~~0.0.1.0' | Out-Null
}
Set-Service sshd -StartupType Automatic
Start-Service sshd
if (-not (Get-NetFirewallRule -Name 'OpenSSH-Server-In-TCP' -ErrorAction SilentlyContinue)) {
  New-NetFirewallRule -Name 'OpenSSH-Server-In-TCP' -DisplayName 'OpenSSH Server (sshd)' -Enabled True `
    -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22 | Out-Null
}

Write-Host '== Authorize the winvm key'
# Members of Administrators authenticate against this file, not ~/.ssh/authorized_keys.
$keys = "$env:ProgramData\ssh\administrators_authorized_keys"
if (-not (Test-Path $keys) -or -not (Select-String -Path $keys -SimpleMatch $PublicKey -Quiet)) {
  Add-Content -Path $keys -Value $PublicKey -Encoding ascii
}
icacls $keys /inheritance:r /grant 'Administrators:F' /grant 'SYSTEM:F' | Out-Null

Write-Host '== Worktree root, long paths, Defender exclusions'
New-Item -ItemType Directory -Force -Path 'C:\worktrees' | Out-Null
Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem' -Name LongPathsEnabled -Value 1
# Real-time scanning of node_modules makes installs several times slower.
Add-MpPreference -ExclusionPath 'C:\worktrees', "$env:LOCALAPPDATA\pnpm", "$env:LOCALAPPDATA\mise"

Write-Host '== Git, mise, PowerShell 7'
foreach ($id in 'Git.Git', 'jdx.mise', 'Microsoft.PowerShell') {
  winget install --id $id --exact --silent --accept-package-agreements --accept-source-agreements --disable-interactivity
  if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne -1978335189) { throw "winget install $id failed ($LASTEXITCODE)" } # -1978335189: already installed
}
# SSH sessions read the user PATH from the registry, so put mise shims there once.
$shims = "$env:LOCALAPPDATA\mise\shims"
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if ($userPath -notlike "*$shims*") {
  [Environment]::SetEnvironmentVariable('Path', "$shims;$userPath", 'User')
}

Restart-Service sshd
Write-Host 'Done. From Linux: winvm up && winvm run ''cmd /c ver'''
