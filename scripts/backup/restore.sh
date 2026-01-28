#!/bin/bash

set -e 

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' 

if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Backup file not specified${NC}"
    echo -e "${YELLOW}Usage: $0 <backup-file>${NC}"
    echo -e "${YELLOW}Example: $0 backups/backup_mydb_2024-01-28_12-00-00.sql.gz${NC}\n"
    
    if [ -d "backups" ]; then
        echo -e "${BLUE}📋 Available backups:${NC}"
        ls -lh backups/backup_*.sql.gz 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}' || echo -e "${YELLOW}  No backups found${NC}"
    fi
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Error: Backup file not found: ${BACKUP_FILE}${NC}"
    exit 1
fi

echo -e "${BLUE}🔄 Starting database restore...${NC}\n"

if [ -f .env ]; then
    export $(cat .env | grep -E '^POSTGRES_PRISMA_URL=' | xargs)
else
    echo -e "${RED}❌ Error: .env file not found${NC}"
    exit 1
fi

if [ -z "$POSTGRES_PRISMA_URL" ]; then
    echo -e "${RED}❌ Error: POSTGRES_PRISMA_URL not set in .env${NC}"
    exit 1
fi

DB_URL_CLEAN="${POSTGRES_PRISMA_URL%%\?*}"

if [[ $DB_URL_CLEAN =~ postgresql://([^:]+):(.+)@([^:]+):([0-9]+)/(.+) ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASSWORD="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]}"
    DB_NAME="${BASH_REMATCH[5]}"
elif [[ $DB_URL_CLEAN =~ postgresql://([^:]+):(.+)@([^/]+)/(.+) ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASSWORD="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="5432"
    DB_NAME="${BASH_REMATCH[4]}"
else
    echo -e "${RED}❌ Error: Invalid POSTGRES_PRISMA_URL format${NC}"
    echo -e "${YELLOW}Current URL: ${POSTGRES_PRISMA_URL:0:60}...${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Restore Information:${NC}"
echo -e "  Database: ${GREEN}${DB_NAME}${NC}"
echo -e "  Host: ${GREEN}${DB_HOST}:${DB_PORT}${NC}"
echo -e "  User: ${GREEN}${DB_USER}${NC}"
echo -e "  Backup: ${GREEN}${BACKUP_FILE}${NC}\n"

echo -e "${YELLOW}⚠️  WARNING: This will replace all data in the database!${NC}"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${YELLOW}❌ Restore cancelled${NC}"
    exit 0
fi

SQL_FILE="$BACKUP_FILE"
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo -e "\n${BLUE}📦 Decompressing backup...${NC}"
    gunzip -k -f "$BACKUP_FILE"
    SQL_FILE="${BACKUP_FILE%.gz}"
    echo -e "${GREEN}✅ Decompressed${NC}"
fi

echo -e "\n${BLUE}🔄 Restoring database...${NC}"

export PGPASSWORD="$DB_PASSWORD"

if [ -x "/opt/homebrew/opt/postgresql@17/bin/psql" ]; then
    PSQL="/opt/homebrew/opt/postgresql@17/bin/psql"
elif [ -x "/usr/local/opt/postgresql@17/bin/psql" ]; then
    PSQL="/usr/local/opt/postgresql@17/bin/psql"
else
    PSQL="psql"
fi

echo -e "${BLUE}Using: ${PSQL}${NC}"

$PSQL \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --username="$DB_USER" \
    --dbname="$DB_NAME" \
    --file="$SQL_FILE" \
    --quiet

unset PGPASSWORD

if [[ "$BACKUP_FILE" == *.gz ]] && [ -f "$SQL_FILE" ]; then
    rm -f "$SQL_FILE"
fi

echo -e "\n${GREEN}✅ Database restored successfully!${NC}"
echo -e "${YELLOW}💡 Don't forget to restart your application${NC}\n"
