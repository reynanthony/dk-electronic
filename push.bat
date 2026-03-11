@echo off
echo ========================================
echo   DK Electronic - Push to GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo Verificando cambios...
git status --short

if "%~1"=="" (
    set /p MENSAJE="Mensaje del commit (ENTER para usar默认值): "
    if "!MENSAJE!"=="" set MENSAJE=Update products from local admin
) else (
    set MENSAJE=%~1
)

echo.
echo Haciendo commit...
git add -A
git commit -m "!MENSAJE!"

if errorlevel 1 (
    echo.
    echo No hay cambios para commitear.
    pause
    exit /b 1
)

echo.
echo Pusheando a GitHub...
git push origin main

if errorlevel 1 (
    echo.
    echo Error al pushear. Puede que necesites hacer git pull primero.
    echo.
    set /p PULL="¿Hacer pull y rebase? (s/n): "
    if /i "!PULL!"=="s" (
        echo.
        echo Haciendo pull...
        git pull --rebase origin main
        echo.
        echo Pusheando de nuevo...
        git push origin main
    )
)

echo.
echo ========================================
echo   Completado!
echo ========================================
pause
