# Installing VS Code Snippets for the Team

## Option 1: Workspace Snippets (Recommended for Teams)

This makes the snippets available to everyone who clones the repository.

```bash
# From the ADR directory
cd /Users/kberres/dev/CDAO/advana-marketplace/docs/adr

# Create .vscode directory if it doesn't exist
mkdir -p ../../.vscode

# Copy the snippets file
cp adr-snippets.code-snippets ../../.vscode/

# Add to git
cd ../..
git add .vscode/adr-snippets.code-snippets
git commit -m "Add ADR snippets for team"
```

## Option 2: Personal User Snippets

This installs snippets only for your VS Code instance.

### Method A: VS Code UI

1. Open VS Code
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. Type "Snippets: Configure User Snippets"
4. Select "markdown.json" (or "New Global Snippets file")
5. Copy the contents of `adr-snippets.code-snippets` and paste into the file
6. Save and close

### Method B: Command Line

```bash
# macOS/Linux
cp docs/adr/adr-snippets.code-snippets ~/Library/Application\ Support/Code/User/snippets/markdown.json

# Windows
cp docs/adr/adr-snippets.code-snippets %APPDATA%\Code\User\snippets\markdown.json
```

## Verify Installation

1. Open any `.md` file in VS Code
2. Type `adr-` and you should see autocomplete suggestions
3. Try typing `adr-full` and press Tab
4. You should see the complete ADR template inserted

## Using the Snippets

1. Open a markdown file
2. Type the snippet prefix (e.g., `adr-context`)
3. Press `Tab` to expand
4. Use `Tab` to move between placeholders
5. Fill in your content

## Available Snippets

All snippets start with `adr-`:

- `adr-full` - Complete template
- `adr-header` - Header only
- `adr-context` - Context section
- `adr-decision` - Decision section
- `adr-options` - Options with tables
- `adr-rationale` - Rationale section
- `adr-consequences` - Consequences table
- `adr-compliance` - Compliance section
- `adr-risks` - Risks section
- `adr-questions` - Open questions
- `adr-nextsteps` - Next steps
- `adr-proscons` - Pros/cons table
- `adr-superseded` - Superseded banner

## Troubleshooting

**Snippets not appearing?**
- Make sure you're in a `.md` file
- Restart VS Code after installation
- Check that the file was copied to the correct location

**Wrong file type?**
- The snippets file must be named with `.code-snippets` extension
- For workspace snippets, it must be in `.vscode/` directory
- For user snippets, it should be in the snippets folder

**Snippets conflict with others?**
- All ADR snippets use the `adr-` prefix to avoid conflicts
- You can modify the prefix in the snippets file if needed

## Team Recommendation

**Use Option 1 (Workspace Snippets)** so that:
- All team members have access automatically
- Snippets are version controlled
- No individual setup required
- Consistent experience across the team

Add to your team onboarding checklist:
```
☐ Clone repository
☐ Snippets are automatically available in .vscode/
☐ Test by typing "adr-" in any .md file
```
