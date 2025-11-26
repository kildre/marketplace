# ADR Tools - Quick Reference Card

## 🚀 Commands Cheat Sheet

### Create New ADR
```bash
# Proposed (default)
./create-adr.sh "Title Here"

# Accepted
./create-adr.sh "Title Here" --accepted

# TypeScript version
./create-adr.ts "Title Here" --accepted
```

### Generate README Index
```bash
./generate-adr-index.sh > README.md
```

### Supersede an ADR
```bash
./supersede-adr.sh <old#> <new#> "Reason"
# Example:
./supersede-adr.sh 0001 0003 "Better approach found"
```

## 📝 VS Code Snippets

Type these prefixes in markdown files and press Tab:

| Snippet | What It Creates |
|---------|----------------|
| `adr-full` | Complete ADR template |
| `adr-header` | Header with metadata |
| `adr-options` | Options with pros/cons tables |
| `adr-context` | Context section |
| `adr-decision` | Decision section |
| `adr-consequences` | Consequences table |
| `adr-proscons` | Quick pros/cons table |
| `adr-superseded` | Superseded banner |

## 🎯 Status Flags

- `--proposed` (default) - Under review
- `--accepted` - Approved and active
- `--deprecated` - No longer recommended
- `--superseded` - Replaced by newer ADR

## 📊 Status Badges in Index

- ✅ Accepted
- 🔄 Proposed  
- ⚠️ Deprecated
- 🔁 Superseded

## 🔄 Typical Workflow

1. Create ADR with `--proposed`
2. Edit and fill in sections
3. Team review
4. Update to `--accepted` in file
5. Regenerate index
6. Commit

## 📂 All Files

- `create-adr.sh` - Bash ADR creator
- `create-adr.ts` - TypeScript ADR creator  
- `generate-adr-index.sh` - README generator
- `supersede-adr.sh` - Mark ADR as superseded
- `adr-snippets.code-snippets` - VS Code snippets
- `TOOLING_GUIDE.md` - Full documentation
- `README.md` - Auto-generated index

## 💡 Pro Tips

1. **Always use scripts** for consistent numbering
2. **Regenerate README** after any ADR changes
3. **Install snippets** in `.vscode/` for team sharing
4. **Create backups** are automatic with supersede script
5. **Status updates** - just edit the Status line manually

## 🔧 Setup (One Time)

```bash
# Make scripts executable (already done)
chmod +x *.sh *.ts

# Install snippets for team
mkdir -p ../../.vscode
cp adr-snippets.code-snippets ../../.vscode/

# Generate initial README
./generate-adr-index.sh > README.md
```

## 📞 Help

- Full guide: See `TOOLING_GUIDE.md`
- Package summary: See `PACKAGE_SUMMARY.md`
- Example ADR: See `0001-servicenow-api-integration-location.md`
