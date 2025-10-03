#!/bin/bash

echo "📊 DevSecOps Webapp Status"
echo "=========================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check MongoDB
if pgrep -x "mongod" > /dev/null; then
    echo -e "${GREEN}✅ MongoDB:${NC} Running"
else
    echo -e "${RED}❌ MongoDB:${NC} Not running"
fi

# Check Backend
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend:${NC} Running (http://localhost:5000)"
else
    echo -e "${RED}❌ Backend:${NC} Not running"
fi

# Check Frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend:${NC} Running (http://localhost:3000)"
else
    echo -e "${RED}❌ Frontend:${NC} Not running"
fi

echo ""
echo "🔗 Quick Links:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo "   Health:   http://localhost:5000/health"
