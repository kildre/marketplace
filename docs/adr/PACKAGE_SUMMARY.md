# ADR Tooling Suite - Complete Package

## 📦 What's Included

All tooling has been created in `/Users/kberres/dev/CDAO/advana-marketplace/docs/adr/`:

### ✅ Scripts Created

1. **`create-adr.sh`** (Bash version)
   - Auto-numbers new ADRs
   - Status flag support: `--accepted`, `--proposed`, `--deprecated`, `--superseded`
   - Matches your ADR template exactly
   - Executable and ready to use

2. **`create-adr.ts`** (TypeScript/Node.js version)
   - Same functionality as bash version
   - Can be run with `npx ts-node` or directly
   - Type-safe implementation

3. **`generate-adr-index.sh`**
   - Auto-generates README.md with full ADR index
   - Includes status badges (✅ 🔄 ⚠️ 🔁)
   - Extracts metadata from each ADR
   - Includes workflow diagram and usage instructions

4. **`supersede-adr.sh`**
   - Marks old ADRs as superseded
   - Updates both old and new ADR files
   - Creates backups automatically
   - Adds cross-references

### ✅ VS Code Snippets

**`adr-snippets.code-snippets`** - 13 snippets for rapid ADR editing:

- `adr-full` - Complete template
- `adr-header` - Header with metadata
- `adr-context` - Context section
- `adr-decision` - Decision section
- `adr-options` - Options with pros/cons tables
- `adr-rationale` - Rationale section
- `adr-consequences` - Consequences section
- `adr-compliance` - Compliance & Traceability
- `adr-risks` - Risks section
- `adr-questions` - Open Questions
- `adr-nextsteps` - Next Steps
- `adr-proscons` - Quick pros/cons table
- `adr-superseded` - Superseded notice banner

### ✅ Documentation

1. **`TOOLING_GUIDE.md`** - Comprehensive usage guide
2. **`README.md`** - Auto-generated ADR index (already created)

## 🚀 Quick Start

### Test the bash script:
```bash
cd /Users/kberres/dev/CDAO/advana-marketplace/docs/adr
./create-adr.sh "Test Decision" --proposed
```

### Install VS Code snippets for the team:
```bash
cd /Users/kberres/dev/CDAO/advana-marketplace/docs/adr
mkdir -p ../../.vscode
cp adr-snippets.code-snippets ../../.vscode/
git add ../../.vscode/adr-snippets.code-snippets
```

### Update the ADR index anytime:
```bash
cd /Users/kberres/dev/CDAO/advana-marketplace/docs/adr
./generate-adr-index.sh > README.md
```

## 📋 Usage Examples

### Create a new ADR (default: Proposed)
```bash
./create-adr.sh "Database Migration Strategy"
```

### Create an accepted ADR
```bash
./create-adr.sh "API Gateway Implementation" --accepted
```

### Supersede an old decision
```bash
./supersede-adr.sh 0001 0002 "New architecture requires different approach"
```

### Use TypeScript version
```bash
./create-adr.ts "Cloud Provider Selection" --accepted
# OR
npx ts-node create-adr.ts "Cloud Provider Selection" --accepted
```

## 🎯 What Each Script Does

### create-adr.sh / create-adr.ts
1. Finds the highest numbered ADR
2. Increments to next number (e.g., 0001 → 0002)
3. Creates filename from title
4. Generates ADR from template with:
   - Current date
   - Chosen status (or Proposed by default)
   - All standard sections matching your format
5. Saves file and provides confirmation

### generate-adr-index.sh
1. Scans all ADR files (0001-*.md, 0002-*.md, etc.)
2. Extracts metadata (title, status, date, author)
3. Generates formatted table with status badges
4. Adds usage instructions and workflow diagram
5. Outputs complete README to stdout

### supersede-adr.sh
1. Validates both ADR numbers exist
2. Creates backups in `.backups/` directory
3. Changes old ADR status to "Superseded"
4. Inserts warning banner in old ADR
5. Adds reference in new ADR
6. Provides summary of changes

## 🔧 Technical Details

**All scripts are:**
- ✅ Executable (chmod +x applied)
- ✅ Error-checked (set -e for bash scripts)
- ✅ User-friendly with clear error messages
- ✅ Consistent with your ADR format

**Template sections included:**
- Context
- Decision
- Options Considered (with pros/cons tables)
- Rationale
- Consequences
- Compliance & Traceability
- Risks
- Open Questions
- Next Steps

## 📁 File Structure

```
docs/adr/
├── 0001-servicenow-api-integration-location.md  (existing)
├── create-adr.sh                                (✅ new)
├── create-adr.ts                                (✅ new)
├── generate-adr-index.sh                        (✅ new)
├── supersede-adr.sh                             (✅ new)
├── adr-snippets.code-snippets                   (✅ new)
├── TOOLING_GUIDE.md                             (✅ new)
└── README.md                                    (✅ generated)
```

## 🎉 You're All Set!

Everything is ready to use. The Advana Marketplace team now has:

1. ✅ Auto-numbered ADR creation (Bash & TypeScript)
2. ✅ Custom status flags (--accepted, --proposed, etc.)
3. ✅ Template matching your exact format
4. ✅ GitHub README index generator
5. ✅ Supersede ADR workflow
6. ✅ VS Code snippets for fast editing
7. ✅ Comprehensive documentation

**Next steps:**
1. Test the scripts with a sample ADR
2. Install VS Code snippets for the team
3. Add to your team's onboarding documentation
4. Share the TOOLING_GUIDE.md with the team

---

_Created by GitHub Copilot for Advana Marketplace Team_
_Date: 2025-11-19_
