@echo off
REM ============================================================
REM  build-setup.bat - Genere le Setup.exe d'Angel's Launcher en local (Windows)
REM  Resultat dans le dossier dist\ :
REM    Angels-Launcher-Setup-x.y.z.exe     (installateur)
REM    Angels-Launcher-Portable-x.y.z.exe  (version portable, sans installation)
REM  Prerequis : Node.js 22.12 ou superieur (exige par Electron 45). Compter 2 a 5 minutes.
REM ============================================================
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0"
title Generation du Setup - Angel's Launcher

REM --- 1) Node.js 22.12+ ---------------------------------------------------
where node >nul 2>nul
if errorlevel 1 (
  echo [ERREUR] Node.js est introuvable. Installez Node.js LTS depuis https://nodejs.org puis relancez ce script.
  pause & exit /b 1
)
node -e "const [a,b]=process.versions.node.split('.').map(Number);process.exit(a>22||(a===22&&b>=12)?0:1)"
if errorlevel 1 (
  for /f %%v in ('node -v') do echo [ERREUR] Votre Node.js est en %%v : la version 22.12 ou superieure est requise ^(Electron 45^).
  echo.
  where winget >nul 2>nul
  if not errorlevel 1 (
    echo  Mise a jour automatique possible avec winget ^(une validation administrateur peut apparaitre^).
    choice /c ON /n /m "  Installer Node.js LTS maintenant ? [O/N] "
    if not errorlevel 2 (
      winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
      echo.
      echo  Node.js est installe : FERMEZ cette fenetre puis relancez build-setup.bat.
    )
  ) else (
    echo  Installez Node.js LTS depuis https://nodejs.org puis relancez ce script.
  )
  pause & exit /b 1
)

REM --- 2) Dependances (installation propre) ---------------------------------
echo [1/3] Installation des dependances ^(telechargement d'Electron, ~100 Mo^)...
if exist node_modules (
  echo       Nettoyage de l'ancien dossier node_modules...
  rmdir /s /q node_modules 2>nul
  if exist node_modules (
    echo [ERREUR] Impossible de supprimer node_modules : un fichier est utilise.
    echo          Fermez Angel's Launcher, l'explorateur sur ce dossier, VS Code et l'antivirus ^(analyse en cours^),
    echo          supprimez le dossier node_modules a la main, puis relancez. Astuce : placez le projet hors du Bureau
    echo          ^(ex. C:\Dev\angels-launcher^) pour eviter la synchronisation OneDrive.
    pause & exit /b 1
  )
)
call npm ci --no-audit --no-fund
if errorlevel 1 (
  echo       npm ci a echoue, nouvel essai avec npm install...
  call npm install --no-audit --no-fund
)
if not exist "node_modules\.bin\electron-builder.cmd" (
  echo.
  echo [ERREUR] L'installation des dependances est incomplete ^(electron-builder absent^).
  echo          Verifiez la connexion Internet, fermez les programmes qui utilisent le dossier, puis relancez.
  pause & exit /b 1
)

REM --- 3) Tests -------------------------------------------------------------
echo [2/3] Tests...
call npm test
if errorlevel 1 ( echo [ERREUR] Les tests ont echoue : le Setup n'est pas genere. & pause & exit /b 1 )

REM --- 4) Setup -------------------------------------------------------------
echo [3/3] Generation du Setup...
set "CSC_IDENTITY_AUTO_DISCOVERY=false"
call npm run dist:win
if errorlevel 1 (
  echo.
  echo [ERREUR] La generation a echoue. Lisez le message ci-dessus. Cas frequents :
  echo          - "symlink" / "Cannot create symbolic link" : activez le Mode developpeur de Windows
  echo            ^(Parametres ^> Pour les developpeurs^) ou relancez ce script en administrateur ;
  echo          - erreur de telechargement : verifiez la connexion Internet / le proxy.
  pause & exit /b 1
)

echo.
echo  Termine : le Setup se trouve dans le dossier dist\
start "" "%~dp0dist"
pause
endlocal
