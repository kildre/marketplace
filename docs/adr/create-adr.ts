#!/usr/bin/env node
/**
 * ADR Creation Script for Advana Marketplace (TypeScript/Node.js)
 * Usage: ./create-adr.ts "Your ADR Title" [--accepted|--proposed|--deprecated|--superseded]
 * Or: npx ts-node create-adr.ts "Your ADR Title" [--accepted]
 */

import * as fs from 'fs';
import * as path from 'path';

interface ADROptions {
  title: string;
  status: 'Proposed' | 'Accepted' | 'Deprecated' | 'Superseded';
}

const VALID_STATUSES = ['Proposed', 'Accepted', 'Deprecated', 'Superseded'] as const;

function printUsage(): void {
  console.log(`Usage: ./create-adr.ts "Your ADR Title" [--accepted|--proposed|--deprecated|--superseded]
  
Examples:
  ./create-adr.ts "Database Migration Strategy"
  ./create-adr.ts "API Gateway Implementation" --accepted
  ./create-adr.ts "Legacy Auth System" --deprecated
`);
}

function parseArguments(): ADROptions | null {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || !args[0]) {
    printUsage();
    return null;
  }

  const title = args[0];
  let status: ADROptions['status'] = 'Proposed';

  // Parse status flag if provided
  if (args.length > 1 && args[1].startsWith('--')) {
    const statusFlag = args[1].substring(2);
    const capitalizedStatus = statusFlag.charAt(0).toUpperCase() + statusFlag.slice(1).toLowerCase();
    
    if (!VALID_STATUSES.includes(capitalizedStatus as any)) {
      console.error(`❌ Error: Invalid status '${capitalizedStatus}'. Valid options: ${VALID_STATUSES.join(', ')}`);
      return null;
    }
    
    status = capitalizedStatus as ADROptions['status'];
  }

  return { title, status };
}

function getNextADRNumber(adrDir: string): string {
  const files = fs.readdirSync(adrDir);
  const adrFiles = files.filter(f => /^\d{4}-.*.md$/.test(f)).sort().reverse();
  
  if (adrFiles.length === 0) {
    return '0001';
  }
  
  const lastNumber = parseInt(adrFiles[0].split('-')[0], 10);
  return (lastNumber + 1).toString().padStart(4, '0');
}

function createFilename(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateADRTemplate(number: string, title: string, status: string): string {
  const currentDate = new Date().toISOString().split('T')[0];
  
  return `# ADR ${number}: ${title}

**Date:** ${currentDate}  
**Status:** ${status}  
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
`;
}

function main(): void {
  const options = parseArguments();
  if (!options) {
    process.exit(1);
  }

  const adrDir = __dirname;
  const nextNumber = getNextADRNumber(adrDir);
  const filename = createFilename(options.title);
  const fullFilename = `${nextNumber}-${filename}.md`;
  const filepath = path.join(adrDir, fullFilename);

  // Check if file already exists
  if (fs.existsSync(filepath)) {
    console.error(`❌ Error: File already exists: ${fullFilename}`);
    process.exit(1);
  }

  // Create ADR file
  const content = generateADRTemplate(nextNumber, options.title, options.status);
  fs.writeFileSync(filepath, content, 'utf8');

  console.log(`✅ Created ADR: ${fullFilename}`);
  console.log(`📝 Status: ${options.status}`);
  console.log(`📂 Location: ${filepath}`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. Edit the ADR file to fill in the details');
  console.log('  2. Review with the team');
  console.log('  3. Update status when decision is finalized');
}

main();
