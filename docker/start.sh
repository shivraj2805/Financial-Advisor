#!/bin/bash

# Financial Advisor Docker Startup Script

echo "🚀 Starting Financial Advisor Application..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your actual values before continuing."
    echo "   You can run this script again after editing the .env file."
    exit 1
fi

# Function to check if ports are available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ Port $port is already in use. Please free up the port or change it in docker-compose.yml"
        return 1
    fi
    return 0
}

# Check if required ports are available
echo "🔍 Checking port availability..."
check_port 3000 || exit 1
check_port 8080 || exit 1
check_port 27017 || exit 1

# Ask user for deployment type
echo "📋 Choose deployment type:"
echo "1) Production (with Nginx reverse proxy)"
echo "2) Development (with hot reloading)"
echo "3) Production without Nginx"
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo "🏭 Starting production deployment with Nginx..."
        docker-compose up -d
        echo "✅ Production deployment started!"
        echo "🌐 Access your application at: http://localhost"
        echo "📊 Backend API at: http://localhost:8080"
        ;;
    2)
        echo "🔧 Starting development deployment..."
        docker-compose -f docker-compose.dev.yml up -d
        echo "✅ Development deployment started!"
        echo "🌐 Access your application at: http://localhost:3000"
        echo "📊 Backend API at: http://localhost:8080"
        ;;
    3)
        echo "🏭 Starting production deployment without Nginx..."
        # Create a temporary compose file without nginx
        docker-compose up -d mongodb server client
        echo "✅ Production deployment started!"
        echo "🌐 Access your application at: http://localhost:3000"
        echo "📊 Backend API at: http://localhost:8080"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "📋 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo "   View running containers: docker ps"
echo ""
echo "🎉 Setup complete! Your Financial Advisor application is now running."
