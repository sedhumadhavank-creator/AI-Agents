#!/bin/bash

echo "Starting AI Assistant Service..."
echo "================================"

echo ""
echo "Checking if Node.js is installed..."
node --version
if [ $? -ne 0 ]; then
    echo "Error: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo ""
echo "Starting AI service on http://localhost:3000"
echo "Press Ctrl+C to stop the service"
echo ""

node ai-service.js


