@echo off
REM Desinstaller.bat - Lance la desinstallation d'Angel's Launcher.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Uninstall.ps1"
exit /b
