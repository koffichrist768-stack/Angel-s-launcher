@echo off
REM ============================================================
REM  INSTALLER.bat - Installe Angel's Launcher pour l'utilisateur courant
REM  (aucun droit administrateur, aucun prerequis : Node.js n'est pas necessaire)
REM ============================================================
setlocal
cd /d "%~dp0"
title Installation - Angel's Launcher

if not exist "app\Angel's Launcher.exe" (
  echo.
  echo  [ERREUR] Les fichiers de l'application sont introuvables.
  echo  Faites un clic droit sur le zip, puis "Extraire tout", et lancez INSTALLER.bat
  echo  depuis le dossier extrait ^(ne le lancez pas depuis l'interieur du zip^).
  echo.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Install-AngelsLauncher.ps1"
if errorlevel 1 (
  echo.
  echo  L'installation a echoue. Consultez le message ci-dessus.
  pause
  exit /b 1
)
endlocal
