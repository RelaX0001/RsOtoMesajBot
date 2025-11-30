@echo off
title RS Node.js NPM Kutuphane Yukleyici

echo Node.js kontrol Ediliyor...
node -v >nul 2>&1

IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js Bulunamadi!
    echo Lutfen Once nodejs_indirici.bat İle Node.js Kurun.
    pause
    exit /b
)

echo Node.js Bulundu.
echo.
echo Gerekli NPM Kutuphaneleri Yukleniyor...
echo.

npm install dotenv input telegraf telegram

IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Kutuphaneler Yuklenirken Hata Olustu!
    pause
    exit /b
)

echo.
echo Kutuphaneler Basariyla Yuklendi!
echo.
pause
exit

