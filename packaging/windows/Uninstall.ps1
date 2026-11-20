# Uninstall.ps1 - Desinstalle Angel's Launcher (raccourcis, entree Windows, dossier d'installation).
# Vos donnees (bibliotheque, reglages) ne sont supprimees que si vous le demandez.

$nom    = 'Angels Launcher'
$dest   = $PSScriptRoot
$cleReg = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\AngelsLauncher'

Write-Host ''
Write-Host "  ===== Desinstallation d'Angel's Launcher =====" -ForegroundColor Cyan
$rep = Read-Host '  Supprimer aussi vos donnees (bibliotheque, reglages) ? [o/N]'

# Fermer l'application
Get-Process -ErrorAction SilentlyContinue |
    Where-Object { $_.Path -and $_.Path.StartsWith($dest, [StringComparison]::OrdinalIgnoreCase) } |
    Stop-Process -Force -ErrorAction SilentlyContinue

# Raccourcis et entree "Applications installees"
foreach ($dossier in @([Environment]::GetFolderPath('Desktop'), [Environment]::GetFolderPath('Programs'))) {
    Remove-Item (Join-Path $dossier "$nom.lnk") -Force -ErrorAction SilentlyContinue
}
Remove-Item $cleReg -Recurse -Force -ErrorAction SilentlyContinue

if ($rep -match '^[oOyY]') {
    Remove-Item (Join-Path $env:APPDATA 'angels-launcher') -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host '  Donnees supprimees.'
}

# Ce script se trouve dans le dossier a supprimer : on differe la suppression de quelques secondes.
Start-Process cmd.exe -ArgumentList "/c ping 127.0.0.1 -n 3 >nul & rmdir /s /q `"$dest`"" -WindowStyle Hidden
Write-Host '  Angel''s Launcher a ete desinstalle.' -ForegroundColor Green
Start-Sleep -Seconds 2
