Write-Host "======================================" -ForegroundColor Cyan
Write-Host "MedCheck+ Database Migration Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will apply the MedCheck+ database transformation" -ForegroundColor Yellow
Write-Host "which includes:" -ForegroundColor Yellow
Write-Host "- Appointment types and practice locations" -ForegroundColor Green
Write-Host "- Patient management tables" -ForegroundColor Green
Write-Host "- Appointment booking system" -ForegroundColor Green
Write-Host "- Medical records and prescriptions" -ForegroundColor Green
Write-Host ""

$confirm = Read-Host "Do you want to continue? (Y/N)"
if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "Migration cancelled." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

Write-Host ""
Write-Host "Applying MedCheck+ transformation migration..." -ForegroundColor Yellow
Write-Host ""

try {
    # Reset database to apply all migrations
    $result = supabase db reset --linked
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "======================================" -ForegroundColor Green
        Write-Host "Migration completed successfully!" -ForegroundColor Green
        Write-Host "======================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "The database now includes:" -ForegroundColor Green
        Write-Host "- Practice locations" -ForegroundColor White
        Write-Host "- Appointment types" -ForegroundColor White
        Write-Host "- Appointment request system" -ForegroundColor White
        Write-Host "- Patient management" -ForegroundColor White
        Write-Host ""
        Write-Host "You can now use the appointment booking system." -ForegroundColor Green
        Write-Host ""
    } else {
        throw "Migration failed with exit code $LASTEXITCODE"
    }
} catch {
    Write-Host ""
    Write-Host "======================================" -ForegroundColor Red
    Write-Host "Migration failed!" -ForegroundColor Red
    Write-Host "======================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check your Supabase connection and try again." -ForegroundColor Yellow
    Write-Host "Make sure you are logged in to Supabase CLI." -ForegroundColor Yellow
    Write-Host ""
}

Read-Host "Press Enter to exit"
