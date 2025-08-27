#!/bin/bash

# Financial Advisor Health Check Script

echo "🔍 Checking Financial Advisor Application Health..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a service is running
check_service() {
    local service_name=$1
    local container_name=$2
    local port=$3
    local endpoint=$4
    
    echo -n "Checking $service_name... "
    
    # Check if container is running
    if docker ps --format "table {{.Names}}" | grep -q "$container_name"; then
        echo -e "${GREEN}✅ Container running${NC}"
        
        # Check if port is accessible
        if curl -s "http://localhost:$port$endpoint" > /dev/null 2>&1; then
            echo -e "   ${GREEN}✅ Port $port accessible${NC}"
        else
            echo -e "   ${RED}❌ Port $port not accessible${NC}"
        fi
    else
        echo -e "${RED}❌ Container not running${NC}"
    fi
}

# Check Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"

# Check each service
echo ""
check_service "MongoDB" "financial-advisor-mongodb" "27017" ""

# Check if we're running production or development
if docker ps --format "table {{.Names}}" | grep -q "financial-advisor-nginx"; then
    echo ""
    echo "🏭 Production Mode Detected"
    check_service "Nginx" "financial-advisor-nginx" "80" "/health"
    check_service "Server" "financial-advisor-server" "8080" "/health"
    check_service "Client" "financial-advisor-client" "3000" ""
else
    echo ""
    echo "🔧 Development Mode Detected"
    check_service "Server" "financial-advisor-server-dev" "8080" "/health"
    check_service "Client" "financial-advisor-client-dev" "3000" ""
fi

echo ""
echo "📊 Container Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep financial-advisor

echo ""
echo "🔍 Log Summary (last 10 lines):"
echo "MongoDB:"
docker logs --tail 10 financial-advisor-mongodb 2>/dev/null || echo "Container not found"

echo ""
echo "Server:"
docker logs --tail 10 financial-advisor-server 2>/dev/null || docker logs --tail 10 financial-advisor-server-dev 2>/dev/null || echo "Container not found"

echo ""
echo "Client:"
docker logs --tail 10 financial-advisor-client 2>/dev/null || docker logs --tail 10 financial-advisor-client-dev 2>/dev/null || echo "Container not found"

echo ""
echo "🎯 Health Check Complete!"
