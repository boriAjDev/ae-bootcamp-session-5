---
description: Validate that all success criteria for the current step are met
agent: code-reviewer
tools: ['search', 'read', 'execute', 'web', 'todo']
---

# Validate Exercise Step

Validate the current exercise step using the `code-reviewer` agent and the project instructions in `.github/copilot-instructions.md`.

Step number (required): ${input:step-number:Enter the step number, for example 5-0 or 5-1}

If the step number is blank or invalid, stop and ask the user for it. Do not guess the step.

## Workflow

1. Use the Workflow Utilities from the project instructions to find the main exercise issue whose title contains `Exercise:`.
2. Retrieve the issue with all comments using `gh issue view <issue-number> --comments`.
3. Search the issue content for the exact heading `# Step {step-number}:`.
4. Extract that step’s `Success Criteria` section and all related requirements, including any required testing or UI workflow.
5. Check every criterion against the current workspace state. Inspect relevant source, tests, configuration, and command results; do not rely on claims alone.
6. Report each criterion as complete, incomplete, or blocked with concrete evidence and file references.
7. For incomplete items, provide the smallest actionable next step. Note missing tests, unverified behavior, lint/compile failures, and required UI validation separately.

## Output

Begin with the step number and an overall status. Then list each success criterion with its status and evidence, followed by concrete gaps, validation commands run, and any assumptions. Do not modify application code in this validation prompt unless a narrowly scoped review artifact is explicitly requested.
