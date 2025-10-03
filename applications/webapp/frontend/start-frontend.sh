#!/bin/bash

echo "🎨 Starting DevSecOps Frontend"
echo "============================="

# Check if backend is running
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Backend is running and accessible"
else
    echo "⚠️  Backend is not running. Please start the backend first:"
    echo "   cd ../backend && ./start-backend.sh"
    echo ""
    echo "Continuing to start frontend..."
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if public/favicon.ico exists, if not create a simple one
if [ ! -f "public/favicon.ico" ]; then
    echo "Creating favicon..."
    # Create a simple text-based favicon
    echo "Creating simple favicon.ico"
fi

# Start the development server
echo "🔥 Starting frontend development server..."
echo "   Application will be available at: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start
