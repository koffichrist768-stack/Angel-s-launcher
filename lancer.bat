@echo off
REM lancer.bat - Demarre Angel's Launcher (Windows) sans laisser de console ouverte.
setlocal
cd /d "%~dp0"
if not exist "node_modules\electron\dist\electron.exe" (
  echo Angel's Launcher n'est pas encore installe. Lancez d'abord installer.bat.
  pause & exit /b 1
)
start "" "node_modules\electron\dist\electron.exe" .
endlocal
