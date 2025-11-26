#!/bin/bash
# Supersede ADR Script
# Marks an ADR as superseded and updates it to reference the new ADR
# Usage: ./supersede-adr.sh <old-adr-number> <new-adr-number> "Reason for superseding"

set -e

ADR_DIR="$(cd "$(dirname "$0")" && pwd)"

# Check arguments
if [ "$#" -lt 2 ]; then
    echo "Usage: $0 <old-adr-number> <new-adr-number> [\"Reason for superseding\"]"
    echo ""
    echo "Examples:"
    echo "  $0 0001 0003"
    echo "  $0 0001 0003 \"New architecture requires different approach\""
    echo ""
    echo "This script will:"
    echo "  1. Change the status of the old ADR to 'Superseded'"
    echo "  2. Add a supersession notice to the old ADR"
    echo "  3. Add a reference in the new ADR showing it supersedes the old one"
    exit 1
fi

OLD_NUMBER=$(printf "%04d" $1)
NEW_NUMBER=$(printf "%04d" $2)
REASON="${3:-This decision has been superseded}"

# Find the old ADR file
OLD_ADR_FILE=$(ls -1 "$ADR_DIR" | grep "^${OLD_NUMBER}-.*\.md$" | head -n 1)
if [ -z "$OLD_ADR_FILE" ]; then
    echo "❌ Error: Could not find ADR ${OLD_NUMBER}"
    exit 1
fi

# Find the new ADR file
NEW_ADR_FILE=$(ls -1 "$ADR_DIR" | grep "^${NEW_NUMBER}-.*\.md$" | head -n 1)
if [ -z "$NEW_ADR_FILE" ]; then
    echo "❌ Error: Could not find ADR ${NEW_NUMBER}"
    exit 1
fi

OLD_FILEPATH="${ADR_DIR}/${OLD_ADR_FILE}"
NEW_FILEPATH="${ADR_DIR}/${NEW_ADR_FILE}"

# Extract titles
OLD_TITLE=$(grep -m 1 '^# ADR' "$OLD_FILEPATH" | sed 's/^# ADR [0-9]*: //')
NEW_TITLE=$(grep -m 1 '^# ADR' "$NEW_FILEPATH" | sed 's/^# ADR [0-9]*: //')

echo "📋 Superseding ADR ${OLD_NUMBER}: ${OLD_TITLE}"
echo "   with ADR ${NEW_NUMBER}: ${NEW_TITLE}"
echo ""

# Create backup
BACKUP_DIR="${ADR_DIR}/.backups"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
cp "$OLD_FILEPATH" "${BACKUP_DIR}/${OLD_ADR_FILE}.${TIMESTAMP}.bak"
cp "$NEW_FILEPATH" "${BACKUP_DIR}/${NEW_ADR_FILE}.${TIMESTAMP}.bak"
echo "✅ Created backups in ${BACKUP_DIR}"

# Update old ADR status
sed -i '' 's/^\*\*Status:\*\* .*$/\*\*Status:\*\* Superseded/' "$OLD_FILEPATH"
echo "✅ Updated status in ${OLD_ADR_FILE}"

# Add supersession notice to old ADR (after the status line)
# Check if supersession notice already exists
if ! grep -q "^> \*\*⚠️ SUPERSEDED" "$OLD_FILEPATH"; then
    # Find the line number after the Author line
    LINE_NUM=$(grep -n '^\*\*Author:\*\*' "$OLD_FILEPATH" | cut -d':' -f1)
    if [ -n "$LINE_NUM" ]; then
        # Insert after the separator following the author line
        INSERT_LINE=$((LINE_NUM + 2))
        
        # Create supersession notice
        NOTICE="> **⚠️ SUPERSEDED by [ADR ${NEW_NUMBER}: ${NEW_TITLE}](${NEW_ADR_FILE})**  
> ${REASON}

"
        
        # Insert the notice
        echo "$NOTICE" | awk -v line="$INSERT_LINE" -v text="$NOTICE" '
            NR==line {print text}
            {print}
        ' "$OLD_FILEPATH" > "${OLD_FILEPATH}.tmp"
        mv "${OLD_FILEPATH}.tmp" "$OLD_FILEPATH"
        echo "✅ Added supersession notice to ${OLD_ADR_FILE}"
    fi
fi

# Add supersedes reference to new ADR (in Context or Compliance section)
if ! grep -q "Supersedes.*ADR ${OLD_NUMBER}" "$NEW_FILEPATH"; then
    # Try to add to Compliance & Traceability section
    if grep -q "^## Compliance & Traceability" "$NEW_FILEPATH"; then
        # Add after the section header
        sed -i '' "/^## Compliance & Traceability$/a\\
\\
**Supersedes:** [ADR ${OLD_NUMBER}: ${OLD_TITLE}](${OLD_ADR_FILE})  
" "$NEW_FILEPATH"
        echo "✅ Added supersession reference to ${NEW_ADR_FILE}"
    else
        echo "⚠️  Warning: Could not automatically add supersession reference to ${NEW_ADR_FILE}"
        echo "   Please manually add: Supersedes ADR ${OLD_NUMBER}"
    fi
fi

echo ""
echo "✨ Supersession complete!"
echo ""
echo "Summary:"
echo "  Old ADR: ${OLD_NUMBER} - ${OLD_TITLE} → Status: Superseded"
echo "  New ADR: ${NEW_NUMBER} - ${NEW_TITLE} → References old ADR"
echo ""
echo "Next steps:"
echo "  1. Review the changes in both files"
echo "  2. Update the README index: ./generate-adr-index.sh > README.md"
echo "  3. Commit the changes"
echo ""
echo "Backups saved in: ${BACKUP_DIR}"
