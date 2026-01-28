#!/bin/bash

set -e 

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' 

echo -e "${BLUE}🔄 Starting database backup...${NC}\n"

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
    echo -e "${YELLOW}Expected format: postgresql://user:password@host[:port]/database${NC}"
    echo -e "${YELLOW}Current URL: ${POSTGRES_PRISMA_URL:0:60}...${NC}"
    exit 1
fi

BACKUP_DIR="backups"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/backup_${DB_NAME}_${TIMESTAMP}.sql"

echo -e "${BLUE}📋 Backup Information:${NC}"
echo -e "  Database: ${GREEN}${DB_NAME}${NC}"
echo -e "  Host: ${GREEN}${DB_HOST}:${DB_PORT}${NC}"
echo -e "  User: ${GREEN}${DB_USER}${NC}"
echo -e "  File: ${GREEN}${BACKUP_FILE}${NC}\n"

echo -e "${BLUE}📦 Creating backup...${NC}"

export PGPASSWORD="$DB_PASSWORD"

if [ -x "/opt/homebrew/opt/postgresql@17/bin/pg_dump" ]; then
    PG_DUMP="/opt/homebrew/opt/postgresql@17/bin/pg_dump"
elif [ -x "/usr/local/opt/postgresql@17/bin/pg_dump" ]; then
    PG_DUMP="/usr/local/opt/postgresql@17/bin/pg_dump"
else
    PG_DUMP="pg_dump"
fi

echo -e "${BLUE}Using: ${PG_DUMP}${NC}"

$PG_DUMP \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --username="$DB_USER" \
    --dbname="$DB_NAME" \
    --format=plain \
    --no-owner \
    --no-acl \
    --clean \
    --if-exists \
    --file="$BACKUP_FILE" \
    --verbose

unset PGPASSWORD

if [ -f "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "\n${GREEN}✅ Backup created successfully!${NC}"
    echo -e "${BLUE}📁 File: ${GREEN}${BACKUP_FILE}${NC}"
    echo -e "${BLUE}📊 Size: ${GREEN}${BACKUP_SIZE}${NC}"

    echo -e "\n${BLUE}🗜️  Compressing backup...${NC}"
    gzip -f "$BACKUP_FILE"
    COMPRESSED_FILE="${BACKUP_FILE}.gz"
    COMPRESSED_SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)
    
    echo -e "${GREEN}✅ Backup compressed!${NC}"
    echo -e "${BLUE}📁 File: ${GREEN}${COMPRESSED_FILE}${NC}"
    echo -e "${BLUE}📊 Size: ${GREEN}${COMPRESSED_SIZE}${NC}"
    
    echo -e "\n${BLUE}🧹 Cleaning old backups (keeping last 10)...${NC}"
    cd "$BACKUP_DIR"
    ls -t backup_*.sql.gz 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
    cd ..
    
    BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null | wc -l | tr -d ' ')
    echo -e "${GREEN}✅ Total backups: ${BACKUP_COUNT}${NC}"
    
    echo -e "\n${GREEN}🎉 Backup completed successfully!${NC}"
    echo -e "${YELLOW}💡 To restore: yarn db:restore ${COMPRESSED_FILE}${NC}\n"
else
    echo -e "\n${RED}❌ Backup failed!${NC}"
    exit 1
fi
