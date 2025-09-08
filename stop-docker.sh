#!/bin/bash

# Script to stop Booking Advisor Docker containers

echo "🛑 Stopping Booking Advisor Docker containers..."

# Stop containers
if command -v docker-compose &> /dev/null; then
    docker-compose down
else
    docker compose down
fi

echo "✅ All containers stopped"
echo ""
echo "🧹 To clean up completely (remove images and volumes):"
echo "   docker-compose down --rmi all --volumes"
