@echo off
chcp 65001 >nul
echo Установка зависимостей...
call npm install
if %errorlevel% == 0 (
    echo.
    echo Установка завершена успешно!
    echo Теперь вы можете запустить проект командой: npm run dev
) else (
    echo.
    echo Ошибка при установке. Убедитесь, что Node.js установлен.
    pause
)

