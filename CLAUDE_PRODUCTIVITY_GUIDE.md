# Claude Code Productivity Guide

A reference for getting the most out of Claude Code in your daily workflow.

---

## Table of Contents

- [Slash Commands](#slash-commands)
- [Prompt Strategies](#prompt-strategies)
- [Context Management](#context-management)
- [Code Tasks](#code-tasks)
- [Debugging & Investigation](#debugging--investigation)
- [Git & PR Workflow](#git--pr-workflow)
- [Power Patterns](#power-patterns)
- [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

---

## Slash Commands

| Command | Description | When to Use |
|--------|-------------|-------------|
| `/help` | Show available commands and usage | Getting started or stuck |
| `/clear` | Clear conversation context | Start fresh on a new task |
| `/compact` | Summarize and compress conversation | Long sessions running out of context |
| `/memory` | View and manage persistent memory | Check what Claude remembers about your project |
| `/cost` | Show token usage and cost estimate | Monitor usage on long sessions |
| `/model` | Switch between Claude models | Switch to Opus for harder reasoning tasks |
| `/fast` | Toggle fast mode | Speed up output for simpler tasks |
| `/review` | Code review of current changes | Pre-PR sanity check |
| `/commit` | Generate a commit message and commit | After finishing a feature or fix |
| `/init` | Initialize Claude in a new project | Set up CLAUDE.md and project context |

---

## Prompt Strategies

### Be Specific About Scope

| Instead of... | Say... |
|--------------|--------|
| "Fix the bug" | "Fix the null pointer bug in `useAuth.ts:42` where `user` can be undefined on first render" |
| "Improve performance" | "Reduce re-renders in `UserList` by memoizing the filtered array" |
| "Refactor this" | "Extract the API call logic in `App.tsx:80-120` into a custom hook" |
| "Add a feature" | "Add a loading spinner to the submit button while the form POST is in-flight" |
| "Clean this up" | "Remove unused imports and dead code in `apiService.ts` without changing behavior" |

### Constraint Prompts (High Value)

| Pattern | Example |
|---------|---------|
| **Scope limit** | "Only change `footer-component.tsx`, nothing else" |
| **Style constraint** | "Use existing patterns in this file, don't introduce new abstractions" |
| **No new files** | "Solve this by editing existing files only" |
| **Minimal change** | "Make the smallest possible change to fix this" |
| **Preserve behavior** | "Refactor without changing any observable behavior or API surface" |

### Output Format Prompts

| Pattern | Example |
|---------|---------|
| Ask for a plan first | "Plan the approach before writing any code" |
| Explain then implement | "Explain what you're going to change, then do it" |
| Step by step | "Walk me through each change you make" |
| Show diffs only | "Show me what would change, don't apply it yet" |
| List files affected | "Which files will this change touch?" |

---

## Context Management

| Technique | How to Use | Benefit |
|-----------|-----------|---------|
| **CLAUDE.md** | Add project conventions, stack info, rules | Loaded automatically every session |
| **Memory files** | Ask Claude to remember patterns, preferences | Persists across sessions |
| `/compact` | Run mid-session when context fills up | Keeps working without losing thread |
| `/clear` | Start new task from scratch | Prevents context bleed between tasks |
| **Paste errors directly** | Include full stack traces in your prompt | Claude diagnoses faster |
| **Reference line numbers** | "Look at `App.tsx:80`" | Faster navigation, less ambiguity |
| **Give file paths** | Always use full relative paths | Avoids searching wrong directories |

---

## Code Tasks

### Task Framing Cheat Sheet

| Task Type | Best Prompt Pattern |
|-----------|-------------------|
| Bug fix | "There's a bug where [symptom]. It happens when [steps]. Expected: [X]. Actual: [Y]. Fix it." |
| New feature | "Add [feature] to [component]. It should [behavior]. Match the existing style in [nearby file]." |
| Refactor | "Refactor [X] to [goal]. Don't change tests or public API." |
| Add tests | "Write tests for [function/component]. Cover [happy path, edge case, error case]." |
| Understand code | "Explain what [file/function] does and why it's structured this way." |
| Review | "Review [file] for bugs, security issues, and style inconsistencies." |
| Trace a flow | "Trace the full data flow from [user action] to [final output]." |

### Planning Before Coding

Ask Claude to plan before writing code for any non-trivial task:

```
Before writing any code, give me a bullet-point plan of:
1. What files you'll change
2. What logic you'll add/modify
3. Any risks or edge cases to watch for
```

---

## Debugging & Investigation

| Technique | Prompt Example |
|-----------|---------------|
| Root cause first | "Don't fix this yet — just identify the root cause of [error]" |
| Narrow the blast radius | "What is the minimal change to stop this crash?" |
| Check assumptions | "Is my assumption that [X] is true actually correct in this codebase?" |
| Trace the call chain | "Trace what happens when `submitForm()` is called through to the API response" |
| Compare behavior | "Why does this work in dev but not in the test environment?" |
| Rubber duck | "I think the problem is [X]. Does that make sense given [Y]?" |

### When Claude Gets It Wrong

| Situation | What to Do |
|-----------|-----------|
| Wrong file edited | "Undo that — I meant [correct file]" |
| Too many changes | "That's too broad. Revert and only change [specific thing]" |
| Wrong approach | "That approach has [problem]. Try [alternative] instead" |
| Keeps making same mistake | Add it to CLAUDE.md as a rule |
| Hallucinated API | "Verify that method actually exists before using it" |

---

## Git & PR Workflow

| Command / Pattern | Description |
|------------------|-------------|
| `/commit` | Auto-generate conventional commit message and commit staged changes |
| "What changed since main?" | Get a summary of your branch's diff |
| "Review my changes before I commit" | Pre-commit code review |
| "Create a PR for this branch" | Draft PR title, summary, and test plan |
| "Summarize this PR for a reviewer" | Get a plain-English summary of the diff |
| "Write a CHANGELOG entry for this" | Generate release notes from commits |

### PR Description Template Claude Can Generate

```
Tell Claude: "Write a PR description for these changes with:
- Summary (3 bullets max)
- What changed and why
- How to test it
- Any risks or follow-ups"
```

---

## Power Patterns

### Multi-Step Chaining

Break large tasks into a chain of focused prompts:

```
Step 1: "Explore [feature area] and tell me what files are involved"
Step 2: "Now write a plan for adding [X] to those files"
Step 3: "Implement step 1 of the plan"
Step 4: "Run the tests and fix any failures"
Step 5: "Commit the changes with a good message"
```

### The "Read Before Write" Rule

Always ask Claude to read files before editing them. If it doesn't do this automatically, say:

```
"Read [file] first and confirm you understand it before making any changes"
```

### Parallel Investigation

Claude can research multiple things at once:

```
"Simultaneously: (1) find all usages of useAuth, (2) check if there are any tests for it,
and (3) look for any TODO comments related to auth"
```

### Scoped Sessions

Keep one Claude session per task/feature to avoid context bleed:

- `/clear` between unrelated tasks
- Open a new terminal tab for a new feature
- Use CLAUDE.md to share global context instead of re-explaining each session

### Teaching Claude Your Codebase

```
"Here's how auth works in this project: [explanation].
Remember this for the rest of our session."
```

Or permanently via CLAUDE.md:

```
"Add this to CLAUDE.md: All API calls must go through apiService.ts, never fetch directly"
```

---

## Anti-Patterns to Avoid

| Anti-Pattern | Why It Hurts | Better Approach |
|-------------|-------------|-----------------|
| Vague requests | Claude makes assumptions, produces wrong output | Be specific about files, lines, and expected behavior |
| Asking for too much at once | Quality drops, harder to review | Break into focused sub-tasks |
| No constraints | Claude over-engineers or adds unwanted abstractions | Add "keep it minimal", "don't add new files", etc. |
| Not reading output | Bugs get introduced silently | Review every diff before moving on |
| Fixing symptoms not causes | Bug comes back | Ask for root cause analysis first |
| Skipping the plan for complex tasks | Implementation goes in wrong direction | Ask for a plan first, approve it, then implement |
| Letting context get too long | Claude loses track of earlier decisions | Use `/compact` or `/clear` proactively |
| Re-explaining every session | Wastes time and tokens | Use CLAUDE.md and memory files |

---

## Quick Reference Card

```
INVESTIGATE    → "Read X and explain how it works"
PLAN           → "Plan the approach before writing any code"
CONSTRAIN      → "Only change X, don't touch Y"
DEBUG          → "Identify root cause before fixing"
COMMIT         → /commit
REVIEW         → "Review my changes for bugs and issues"
REMEMBER       → "Add this to CLAUDE.md: ..."
RESET          → /clear
SAVE CONTEXT   → /compact
```

---

*Keep this file updated as you discover new patterns that work well in your workflow.*
