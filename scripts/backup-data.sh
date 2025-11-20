#!/bin/bash

# Backup Script for Herp Crossing Data
# Downloads observation data from Google Apps Script API
# Usage: ./scripts/backup-data.sh [observer_name]

set -e  # Exit on error

# Configuration
APPS_SCRIPT_URL="https://script.google.com/macros/s/AKfycbwx7t7PLWG97FwzR6HWSTLv5JnteJVNZPv9tfB8Y8z0nW3ODGOr_zxTRERHH8Rvt7gmmg/exec"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo -e "${BLUE}=== Herp Crossing Data Backup ===${NC}\n"

# Function to backup all data (requires manual sheet export)
backup_all_data() {
    echo -e "${YELLOW}Note: Full backup requires Google Sheets access${NC}"
    echo "Options to backup all data:"
    echo ""
    echo "1. Via Google Sheets (Recommended):"
    echo "   - Open your Google Sheet"
    echo "   - File → Download → CSV (.csv)"
    echo "   - Or File → Download → Excel (.xlsx)"
    echo ""
    echo "2. Via Apps Script (Limited):"
    echo "   - Can fetch data by observer name only"
    echo "   - Use: ./scripts/backup-data.sh OBSERVER_NAME"
    echo ""
}

# Function to backup data for specific observer
backup_observer_data() {
    local observer=$1
    local output_file="$BACKUP_DIR/observations_${observer// /_}_${TIMESTAMP}.json"

    echo -e "${BLUE}Fetching observations for: ${observer}${NC}"

    # URL encode the observer name
    local encoded_observer=$(printf %s "$observer" | jq -sRr @uri)

    # Fetch data from API
    local url="${APPS_SCRIPT_URL}?action=getPatrols&observer=${encoded_observer}"

    echo "Requesting data from API..."

    # Use curl to fetch data
    if curl -s -f -L "$url" -o "$output_file"; then
        # Check if response contains error
        if grep -q '"error"' "$output_file"; then
            echo -e "${RED}Error from API:${NC}"
            cat "$output_file"
            rm "$output_file"
            exit 1
        fi

        # Count observations
        local count=$(jq '.patrols | length' "$output_file" 2>/dev/null || echo "0")

        echo -e "${GREEN}✓ Success!${NC}"
        echo "  Observations: $count"
        echo "  Saved to: $output_file"
        echo ""

        # Pretty print summary
        echo -e "${BLUE}Summary:${NC}"
        jq -r '.patrols[] | "\(.patrolDate) \(.patrolTime) - \(.species) (\(.count))"' "$output_file" 2>/dev/null || echo "No observations found"

    else
        echo -e "${RED}✗ Failed to fetch data${NC}"
        echo "Check your internet connection and try again"
        rm -f "$output_file"
        exit 1
    fi
}

# Function to export all observers (batch backup)
backup_multiple_observers() {
    echo -e "${BLUE}Batch backup mode${NC}"
    echo "Enter observer names (one per line, empty line to finish):"
    echo ""

    local observers=()
    while IFS= read -r line; do
        [[ -z "$line" ]] && break
        observers+=("$line")
    done

    if [ ${#observers[@]} -eq 0 ]; then
        echo -e "${YELLOW}No observers entered. Exiting.${NC}"
        exit 0
    fi

    echo ""
    echo -e "${BLUE}Backing up data for ${#observers[@]} observer(s)...${NC}"
    echo ""

    for observer in "${observers[@]}"; do
        backup_observer_data "$observer"
        echo ""
    done

    echo -e "${GREEN}✓ Batch backup complete!${NC}"
    echo "Backups saved to: $BACKUP_DIR/"
}

# Function to list existing backups
list_backups() {
    echo -e "${BLUE}Existing backups in $BACKUP_DIR:${NC}"
    echo ""

    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]; then
        echo "  (no backups yet)"
    else
        ls -lh "$BACKUP_DIR" | tail -n +2 | awk '{printf "  %s %s  %s\n", $6, $7, $9}'
    fi
    echo ""
}

# Main script logic
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OBSERVER_NAME]"
        echo ""
        echo "Backup observation data from Herp Crossing system"
        echo ""
        echo "Options:"
        echo "  (no args)           Interactive mode - choose backup type"
        echo "  OBSERVER_NAME       Backup data for specific observer"
        echo "  --batch             Backup data for multiple observers"
        echo "  --list              List existing backups"
        echo "  --help              Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0                          # Interactive mode"
        echo "  $0 'Jane Smith'             # Backup Jane's observations"
        echo "  $0 --batch                  # Backup multiple observers"
        echo "  $0 --list                   # List existing backups"
        echo ""
        exit 0
        ;;

    --list)
        list_backups
        exit 0
        ;;

    --batch)
        backup_multiple_observers
        exit 0
        ;;

    "")
        # Interactive mode
        echo "Choose backup option:"
        echo ""
        echo "  1. Backup specific observer"
        echo "  2. Backup multiple observers (batch)"
        echo "  3. Instructions for full backup (all data)"
        echo "  4. List existing backups"
        echo ""
        read -p "Enter choice [1-4]: " choice
        echo ""

        case $choice in
            1)
                read -p "Enter observer name: " observer
                if [ -z "$observer" ]; then
                    echo -e "${RED}Error: Observer name required${NC}"
                    exit 1
                fi
                backup_observer_data "$observer"
                ;;
            2)
                backup_multiple_observers
                ;;
            3)
                backup_all_data
                ;;
            4)
                list_backups
                ;;
            *)
                echo -e "${RED}Invalid choice${NC}"
                exit 1
                ;;
        esac
        ;;

    *)
        # Observer name provided as argument
        backup_observer_data "$1"
        ;;
esac

echo ""
echo -e "${GREEN}Done!${NC}"
