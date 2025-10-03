#!/bin/bash

echo "🚀 Starting DevSecOps Backend Server"
echo "==================================="

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "❌ MongoDB is not running. Starting MongoDB..."
    sudo systemctl start mongod
    sleep 3
fi

# Check MongoDB connection
if mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
    echo "✅ MongoDB is running and accessible"
else
    echo "❌ MongoDB connection failed"
    echo "   Try: sudo systemctl status mongod"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Creating default .env file..."
    cat > .env << 'ENVEOF'
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/webapp
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FRONTEND_URL=http://localhost:3000
APP_VERSION=1.0.0-local
ENVEOF
    echo "✅ Default .env file created"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the server
echo "🔥 Starting backend server on port 5000..."
echo "   API will be available at: http://localhost:5000"
echo "   Health check: http://localhost:5000/health"
echo "   Ready check: http://localhost:5000/ready"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
