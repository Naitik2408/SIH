#!/bin/bash

# GetWay App Setup Script
# This script helps set up the development environment

echo "🚀 Setting up GetWay React Native App"
echo "====================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Check if Expo CLI is installed globally
if ! command -v expo &> /dev/null; then
    echo "📱 Expo CLI not found. Installing globally..."
    npm install -g @expo/cli
    
    if [ $? -eq 0 ]; then
        echo "✅ Expo CLI installed successfully!"
    else
        echo "❌ Failed to install Expo CLI"
        exit 1
    fi
else
    echo "✅ Expo CLI is already installed"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Run 'npm start' to start the development server"
echo "2. Use Expo Go app to scan QR code, or run on simulator"
echo ""
echo "🎯 App features:"
echo "   • Customer dashboard with trip logging"
echo "   • Post creation and management"
echo "   • Notification system"
echo "   • Profile management"
echo ""
