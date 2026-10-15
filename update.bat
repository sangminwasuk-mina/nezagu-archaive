@echo off
cd /d "%~dp0"
git add .
if "%~1"=="" (
    git commit -m "Auto update: %date% %time%"
) else (
    git commit -m "%*"
)
echo ===========================================
echo [GIT] Pushing Kaiten City to GitHub main branch...
echo ===========================================
git push -u origin main
echo ===========================================
echo Done! Press any key to exit.
echo ===========================================
pause
