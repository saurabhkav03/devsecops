#!/bin/bash

echo "🚀 Starting DevSecOps Webapp Locally"
echo "====================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a service is running
check_service() {
    if curl -f "$1" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $2 is running${NC}"
        return 0
    else
        echo -e "${RED}❌ $2 is not running${NC}"
        return 1
    fi
}

# Step 1: Check and start MongoDB
echo -e "${BLUE}Step 1: Checking MongoDB...${NC}"
if ! pgrep -x "mongod" > /dev/null; then
    echo -e "${YELLOW}⚠️  Starting MongoDB...${NC}"
    sudo systemctl start mongod
    sleep 3
fi

if mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
    echo -e "${GREEN}✅ MongoDB is running${NC}"
else
    echo -e "${RED}❌ MongoDB failed to start${NC}"
    echo "Please check: sudo systemctl status mongod"
    exit 1
fi

# Step 2: Initialize database
echo -e "${BLUE}Step 2: Initializing database...${NC}"
./init-database.sh

# Step 3: Check if we should start backend
echo -e "${BLUE}Step 3: Checking backend...${NC}"
if ! check_service "http://localhost:5000/health" "Backend"; then
    echo -e "${YELLOW}Starting backend in background...${NC}"
    cd backend
    npm install > /dev/null 2>&1
    nohup npm run dev > backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to start
    echo -e "${YELLOW}Waiting for backend to start...${NC}"
    for i in {1..30}; do
        if check_service "http://localhost:5000/health" "Backend"; then
            break
        fi
        sleep 1
        echo -n "."
    done
    echo ""
fi

# Step 4: Check if we should start frontend
echo -e "${BLUE}Step 4: Checking frontend...${NC}"
if ! check_service "http://localhost:3000" "Frontend"; then
    echo -e "${YELLOW}Starting frontend in background...${NC}"
    cd frontend
    npm install > /dev/null 2>&1
    nohup npm start > frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    
    # Wait for frontend to start
    echo -e "${YELLOW}Waiting for frontend to start...${NC}"
    for i in {1..60}; do
        if check_service "http://localhost:3000" "Frontend"; then
            break
        fi
        sleep 1
        echo -n "."
    done
    echo ""
fi

echo ""
echo -e "${GREEN}🎉 Application started successfully!${NC}"
echo "=================================="
echo -e "${BLUE}📱 Frontend:${NC}     http://localhost:3000"
echo -e "${BLUE}🔗 Backend API:${NC}  http://localhost:5000"
echo -e "${BLUE}🏥 Health Check:${NC} http://localhost:5000/health"
echo -e "${BLUE}📊 Metrics:${NC}     http://localhost:5000/metrics"
echo ""
echo -e "${YELLOW}👤 Demo Login Credentials:${NC}"
echo "   Email: admin@localhost.com"
echo "   Password: admin123"
echo ""
echo -e "${YELLOW}📋 Useful Commands:${NC}"
echo "   Stop all: ./stop-app.sh"
echo "   View backend logs: tail -f backend/backend.log"
echo "   View frontend logs: tail -f frontend/frontend.log"
echo "   Check status: ./check-status.sh"
echo ""
echo -e "${GREEN}✨ Happy testing!${NC}"
