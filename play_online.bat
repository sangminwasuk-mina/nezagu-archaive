@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Kaiten City Online Launcher

echo ========================================================
echo    카이텐 시티 - 외부 온라인 멀티플레이 실행기
echo ========================================================
echo.
echo [1] 로컬 게임 서버(8080) 실행 중...
start "Kaiten Game Server" cmd /k "cd /d ""%~dp0"" && node server.js"

echo [2] 친구 접속용 공개 인터넷 링크 생성 중... (잠시만 기다려주세요)
echo.
echo ========================================================
echo  ※ 아래에 출력되는 'your url is: https://...' 링크를
echo     복사해서 친구에게 보내주면 다른 와이파이에서도 접속됩니다!
echo  ※ 게임하는 동안 이 창을 닫지 마세요.
echo ========================================================
echo.
npx -y localtunnel --port 8080
pause
