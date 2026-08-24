---
description: Create UI tests for required critical user journeys
agent: test-engineer
tools: ['search', 'read', 'edit', 'execute', 'todo']
---

# Create Critical UI Tests

Create or maintain Playwright tests using the `test-engineer` agent and the project instructions in `.github/copilot-instructions.md`.

Journeys (optional): ${input:journeys:Enter requested journeys, or leave blank for create, edit, toggle, delete, and core error-state handling}

## Workflow

1. If journeys are not provided, use this default set: create, edit, toggle, delete, and core error-state handling.
2. Inspect the existing Playwright configuration, tests, page objects, application behavior, and available test scripts before editing.
3. Select the highest-risk scenarios when more than five candidates exist and list deferred scenarios in the final report.
4. Generate or update tests using the project UI test framework. Prefer accessibility-first selectors and state-based waits.
5. Apply Page Object Model best practices: put reusable interactions and selectors in page object classes or helpers, keep test files focused on scenario intent and assertions, and avoid duplicated selectors or interaction flows.
6. Keep tests deterministic and isolated. Use unique data and supported setup/cleanup; do not rely on shared mutable state, execution order, arbitrary timeouts, or fixed sleeps.
7. Include at least one error-path test within the authored set.
8. Before finishing, count the created or updated Playwright test cases by checking `test(...)` and `it(...)` declarations. The final authored count must be no more than 5 and should target 3-5 total. If it exceeds 5, reduce it before reporting completion.

## Hard Limit

Create a maximum of 5 Playwright tests for this run. Do not claim a small scope if the final authored count is greater than 5. If more than five candidate scenarios exist, defer the lower-risk scenarios and name them explicitly.

## Output

Report the files changed, the final number of created or updated Playwright test cases, scenarios covered, error path included, deferred scenarios, and the focused command used to validate the tests. Do not claim tests pass unless they were run successfully.
