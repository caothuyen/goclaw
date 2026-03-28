@echo off
REM Apply custom patches to GoClaw after update
REM Usage: Run this after pulling latest code from upstream

echo ========================================
echo Applying GoClaw Custom Patches
echo ========================================

cd /d "%~dp0.."

REM Check if git is available
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git not found. Please install Git.
    exit /b 1
)

REM Apply each patch
for %%f in (patches\*.patch) do (
    echo.
    echo Checking: %%f
    git apply --check "%%f" >nul 2>&1
    if errorlevel 1 (
        echo SKIP: Patch %%f already applied or conflicts exist
    ) else (
        echo Applying: %%f
        git apply "%%f"
        if errorlevel 1 (
            echo ERROR: Failed to apply %%f
            exit /b 1
        ) else (
            echo SUCCESS: %%f applied
        )
    )
)

echo.
echo ========================================
echo All patches applied successfully!
echo ========================================
echo.
echo Next steps:
echo   1. docker-compose build
echo   2. docker-compose up -d
echo.
