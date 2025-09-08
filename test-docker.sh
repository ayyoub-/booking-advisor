#!/bin/bash

# Script to test Docker deployment

echo "🧪 Testing Booking Advisor Docker Deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if containers are running
echo "🔍 Checking container status..."
if ! docker-compose ps | grep -q "Up"; then
    echo "❌ No containers are running. Please run ./start-docker.sh first."
    exit 1
fi

echo "✅ Containers are running"

# Test backend health
echo "🔍 Testing backend health..."
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend is not responding"
    exit 1
fi

# Test frontend
echo "🔍 Testing frontend..."
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not responding"
    exit 1
fi

# Test scraping API with a simple request
echo "🔍 Testing scraping API..."
response=$(curl -s -X POST http://localhost:3001/api/scrape-reviews \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.booking.com/hotel/id/asri-villas.fr.html", "nReviews": 5}')

if echo "$response" | grep -q "success\|error"; then
    echo "✅ Scraping API is responding"
    echo "📊 Response: $response"
else
    echo "❌ Scraping API is not responding correctly"
    echo "Response: $response"
fi

echo ""
echo "🎉 Docker deployment test completed!"
echo ""
echo "📱 Your application is ready:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:3001"
echo ""
echo "🔧 To view logs: docker-compose logs -f"
echo "🛑 To stop: ./stop-docker.sh"
