@echo off
title RS Node.js Otomatik Kurulum
setlocal enableextensions

echo Node.js Kontrol Ediliyor...
node -v >nul 2>&1

IF %ERRORLEVEL% NEQ 0 (
    echo ----------------------------------------------
    echo   Node.js Bulunamadi!
    echo   Otomatik Indirme Ve Kurulum Baslatiliyor...
    echo ----------------------------------------------

    echo Node.js Indiriliyor...

    powershell -NoLogo -NoProfile -Command ^
        "$url='https://nodejs.org/dist/v20.12.2/node-v20.12.2-x64.msi';" ^
        "(New-Object System.Net.WebClient).DownloadFile($url,'node_setup.msi')"

    IF NOT EXIST node_setup.msi (
        echo ❌ Node.js İndirilemedi! İnternet Baglantisini Kontrol Edin.
        pause
        exit /b
    )

    echo Node.js Kuruluyor...
    msiexec /i node_setup.msi /qn /norestart

    echo Kurulum Tamamlandi.
    timeout /t 2 >nul
)

echo.
echo Kurulum Tamamlandi. Lutfen Herhangi Bir Tusa Basiniz.
pause
exit

