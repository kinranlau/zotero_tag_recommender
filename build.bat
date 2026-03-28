@echo off
echo ================================
echo Building Zotero Tag Recommender
echo ================================
echo.

echo Running npm run build...
call npm run build

if %errorlevel% equ 0 (
    echo.
    echo ================================
    echo ✓ Build successful!
    echo ================================
    echo.
    echo The extension is ready in .scaffold\build\
    echo.
    echo Next steps:
    echo 1. Open Zotero 7
    echo 2. Go to Tools ^> Plugins
    echo 3. Click gear icon ^> Install Add-on From File
    echo 4. Select the .xpi file from .scaffold\build\
    echo 5. Restart Zotero
    echo 6. Configure API key in Edit ^> Settings ^> Tag Recommender
    echo.
) else (
    echo.
    echo ================================
    echo ✗ Build failed!
    echo ================================
    echo Please check the errors above.
)

pause
