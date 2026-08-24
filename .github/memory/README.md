# Working Memory System

This directory gives the TODO application a lightweight memory system for recording development discoveries, decisions, and lessons. It helps future contributors and AI assistants recover useful context without placing every temporary thought in the permanent project instructions.

## Two Types of Memory

### Persistent Memory

[`.github/copilot-instructions.md`](../copilot-instructions.md) is persistent memory. It contains foundational project context, development principles, workflows, and conventions that should guide work across every session. Changes here affect how Copilot approaches the whole repository and should be deliberate and committed.

### Working Memory

The `.github/memory/` directory contains discoveries and patterns gathered while developing:

- `session-notes.md` stores completed session summaries. It is a committed historical record.
- `patterns-discovered.md` stores reusable code patterns, decisions, and lessons accumulated over time. It is committed.
- `scratch/working-notes.md` stores active-session notes. It is intentionally ignored and should not be committed.

The separation keeps short-lived investigation details from cluttering the permanent instructions while preserving conclusions that will help future work.

## Directory Structure

```text
.github/memory/
├── README.md
├── session-notes.md
├── patterns-discovered.md
└── scratch/
    ├── .gitignore
    └── working-notes.md
```

## When to Use Each File

### During TDD

Use `scratch/working-notes.md` to capture the current failing test, the behavior it specifies, hypotheses, and the smallest implementation that might make it pass. Record a useful discovery in `patterns-discovered.md` when it applies beyond the current test, such as an API contract or a reliable test setup pattern.

When a TDD cycle or feature is complete, summarize the meaningful result in `session-notes.md`: what changed, which tests passed, and what decisions future work should preserve.

### During Linting

Use `scratch/working-notes.md` to track lint failures, their categories, and the fixes tried. Add a recurring or non-obvious lint lesson to `patterns-discovered.md`, including the relevant file or configuration. Do not preserve every one-off warning in the historical notes.

### During Debugging

Use `scratch/working-notes.md` for the active reproduction steps, observations, competing hypotheses, and blockers. Once the issue is resolved, move the durable conclusion to `patterns-discovered.md` or include it in a completed `session-notes.md` entry.

## How AI Uses the Memory

Before suggesting changes, AI should read the relevant persistent instructions and then check the memory files related to the task. Patterns in `patterns-discovered.md` provide reusable constraints and examples. Recent entries in `session-notes.md` provide historical context. The scratch file describes work that is currently in progress and may explain temporary decisions or known blockers.

AI should treat memory as project context, not unquestionable truth. It should verify old conclusions against the current code and tests, update stale patterns, and record new durable findings in the appropriate committed file. During active work, notes should be concise and factual so another person or AI can continue from them.

## End-of-Session Routine

1. Review `scratch/working-notes.md` for findings that remain useful.
2. Summarize completed work and decisions in `session-notes.md`.
3. Add broadly reusable discoveries to `patterns-discovered.md`.
4. Leave temporary investigation detail in scratch only when the session is still active; scratch files are ignored by Git.
5. Clear or replace the scratch notes when starting the next session.

`session-notes.md` is for completed session summaries and is committed. `scratch/working-notes.md` is for active work and is not committed. This distinction preserves useful history without turning unfinished investigation into project policy.
