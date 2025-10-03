#!/bin/bash

echo "🛑 Stopping DevSecOps Webapp"
echo "============================"

# Kill processes by port
echo "Stopping backend (port 5000)..."
pkill -f "node.*src/app.js"
pkill -f "nodemon.*src/app.js"

echo "Stopping frontend (port 3000)..."
pkill -f "react-scripts start"
pkill -f "webpack-dev-server"

# Kill any remaining npm processes
pkill -f "npm.*start"
pkill -f "npm.*dev"

echo ""
echo "✅ Application stopped"
echo "   MongoDB is still running (use 'sudo systemctl stop mongod' to stop)"
