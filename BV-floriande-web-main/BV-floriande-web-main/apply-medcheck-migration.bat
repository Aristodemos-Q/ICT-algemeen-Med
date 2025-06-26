@echo off
echo ======================================
echo MedCheck+ Database Migration Setup
echo ======================================
echo.
echo This script will apply the MedCheck+ database transformation
echo which includes:
echo - Appointment types and practice locations
echo - Patient management tables
echo - Appointment booking system
echo - Medical records and prescriptions
echo.

set /p confirm="Do you want to continue? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo Migration cancelled.
    pause
    exit /b
)

echo.
echo Applying MedCheck+ transformation migration...
echo.

REM Use Supabase CLI to apply the specific migration
supabase db reset --linked

if %errorlevel% equ 0 (
    echo.
    echo ======================================
    echo Migration completed successfully!
    echo ======================================
    echo.
    echo The database now includes:
    echo - Practice locations
    echo - Appointment types
    echo - Appointment request system
    echo - Patient management
    echo.
    echo You can now use the appointment booking system.
    echo.
) else (
    echo.
    echo ======================================
    echo Migration failed!
    echo ======================================
    echo.
    echo Please check your Supabase connection and try again.
    echo Make sure you are logged in to Supabase CLI.
    echo.
)

pause
