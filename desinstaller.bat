@echo off
REM desinstaller.bat - Supprime les raccourcis et les dependances installees (node_modules, dist).
REM Vos donnees (bibliotheque, reglages) dans %APPDATA%\angels-launcher sont CONSERVEES.
chcp 65001 >nul
cd /d "%~dp0"
choice /c ON /n /m "Supprimer raccourcis, node_modules et dist ? [O/N] "
if errorlevel 2 exit /b 0
powershell -NoProfile -Command "Remove-Item ([Environment]::GetFolderPath('Desktop')+'\Angels Launcher.lnk'),([Environment]::GetFolderPath('Programs')+'\Angels Launcher.lnk') -ErrorAction SilentlyContinue"
if exist node_modules rmdir /s /q node_modules
if exist dist rmdir /s /q dist
echo Termine. Pour effacer aussi vos donnees, supprimez le dossier %%APPDATA%%\angels-launcher
pause
