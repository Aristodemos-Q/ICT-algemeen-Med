@echo off
echo 🚀 Starting MedCheck+ development server...
set "projectPath=%~dp0BV-floriande-web-main\BV-floriande-web-main"
set "srcDir=%projectPath%\src"
set "appDir=%srcDir%\app"
set "envFile=%projectPath%\.env.local"

echo 📂 Project path: %projectPath%
echo 📂 App directory: %appDir%

rem Check if .env.local exists, create it if not
if not exist "%envFile%" (
    echo ⚠️ .env.local file not found, creating a template...
    (
        echo # MedCheck+ Environment Configuration
        echo # Replace with your actual Supabase credentials
        echo NEXT_PUBLIC_SUPABASE_URL=your-project-url
        echo NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
        echo SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
    ) > "%envFile%"
    echo ✅ Created .env.local template. Please edit with your actual credentials.
)

rem Check if app directory exists
if not exist "%appDir%" (
    echo ❌ App directory niet gevonden in: %appDir%
    echo 🔍 Searching for app directory...
    
    rem Try to find the app directory
    if exist "%~dp0BV-floriande-web-main\src\app" (
        set "appDir=%~dp0BV-floriande-web-main\src\app"
        set "projectPath=%~dp0BV-floriande-web-main"
        echo ✅ Found alternative app directory: %appDir%
        echo 📂 Updated project path: %projectPath%
    ) else if exist "%~dp0BV-floriande-web-main\app" (
        set "appDir=%~dp0BV-floriande-web-main\app"
        set "projectPath=%~dp0BV-floriande-web-main"
        echo ✅ Found alternative app directory: %appDir%
        echo 📂 Updated project path: %projectPath%
    ) else (
        echo ❌ Could not find app directory anywhere. Please check your project structure.
        exit /b 1
    )
)

rem Change to the project directory
cd /d "%projectPath%" || (
    echo ❌ Could not change to project directory
    exit /b 1
)

rem Check if node_modules exists
if not exist "node_modules" (
    echo 📦 node_modules niet gevonden, npm install uitvoeren...
    
    rem Check if npm is installed
    where npm >nul 2>&1 || (
        echo ❌ npm niet geïnstalleerd. Installeer Node.js en npm eerst.
        exit /b 1
    )
    
    rem Install dependencies
    call npm install || (
        echo ❌ npm install mislukt
        exit /b 1
    )
)

rem Check if Next.js is installed
if not exist "node_modules\.bin\next.cmd" (
    echo ⚠️ Next.js niet gevonden, installeren...
    call npm install next@latest react@latest react-dom@latest || (
        echo ❌ Next.js installatie mislukt
        exit /b 1
    )
)

rem Start the Next.js dev server
echo 🌐 Starting Next.js development server...
set "NEXT_TELEMETRY_DISABLED=1"
call npx next dev --port 3000
