#!/bin/bash

# Database Migration Script: Supabase to DigitalOcean
# This script exports data from Supabase and imports to DigitalOcean PostgreSQL

set -e  # Exit on error

echo "🚀 Starting database migration from Supabase to DigitalOcean..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required tools are installed
command -v pg_dump >/dev/null 2>&1 || {
    echo -e "${RED}Error: pg_dump is not installed.${NC}"
    echo "Install PostgreSQL client tools:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu: sudo apt-get install postgresql-client"
    exit 1
}

command -v pg_restore >/dev/null 2>&1 || {
    echo -e "${RED}Error: pg_restore is not installed.${NC}"
    exit 1
}

# Prompt for Supabase connection details
echo -e "${YELLOW}Enter your Supabase database URL:${NC}"
echo "Format: postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres"
read -r SUPABASE_URL

echo -e "${YELLOW}Enter your DigitalOcean database URL:${NC}"
echo "Format: postgresql://doadmin:PASSWORD@host.db.ondigitalocean.com:25060/gocanvas"
read -r DIGITALOCEAN_URL

# Backup filename
BACKUP_FILE="supabase_backup_$(date +%Y%m%d_%H%M%S).dump"

# Export from Supabase
echo -e "\n${GREEN}Step 1: Exporting from Supabase...${NC}"
pg_dump "$SUPABASE_URL" \
    --no-owner \
    --no-acl \
    -F c \
    -f "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Export successful! Backup saved to: $BACKUP_FILE${NC}"
else
    echo -e "${RED}✗ Export failed!${NC}"
    exit 1
fi

# Import to DigitalOcean
echo -e "\n${GREEN}Step 2: Importing to DigitalOcean...${NC}"
echo -e "${YELLOW}This will clean and restore the database. Continue? (y/n)${NC}"
read -r CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "Migration cancelled."
    exit 0
fi

pg_restore --verbose \
    --clean \
    --no-acl \
    --no-owner \
    -d "$DIGITALOCEAN_URL" \
    "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✓ Migration complete!${NC}"
    echo -e "${GREEN}Backup file preserved at: $BACKUP_FILE${NC}"
    echo -e "\n${YELLOW}Next steps:${NC}"
    echo "1. Update DATABASE_URL in your DigitalOcean app environment variables"
    echo "2. Test the connection: python scripts/test_db_connection.py"
    echo "3. Verify data integrity in your application"
else
    echo -e "\n${RED}✗ Import failed!${NC}"
    echo "Check the error messages above for details."
    exit 1
fi
