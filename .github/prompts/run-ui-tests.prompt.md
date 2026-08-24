---
description: Run UI tests and summarize failures
agent: test-engineer
tools: ['read', 'execute', 'todo']
---

# Run UI Tests

Run the Playwright UI suite using the `test-engineer` agent and report outcomes clearly.

## Mandatory Install Step

Before running `/run-ui-tests`, always run:

```bash
npm run test:ui:install --workspace=frontend
```

This is mandatory in Ubuntu/Linux environments and must perform `playwright install --with-deps chromium` before tests run. Repeat it after a container rebuild. The `test:ui:install` script includes bounded Ubuntu repository remediation for the common Yarn key issue and one retry.

Do not perform ad-hoc package hunting or broad operating-system troubleshooting beyond that automated remediation. If installation still fails, stop immediately and report an environment blocker with the failing command and the key error lines. Do not run Playwright tests after a failed dependency install.

## Test Workflow

1. Run the mandatory UI dependency install and confirm it succeeds.
2. Ensure both backend and frontend are running before UI tests. Start them from the repository root with `npm start` if needed, without disrupting an already healthy server.
3. Run the project UI test command: `npm run test:ui`.
4. Summarize pass, fail, skip, and flaky outcomes with test names when available.
5. For every failure, provide the likely root cause category: application code, test code, or environment. Include the evidence and the next discriminating check.
6. Note missing journey coverage and any selector, wait, or isolation problems discovered.

Do not modify application or test code in this prompt unless a narrowly scoped repair is explicitly requested. Do not claim success when install or test execution was skipped.
