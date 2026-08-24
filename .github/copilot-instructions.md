# Copilot Instructions

## Project Context

- Full-stack TODO application with React frontend and Express backend.
- Focus on iterative, feedback-driven development.
- Current phase: Backend stabilization and frontend feature completion.

## Documentation References

- [Project overview](../docs/project-overview.md): Architecture, tech stack, and structure.
- [Testing guidelines](../docs/testing-guidelines.md): Test patterns and standards.
- [Workflow patterns](../docs/workflow-patterns.md): Development workflow guidance.

## Development Principles

- **Test-Driven Development:** Follow the Red-Green-Refactor cycle.
- **Incremental Changes:** Make small, testable modifications.
- **Systematic Debugging:** Use test failures as guides.
- **Validation Before Commit:** Ensure all tests pass and there are no lint errors.

## Testing Scope

This project uses unit tests, integration tests, and UI end-to-end tests:

- **Backend:** Jest and Supertest for API testing.
- **Frontend:** React Testing Library for component unit and integration tests.
- **UI testing:** Playwright for critical user journey automation.
- **Manual browser testing:** Exploratory validation and visual checks.

This combines fast feedback from unit and integration tests with end-to-end quality confidence from UI tests.

### Testing Approach by Context

- **Backend API changes:** Write Jest tests first, then implement using Red-Green-Refactor.
- **Frontend component features:** Write React Testing Library tests first for component behavior, then implement using Red-Green-Refactor. Follow with manual browser testing for full UI flows.
- This is true TDD: test first, then code to pass the test.

## Workflow Patterns

1. **TDD Workflow:** Write or fix tests, run them, observe failure, implement, get to green, then refactor.
2. **Code Quality Workflow:** Run lint, categorize issues, fix them systematically, then re-validate.
3. **Integration Workflow:** Identify the issue, debug, test, fix, and verify end to end.
4. **UI Testing Workflow:** Define critical journeys, create UI tests, run them, debug failures, and validate coverage.

## Agent Usage

- **tdd-developer:** Use for implementation and unit/integration TDD cycles. Do not create or run Playwright UI tests in this mode.
- **code-reviewer:** Use for addressing lint errors and code quality improvements.
- **test-engineer:** Owns all Playwright UI test authoring and execution, failure triage, and isolation checks.

## Memory System

- **Persistent Memory:** This file (`.github/copilot-instructions.md`) contains foundational principles and workflows.
- **Working Memory:** The `.github/memory/` directory contains discoveries and patterns.
- During active development, take notes in `.github/memory/scratch/working-notes.md` (not committed).
- At the end of a session, summarize key findings in `.github/memory/session-notes.md` (committed).
- Document recurring code patterns in `.github/memory/patterns-discovered.md` (committed).
- Reference these files when providing context-aware suggestions.

## Workflow Utilities

GitHub CLI commands are available to all modes for workflow automation:

- List open issues: `gh issue list --state open`
- Get issue details: `gh issue view <issue-number>`
- Get issue with comments: `gh issue view <issue-number> --comments`

The main exercise issue has `Exercise:` in its title. Steps are posted as comments on the main issue. Use these commands when `/execute-step` or `/validate-step` prompts are invoked.

## Git Workflow

- Use conventional commits such as `feat:`, `fix:`, `chore:`, and `docs:`.
- Use feature branches named `feature/<descriptive-name>`.
- Always stage all changes before committing with `git add .`.
- Push to the correct branch with `git push origin <branch-name>`.