#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== Go Canvas Deployment Script =====${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git is not installed. Please install Git first.${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}.env file not found. Please create a .env file based on .env.example${NC}"
    exit 1
fi

echo -e "${GREEN}Step 1: Building and testing the backend Docker image${NC}"
docker build -t go-canvas-api .

if [ $? -ne 0 ]; then
    echo -e "${RED}Docker build failed. Please fix the issues and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}Step 2: Running a local test of the Docker container${NC}"
echo -e "${YELLOW}Starting container for testing...${NC}"
docker run --rm -p 8000:8000 --env-file .env go-canvas-api &
CONTAINER_PID=$!

# Wait for the API to start
echo -e "${YELLOW}Waiting for API to start...${NC}"
sleep 5

# Test the API
echo -e "${YELLOW}Testing API connection...${NC}"
if curl -s http://localhost:8000 | grep -q "running"; then
    echo -e "${GREEN}API is running correctly!${NC}"
else
    echo -e "${RED}API test failed. Please check the logs.${NC}"
    kill $CONTAINER_PID
    exit 1
fi

# Stop the container
kill $CONTAINER_PID

echo -e "${GREEN}Step 3: Committing and pushing changes to GitHub${NC}"
echo -e "${YELLOW}Do you want to commit and push changes to GitHub? (y/n)${NC}"
read answer

if [ "$answer" == "y" ] || [ "$answer" == "Y" ]; then
    echo -e "${YELLOW}Enter commit message:${NC}"
    read commit_message
    
    git add .
    git commit -m "$commit_message"
    git push
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Git push failed. Please fix the issues and try again.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}Changes pushed to GitHub successfully!${NC}"
else
    echo -e "${YELLOW}Skipping GitHub push.${NC}"
fi

echo -e "${GREEN}Step 4: Deployment Instructions${NC}"
echo -e "${YELLOW}Backend (Render):${NC}"
echo "1. Go to https://dashboard.render.com/"
echo "2. Create a new Web Service from your GitHub repository"
echo "3. Select Docker runtime"
echo "4. Set up environment variables from your .env file"
echo ""
echo -e "${YELLOW}Frontend (Vercel):${NC}"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Import your GitHub repository"
echo "3. Select Create React App as the framework preset"
echo "4. Set REACT_APP_API_URL environment variable to your Render URL"

echo -e "${GREEN}Deployment preparation completed successfully!${NC}" 