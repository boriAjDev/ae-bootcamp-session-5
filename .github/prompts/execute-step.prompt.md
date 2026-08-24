---
description: Execute instructions from the current GitHub Issue step
agent: tdd-developer
tools: ['search', 'read', 'edit', 'execute', 'web', 'todo']
---

# Execute Exercise Step

Execute the current GitHub Issue step using the `tdd-developer` agent and the project instructions in `.github/copilot-instructions.md`.

Issue number (optional): ${input:issue-number:Enter the GitHub issue number, or leave blank to find the exercise issue}

## Workflow

1. If no issue number is provided, use the Workflow Utilities from the project instructions to find the main exercise issue whose title contains `Exercise:`.
2. Retrieve the issue with its comments using `gh issue view <issue-number> --comments`.
3. Parse the latest step instructions from the issue, identify its step number, and read its scope and success criteria.
4. Find every `:keyboard: Activity:` section for the current step and execute each activity systematically.
5. Follow the project testing scope and TDD workflow. For new behavior, write tests first, verify the expected RED result, implement minimally, verify GREEN, and refactor while tests remain green. For existing failing tests, limit fixes to the code needed to make the tests pass.
6. Keep notes in `.github/memory/scratch/working-notes.md` while the work is active.

## Scope Boundary

Do not create or run Playwright UI tests in this prompt. For any required Playwright work, stop the UI portion and hand it off using `/create-ui-tests`, then run it using `/run-ui-tests`. Those prompts automatically switch to the `test-engineer` agent. Do not duplicate their UI work here.

Do not commit or push changes. Committing and pushing is handled by `/commit-and-push`.

## Completion Handoff

Stop after completing the activities and report what changed, tests run, and any blockers. Provide the next commands in exactly this order:

- If the current step requires UI workflow: `/create-ui-tests` -> `/run-ui-tests` -> `/validate-step {step-number}`
- If UI workflow is not required: `/validate-step {step-number}`

Never recommend `/validate-step` before required UI prompts have completed. Follow all testing scope constraints from the project instructions.
