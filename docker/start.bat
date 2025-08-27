@echo off
chcp 65001 >nul
echo 🚀 Starting Financial Advisor Application...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo 📝 Creating .env file from template...
    copy env.example .env
    echo ⚠️  Please edit .env file with your actual values before continuing.
    echo    You can run this script again after editing the .env file.
    pause
    exit /b 1
)

echo 📋 Choose deployment type:
echo 1) Production (with Nginx reverse proxy)
echo 2) Development (with hot reloading)
echo 3) Production without Nginx
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo 🏭 Starting production deployment with Nginx...
    docker-compose up -d
    echo ✅ Production deployment started!
    echo 🌐 Access your application at: http://localhost
    echo 📊 Backend API at: http://localhost:8080
) else if "%choice%"=="2" (
    echo 🔧 Starting development deployment...
    docker-compose -f docker-compose.dev.yml up -d
    echo ✅ Development deployment started!
    echo 🌐 Access your application at: http://localhost:3000
    echo 📊 Backend API at: http://localhost:8080
) else if "%choice%"=="3" (
    echo 🏭 Starting production deployment without Nginx...
    docker-compose up -d mongodb server client
    echo ✅ Production deployment started!
    echo 🌐 Access your application at: http://localhost:3000
    echo 📊 Backend API at: http://localhost:8080
) else (
    echo ❌ Invalid choice. Please run the script again.
    pause
    exit /b 1
)

echo.
echo 📋 Useful commands:
echo    View logs: docker-compose logs -f
echo    Stop services: docker-compose down
echo    Restart services: docker-compose restart
echo    View running containers: docker ps
echo.
echo 🎉 Setup complete! Your Financial Advisor application is now running.
pause
