---
description: Analyze changes, generate commit message, and push to feature branch
tools: ['read', 'execute', 'todo']
---

# Commit and Push Changes

Use the current active agent and the Git Workflow from `.github/copilot-instructions.md`.

Feature branch name (required): ${input:branch-name:Enter the feature branch name}

If the branch name is blank or not provided, stop and ask the user for it. Never infer a branch name and never commit to `main` or any branch other than the user-provided branch.

## Workflow

1. Confirm the user-provided branch name is present and is not `main`.
2. Determine whether the current exercise step includes required UI workflow. If it does, verify that `/run-ui-tests` succeeded in the current chat or run `npm run test:ui` after ensuring the required UI install has completed. Do not commit with unverified required UI tests.
3. Analyze the changes with `git diff` and `git diff --stat`. Review staged and unstaged changes, including untracked files, for scope and correctness.
4. Generate a concise descriptive commit message using conventional commit format such as `feat:`, `fix:`, `chore:`, or `docs:`.
5. If the specified branch does not exist, create it with `git checkout -b <branch-name>`. If it exists, switch to it with `git checkout <branch-name>`.
6. Stage all changes with `git add .`.
7. Commit the staged changes using the generated conventional commit message.
8. Push to the specified branch with `git push origin <branch-name>`.
9. Report the branch, commit hash/message, push result, and any validation performed.

Do not commit to `main` or any other branch. Do not push until the user-provided branch is active. Do not amend, force-push, reset, or discard changes without explicit user instruction.
