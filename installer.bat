@echo off
REM ============================================================
REM  installer.bat - Installation d'Angel's Launcher (Windows)
REM  1) verifie / installe Node.js  2) installe les dependances
REM  3) cree les raccourcis (Bureau + menu Demarrer)
REM  4) propose de generer un .exe autonome (installateur + portable)
REM ============================================================
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0"
title Installation - Angel's Launcher
echo.
echo  ===== Installation d'Angel's Launcher =====
echo.

REM --- 1) Node.js ---------------------------------------------------------
where node >nul 2>nul
if errorlevel 1 set "PATH=%PATH%;%ProgramFiles%\nodejs"
where node >nul 2>nul
if errorlevel 1 (
  echo [1/4] Node.js est introuvable.
  where winget >nul 2>nul
  if errorlevel 1 (
    echo.
    echo  winget n'est pas disponible. Installez Node.js LTS depuis https://nodejs.org
    echo  puis relancez ce script.
    pause & exit /b 1
  )
  echo       Installation de Node.js LTS via winget ^(une validation administrateur peut apparaitre^)...
  winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
  set "PATH=%PATH%;%ProgramFiles%\nodejs"
  where node >nul 2>nul
  if errorlevel 1 (
    echo.
    echo  Node.js vient d'etre installe : FERMEZ cette fenetre puis relancez installer.bat.
    pause & exit /b 0
  )
)
for /f %%v in ('node -p "process.versions.node.split('.')[0]"') do set "NODEMAJOR=%%v"
if %NODEMAJOR% LSS 22 (
  echo [ERREUR] Node.js 22.12 ou superieur est requis ^(Electron 45^) ^(version detectee : %NODEMAJOR%^).
  echo          Mettez a jour depuis https://nodejs.org puis relancez ce script.
  pause & exit /b 1
)
echo [1/4] Node.js %NODEMAJOR%.x detecte.

REM --- 2) Dependances -----------------------------------------------------
echo [2/4] Installation des dependances ^(telechargement d'Electron, ~100 Mo^)...
call npm install --no-audit --no-fund
if errorlevel 1 (
  echo.
  echo [ERREUR] npm install a echoue. Verifiez votre connexion / proxy puis relancez.
  pause & exit /b 1
)
REM Filet de securite : telecharge le binaire Electron si le script post-installation a ete ignore
if not exist "node_modules\electron\dist\electron.exe" call node node_modules\electron\install.js
if not exist "node_modules\electron\dist\electron.exe" (
  echo [ERREUR] Electron n'a pas ete installe correctement.
  pause & exit /b 1
)

REM --- 3) Raccourcis ------------------------------------------------------
echo [3/4] Creation des raccourcis...
set "APPDIR=%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$d=$env:APPDIR.TrimEnd('\');" ^
  "$w=New-Object -ComObject WScript.Shell;" ^
  "foreach($dir in @([Environment]::GetFolderPath('Desktop'),[Environment]::GetFolderPath('Programs'))){" ^
  "  $s=$w.CreateShortcut($dir+'\Angels Launcher.lnk');" ^
  "  $s.TargetPath=$d+'\node_modules\electron\dist\electron.exe';" ^
  "  $s.Arguments='.'; $s.WorkingDirectory=$d;" ^
  "  $s.IconLocation=$d+'\assets\icon.ico'; $s.Description='Angel''s Launcher'; $s.Save() }"
if errorlevel 1 (echo       Raccourcis non crees ^(utilisez lancer.bat^).) else (echo       Raccourci "Angels Launcher" ajoute au Bureau et au menu Demarrer.)

REM --- 4) Executable autonome (facultatif) --------------------------------
echo.
echo [4/4] Generer aussi un .exe autonome ^(installateur + version portable^) dans le dossier dist\ ?
echo       ^(Compter 2 a 5 minutes. Si une erreur de liens symboliques apparait, activez le
echo        "Mode developpeur" de Windows ou relancez ce script en administrateur.^)
choice /c ON /n /m "      Generer le .exe maintenant ? [O/N] "
if errorlevel 2 goto fin
set "CSC_IDENTITY_AUTO_DISCOVERY=false"
call npm run dist
if errorlevel 1 (
  echo [AVERTISSEMENT] La generation du .exe a echoue ; l'application reste utilisable via le raccourci ou lancer.bat.
) else (
  echo       Termine : voir le dossier dist\ ^(installateur "Setup" et version "portable"^).
  start "" "%~dp0dist"
)

:fin
echo.
echo  ===== Installation terminee =====
echo  Lancez l'application avec le raccourci "Angels Launcher" ou en double-cliquant sur lancer.bat
echo.
pause
endlocal
