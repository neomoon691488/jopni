@echo off
chcp 65001 >nul
echo Запуск сервера разработки...
echo Откройте браузер по адресу: http://localhost:3000
echo.
call npm run dev

