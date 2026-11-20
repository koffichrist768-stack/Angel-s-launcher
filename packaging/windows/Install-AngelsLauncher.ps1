# Install-AngelsLauncher.ps1
# Installe Angel's Launcher dans %LOCALAPPDATA%\Programs\AngelsLauncher (sans droits administrateur),
# cree les raccourcis (Bureau + menu Demarrer) et l'inscrit dans "Applications installees".
# Messages volontairement sans accents : la console Windows n'affiche pas toujours l'UTF-8.

$ErrorActionPreference = 'Stop'
$nom     = 'Angels Launcher'
$exe     = "Angel's Launcher.exe"
$version = '1.1.0'
$src     = Join-Path $PSScriptRoot 'app'
$dest    = Join-Path $env:LOCALAPPDATA 'Programs\AngelsLauncher'
$cleReg  = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\AngelsLauncher'

try {
    Write-Host ''
    Write-Host "  ===== Installation d'Angel's Launcher =====" -ForegroundColor Cyan
    Write-Host ''

    if (-not (Test-Path (Join-Path $src $exe))) { throw "Application introuvable dans '$src'." }

    # 1) Fermer l'application si elle tourne (cas d'une mise a jour)
    Write-Host '[1/4] Preparation...'
    Get-Process -ErrorAction SilentlyContinue |
        Where-Object { $_.Path -and $_.Path.StartsWith($dest, [StringComparison]::OrdinalIgnoreCase) } |
        Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 600

    # 2) Copie des fichiers (installation propre ; vos donnees dans %APPDATA% ne sont jamais touchees)
    Write-Host "[2/4] Copie des fichiers vers $dest ..."
    if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
    New-Item -ItemType Directory -Path $dest -Force | Out-Null
    Copy-Item (Join-Path $src '*') $dest -Recurse -Force
    foreach ($f in 'icon.ico', 'Desinstaller.bat', 'Uninstall.ps1') {
        Copy-Item (Join-Path $PSScriptRoot $f) (Join-Path $dest $f) -Force
    }
    # Retire la marque "telecharge depuis Internet" pour eviter l'alerte SmartScreen a chaque lancement
    Get-ChildItem $dest -Recurse -File -ErrorAction SilentlyContinue | Unblock-File -ErrorAction SilentlyContinue

    # 3) Raccourcis
    Write-Host '[3/4] Creation des raccourcis...'
    $wsh = New-Object -ComObject WScript.Shell
    foreach ($dossier in @([Environment]::GetFolderPath('Desktop'), [Environment]::GetFolderPath('Programs'))) {
        $lnk = $wsh.CreateShortcut((Join-Path $dossier "$nom.lnk"))
        $lnk.TargetPath       = Join-Path $dest $exe
        $lnk.WorkingDirectory = $dest
        $lnk.IconLocation     = Join-Path $dest 'icon.ico'
        $lnk.Description      = "Angel's Launcher"
        $lnk.Save()
    }

    # 4) Inscription dans Parametres > Applications installees (desinstallation propre)
    Write-Host '[4/4] Enregistrement dans Windows...'
    $tailleKo = [int]((Get-ChildItem $dest -Recurse -File | Measure-Object Length -Sum).Sum / 1KB)
    New-Item -Path $cleReg -Force | Out-Null
    $valeurs = [ordered]@{
        DisplayName     = "Angel's Launcher"
        DisplayVersion  = $version
        Publisher       = "Angel's Launcher"
        InstallLocation = $dest
        DisplayIcon     = (Join-Path $dest 'icon.ico')
        UninstallString = '"' + (Join-Path $dest 'Desinstaller.bat') + '"'
        EstimatedSize   = $tailleKo
        NoModify        = 1
        NoRepair        = 1
    }
    foreach ($k in $valeurs.Keys) { Set-ItemProperty -Path $cleReg -Name $k -Value $valeurs[$k] }

    Write-Host ''
    Write-Host '  Installation terminee !' -ForegroundColor Green
    Write-Host "  Raccourci '$nom' ajoute au Bureau et au menu Demarrer."
    Write-Host ''
    $rep = Read-Host '  Lancer Angel''s Launcher maintenant ? [O/n]'
    if ($rep -notmatch '^[nN]') { Start-Process (Join-Path $dest $exe) -WorkingDirectory $dest }
}
catch {
    Write-Host ''
    Write-Host "  [ERREUR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
