#!/bin/bash

# Chatooly Agent Launcher for macOS
# Double-click this file to start the Chatooly Agent

echo "======================================"
echo "   Chatooly Agent Launcher"
echo "======================================"
echo ""

# Get project directory (script is in project root)
PROJECT_DIR="$(dirname "$0")"
cd "$PROJECT_DIR/src"

# Clear macOS quarantine flags from all files (fixes Gatekeeper blocks)
echo "Preparing files for macOS..."
xattr -dr com.apple.quarantine "$PROJECT_DIR" 2>/dev/null

# Kill any process on port 3001
echo "Checking for processes on port 3001..."
lsof -ti:3001 | xargs kill -9 2>/dev/null && echo "Killed existing process on port 3001"

# Install dependencies if needed (first-time setup)
if [ ! -d "node_modules" ]; then
    echo ""
    echo "Installing dependencies (first-time setup)..."
    echo "This may take a few minutes..."
    echo ""
    npm install
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo ""
    echo "WARNING: .env file not found. Some features may not work."
    echo ""
fi

# Start the server
echo ""
echo "Starting Chatooly Agent server..."
npm run start &
SERVER_PID=$!

# Wait for server to be ready (max 30 seconds)
echo "Waiting for server to start..."
for i in {1..60}; do
    nc -z localhost 3001 2>/dev/null && break
    sleep 0.5
done

# Check if server started successfully
if nc -z localhost 3001 2>/dev/null; then
    echo ""
    echo "======================================"
    echo "   Chatooly Agent is running!"
    echo "   Opening browser to localhost:3001"
    echo "======================================"
    echo ""

    # Open browser (Chrome preferred, fallback to default)
    if [ -d "/Applications/Google Chrome.app" ]; then
        open -a "Google Chrome" "http://localhost:3001"
    else
        open "http://localhost:3001"
    fi

    echo "Close this window to stop the server."
    echo ""

    # Keep script running to maintain server
    wait $SERVER_PID
else
    echo ""
    echo "ERROR: Failed to start server."
    echo "Make sure Node.js is installed: https://nodejs.org/"
    echo ""
    read -p "Press Enter to close..."
fi
