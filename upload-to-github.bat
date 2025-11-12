@echo off
chcp 65001 >nul
echo ========================================
echo Загрузка проекта в GitHub
echo ========================================
echo.

echo Шаг 1: Инициализация Git репозитория...
call git init
if %errorlevel% neq 0 (
    echo ОШИБКА: Git не установлен или не в PATH
    echo Установите Git с https://git-scm.com
    pause
    exit /b 1
)

echo.
echo Шаг 2: Добавление всех файлов...
call git add .
if %errorlevel% neq 0 (
    echo ОШИБКА при добавлении файлов
    pause
    exit /b 1
)

echo.
echo Шаг 3: Создание первого коммита...
call git commit -m "Initial commit - School Social Network"
if %errorlevel% neq 0 (
    echo ОШИБКА при создании коммита
    pause
    exit /b 1
)

echo.
echo ========================================
echo Готово! Теперь выполните следующие шаги:
echo ========================================
echo.
echo 1. Создайте репозиторий на GitHub:
echo    - Зайдите на https://github.com
echo    - Нажмите "New repository"
echo    - Назовите репозиторий (например: school-social-network)
echo    - НЕ добавляйте README, .gitignore или лицензию
echo    - Нажмите "Create repository"
echo.
echo 2. Скопируйте URL вашего репозитория
echo    (будет показан на странице создания, например:)
echo    https://github.com/ваш-username/school-social-network.git
echo.
echo 3. Выполните следующие команды вручную:
echo    git branch -M main
echo    git remote add origin ВАШ-URL-РЕПОЗИТОРИЯ
echo    git push -u origin main
echo.
echo Или используйте GitHub Desktop для загрузки
echo.
pause

