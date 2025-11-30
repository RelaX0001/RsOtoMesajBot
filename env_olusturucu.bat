@echo off
title .ENV Olusturucu

echo .env dosyasi olusturuluyor...

REM .env Dosyasi Mevcut Klasore Olusturulur
(
    echo TELEGRAM_API_ID=
    echo TELEGRAM_API_HASH=
    echo TELEGRAM_BOT_TOKEN=
    echo BOT_OWNER_ID=
    echo DEFAULT_INTERVAL_MINUTES=1
) > ".env"

echo .env Dosyasi Basariyla Olusturuldu!
pause
exit