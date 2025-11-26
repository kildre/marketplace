#!/bin/bash
# ADR Creation Script for Advana Marketplace
# Usage: ./create-adr.sh "Your ADR Title" [--accepted|--proposed|--deprecated|--superseded]

set -e

# Configuration
ADR_DIR="$(cd "$(dirname "$0")" && pwd)"
STATUS="${2:-Proposed}"  # Default to "Proposed" if no status flag provided

# Parse status flag if provided
if [[ "$2" == --* ]]; then
    STATUS_FLAG="${2#--}"  # Remove leading --
    # Capitalize first letter (compatible with older bash versions)
    STATUS="$(echo "${STATUS_FLAG:0:1}" | tr '[:lower:]' '[:upper:]')$(echo "${STATUS_FLAG:1}" | tr '[:upper:]' '[:lower:]')"
fi

# Validate status
VALID_STATUSES=("Proposed" "Accepted" "Deprecated" "Superseded")
if [[ ! " ${VALID_STATUSES[@]} " =~ " ${STATUS} " ]]; then
    echo "❌ Error: Invalid status '$STATUS'. Valid options: Proposed, Accepted, Deprecated, Superseded"
    exit 1
fi

# Check if title is provided
if [ -z "$1" ]; then
    echo "Usage: $0 \"Your ADR Title\" [--accepted|--proposed|--deprecated|--superseded]"
    echo ""
    echo "Examples:"
    echo "  $0 \"Database Migration Strategy\""
    echo "  $0 \"API Gateway Implementation\" --accepted"
    echo "  $0 \"Legacy Auth System\" --deprecated"
    exit 1
fi

TITLE="$1"

# Find the next ADR number
LAST_ADR=$(ls -1 "$ADR_DIR" | grep -E '^[0-9]{4}-.*.md$' | sort -r | head -n 1)
if [ -z "$LAST_ADR" ]; then
    NEXT_NUMBER="0001"
else
    LAST_NUMBER=$(echo "$LAST_ADR" | cut -d'-' -f1)
    NEXT_NUMBER=$(printf "%04d" $((10#$LAST_NUMBER + 1)))
fi

# Create filename from title
FILENAME=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//')
FULL_FILENAME="${NEXT_NUMBER}-${FILENAME}.md"
FILEPATH="${ADR_DIR}/${FULL_FILENAME}"

# Check if file already exists
if [ -f "$FILEPATH" ]; then
    echo "❌ Error: File already exists: $FULL_FILENAME"
    exit 1
fi

# Get current date
CURRENT_DATE=$(date +"%Y-%m-%d")

# Create ADR from template
cat > "$FILEPATH" << EOF
# ADR ${NEXT_NUMBER}: ${TITLE}

**Date:** ${CURRENT_DATE}  
**Status:** ${STATUS}  
**Author:** Advana Marketplace Team  

---

## Context

[Describe the context and background that led to this decision. What problem are you trying to solve? What are the constraints and requirements?]

---

## Decision

[State the decision clearly and concisely. What have you decided to do?]

---

## Options Considered

### **Option A — [Option Name]**  
[Brief description]

| Pros | Cons |
|------|------|
| [List advantages] | [List disadvantages] |

### **Option B — [Option Name] (Chosen)**  
[Brief description]

| Pros | Cons |
|------|------|
| [List advantages] | [List disadvantages] |

---

## Rationale

[Explain why this decision was made. What factors influenced the choice? How does this align with project goals and constraints?]

---

## Consequences

| Category | Details |
|----------|---------|
| **Positive** | [List positive outcomes] |
| **Negative** | [List negative outcomes or tradeoffs] |

---

## Compliance & Traceability

- Related tickets: [e.g., CA-XXX – Description]
- Architecture discussions: [Reference meetings, documents, or conversations]
- Aligns with: [Reference relevant policies, playbooks, or standards]

---

## Risks

- [Risk 1 and mitigation strategy]
- [Risk 2 and mitigation strategy]
- [Risk 3 and mitigation strategy]

---

## Open Questions

1. [Question 1]
2. [Question 2]
3. [Question 3]

---

## Next Steps

- [Action item 1]
- [Action item 2]
- [Action item 3]
EOF

echo "✅ Created ADR: ${FULL_FILENAME}"
echo "📝 Status: ${STATUS}"
echo "📂 Location: ${FILEPATH}"
echo ""
echo "Next steps:"
echo "  1. Edit the ADR file to fill in the details"
echo "  2. Review with the team"
echo "  3. Update status when decision is finalized"
