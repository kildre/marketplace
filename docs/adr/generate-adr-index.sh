#!/bin/bash
# ADR Index Generator for GitHub README
# Automatically generates a table of contents for all ADRs
# Usage: ./generate-adr-index.sh > README.md

set -e

ADR_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "# Architecture Decision Records (ADRs)"
echo ""
echo "This directory contains Architecture Decision Records for the Advana Marketplace project."
echo ""
echo "## What is an ADR?"
echo ""
echo "An Architecture Decision Record (ADR) captures an important architectural decision made along with its context and consequences. ADRs help teams:"
echo ""
echo "- Document the reasoning behind architectural choices"
echo "- Provide historical context for future team members"
echo "- Enable better decision-making through structured analysis"
echo "- Support compliance and audit requirements"
echo ""
echo "## ADR Format"
echo ""
echo "Each ADR follows a consistent structure:"
echo ""
echo "- **Context**: Background and problem statement"
echo "- **Decision**: The choice that was made"
echo "- **Options Considered**: Alternative approaches evaluated"
echo "- **Rationale**: Why this decision was made"
echo "- **Consequences**: Expected outcomes and tradeoffs"
echo "- **Compliance & Traceability**: Related tickets and documentation"
echo "- **Risks**: Potential issues and mitigation strategies"
echo "- **Open Questions**: Unresolved items for future consideration"
echo "- **Next Steps**: Action items following the decision"
echo ""
echo "## Creating a New ADR"
echo ""
echo "\`\`\`bash"
echo "# Using the bash script"
echo "./create-adr.sh \"Your ADR Title\" [--accepted|--proposed|--deprecated|--superseded]"
echo ""
echo "# Using the TypeScript version (requires Node.js)"
echo "./create-adr.ts \"Your ADR Title\" [--accepted|--proposed|--deprecated|--superseded]"
echo "\`\`\`"
echo ""
echo "## ADR Index"
echo ""
echo "| # | Title | Status | Date | Author |"
echo "|---|-------|--------|------|--------|"

# Find all ADR markdown files and parse them
for file in $(ls -1 "$ADR_DIR" | grep -E '^[0-9]{4}-.*.md$' | sort); do
    ADR_NUMBER=$(echo "$file" | cut -d'-' -f1)
    FILEPATH="${ADR_DIR}/${file}"
    
    # Extract title (first line starting with #)
    TITLE=$(grep -m 1 '^# ADR' "$FILEPATH" | sed 's/^# ADR [0-9]*: //' || echo "Untitled")
    
    # Extract status
    STATUS=$(grep -m 1 '^\*\*Status:\*\*' "$FILEPATH" | sed 's/\*\*Status:\*\* //' | tr -d ' ' || echo "Unknown")
    
    # Extract date
    DATE=$(grep -m 1 '^\*\*Date:\*\*' "$FILEPATH" | sed 's/\*\*Date:\*\* //' | tr -d ' ' || echo "Unknown")
    
    # Extract author
    AUTHOR=$(grep -m 1 '^\*\*Author:\*\*' "$FILEPATH" | sed 's/\*\*Author:\*\* //' || echo "Unknown")
    
    # Create status badge
    case "$STATUS" in
        "Accepted")
            STATUS_BADGE="✅ Accepted"
            ;;
        "Proposed")
            STATUS_BADGE="🔄 Proposed"
            ;;
        "Deprecated")
            STATUS_BADGE="⚠️ Deprecated"
            ;;
        "Superseded")
            STATUS_BADGE="🔁 Superseded"
            ;;
        *)
            STATUS_BADGE="$STATUS"
            ;;
    esac
    
    echo "| $ADR_NUMBER | [$TITLE]($file) | $STATUS_BADGE | $DATE | $AUTHOR |"
done

echo ""
echo "## ADR Workflow"
echo ""
echo "\`\`\`mermaid"
echo "graph LR"
echo "    A[Identify Decision] --> B[Create ADR]"
echo "    B --> C[Status: Proposed]"
echo "    C --> D[Team Review]"
echo "    D --> E{Approved?}"
echo "    E -->|Yes| F[Status: Accepted]"
echo "    E -->|No| G[Revise or Reject]"
echo "    F --> H[Implement]"
echo "    H --> I{Still Valid?}"
echo "    I -->|No| J[Status: Deprecated/Superseded]"
echo "    I -->|Yes| F"
echo "\`\`\`"
echo ""
echo "## Status Definitions"
echo ""
echo "- **🔄 Proposed**: The ADR is under review and not yet approved"
echo "- **✅ Accepted**: The decision has been approved and is in effect"
echo "- **⚠️ Deprecated**: The decision is no longer recommended but may still be in use"
echo "- **🔁 Superseded**: The decision has been replaced by a newer ADR"
echo ""
echo "## Tools"
echo ""
echo "This directory includes several helper scripts:"
echo ""
echo "- \`create-adr.sh\` - Bash script to create new ADRs with auto-numbering"
echo "- \`create-adr.ts\` - TypeScript/Node.js version of the ADR creation script"
echo "- \`generate-adr-index.sh\` - Generate this README index"
echo "- \`supersede-adr.sh\` - Mark an ADR as superseded"
echo ""
echo "## References"
echo ""
echo "- [ADR GitHub Organization](https://adr.github.io/)"
echo "- [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)"
echo "- [Advana Software Operations Playbook](https://internal-link-to-playbook)"
echo ""
echo "---"
echo ""
echo "_Last generated: $(date +"%Y-%m-%d %H:%M:%S")_"
