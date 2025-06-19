##
# MedCheck+ Development Server Starter (PowerShell)
# Enhanced for better error handling and directory detection
##

Write-Host "Starting MedCheck+ development server..." -ForegroundColor Cyan
$projectPath = Join-Path $PSScriptRoot "BV-floriande-web-main\BV-floriande-web-main"
$srcDir = Join-Path $projectPath "src"
$appDir = Join-Path $srcDir "app"
$envFile = Join-Path $projectPath ".env.local"

Write-Host "Project path: $projectPath" -ForegroundColor Green
Write-Host "App directory: $appDir" -ForegroundColor Green

# Check if .env.local exists, create it if not
if (-Not (Test-Path $envFile)) {
    Write-Host ".env.local file not found, creating a template..." -ForegroundColor Yellow
    $envTemplate = @"
# MedCheck+ Environment Configuration
# Replace with your actual Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
"@
    try {
        Set-Content -Path $envFile -Value $envTemplate -ErrorAction Stop
        Write-Host "Created .env.local template. Please edit with your actual credentials." -ForegroundColor Green
    } catch {
        Write-Host "Could not create .env.local template: $_" -ForegroundColor Yellow
    }
}

# Check if app directory exists
if (-Not (Test-Path $appDir)) {
    Write-Host "App directory not found in: $appDir" -ForegroundColor Red
    Write-Host "Searching for app directory..." -ForegroundColor Yellow
    
    # Try to find the app directory
    $possibleDirs = @(
        (Join-Path $PSScriptRoot "BV-floriande-web-main\src\app"),
        (Join-Path $PSScriptRoot "BV-floriande-web-main\BV-floriande-web-main\src\app"),
        (Join-Path $PSScriptRoot "BV-floriande-web-main\app")
    )
    
    $foundDir = $null
    foreach ($dir in $possibleDirs) {
        if (Test-Path $dir) {
            $foundDir = $dir
            Write-Host "Found alternative app directory: $foundDir" -ForegroundColor Green
            # Update the project path based on the found app directory
            $projectPath = (Get-Item $dir).Parent.Parent.FullName
            Write-Host "Updated project path: $projectPath" -ForegroundColor Green
            break
        }
    }
    
    if (-Not $foundDir) {
        Write-Host "Could not find app directory anywhere. Please check your project structure." -ForegroundColor Red
        exit 1
    }
}

# Change to the project directory
try {
    Set-Location -Path $projectPath -ErrorAction Stop
} catch {
    Write-Host "Could not change to project directory: $_" -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
if (-Not (Test-Path (Join-Path $projectPath "node_modules"))) {
    Write-Host "node_modules not found, running npm install..." -ForegroundColor Yellow
    
    # Check if npm is installed
    try {
        npm --version | Out-Null
    } catch {
        Write-Host "npm not installed. Install Node.js and npm first." -ForegroundColor Red
        exit 1
    }
    
    # Install dependencies
    try {
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "npm install failed with code $LASTEXITCODE" -ForegroundColor Red
            exit $LASTEXITCODE
        }
    } catch {
        Write-Host "Error running npm install: $_" -ForegroundColor Red
        exit 1
    }
}

# Check if Next.js is installed
$nextBin = Join-Path $projectPath "node_modules\.bin\next"
$nextBinCmd = Join-Path $projectPath "node_modules\.bin\next.cmd"
if ((-Not (Test-Path $nextBin)) -and (-Not (Test-Path $nextBinCmd))) {
    Write-Host "Next.js not found, installing..." -ForegroundColor Yellow
    try {
        npm install next@latest react@latest react-dom@latest
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Next.js installation failed with code $LASTEXITCODE" -ForegroundColor Red
            exit $LASTEXITCODE
        }
    } catch {
        Write-Host "Error installing Next.js: $_" -ForegroundColor Red
        exit 1
    }
}

# Start the Next.js dev server
Write-Host "Starting Next.js development server..." -ForegroundColor Cyan
try {
    $env:NEXT_TELEMETRY_DISABLED = 1
    # Next.js needs to be in the directory containing the Next.js project
    # Try different ports if 3000 is already in use
    $ports = @(3000, 3001, 3002, 3003, 4000)
    $successfulStart = $false
    
    foreach ($port in $ports) {
        Write-Host "Attempting to start on port $port..." -ForegroundColor Yellow
        try {
            # Run the command in the background so we can catch errors
            $job = Start-Job -ScriptBlock {
                param($dir, $port)
                Set-Location -Path $dir
                npx next dev --port $port
            } -ArgumentList $projectPath, $port
            
            # Wait a bit to see if it starts
            Start-Sleep -Seconds 2
            
            # Check if the job is still running (meaning the port is available)
            if (Get-Job -Id $job.Id | Where-Object { $_.State -eq "Running" }) {
                Write-Host "Server started successfully on port $port" -ForegroundColor Green
                # Bring the job to the foreground by receiving its output
                Receive-Job -Job $job -Wait
                $successfulStart = $true
                break
            }
            else {
                # Job failed, get the error message
                $result = Receive-Job -Job $job
                if ($result -match "EADDRINUSE") {
                    Write-Host "Port $port is already in use, trying next port..." -ForegroundColor Yellow
                }
                else {
                    Write-Host "Failed to start on port $port: $result" -ForegroundColor Red
                }
                Remove-Job -Job $job
            }
        }
        catch {
            Write-Host "Error trying port $port: $_" -ForegroundColor Red
        }
    }
    
    if (-not $successfulStart) {
        Write-Host "Failed to start the server on any port. Please check if there are other servers running." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error starting Next.js server: $_" -ForegroundColor Red
    exit 1
}
