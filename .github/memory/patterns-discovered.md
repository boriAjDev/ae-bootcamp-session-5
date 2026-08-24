# Patterns Discovered

Use this file to accumulate reusable code patterns, technical decisions, and lessons learned over time. Add a pattern when it applies beyond one task or prevents a recurring mistake. This file is committed to Git.

## Pattern Template

### [Pattern Name]

- **Context:** [Where or when this pattern applies]
- **Problem:** [What can go wrong without it]
- **Solution:** [The recommended approach]
- **Example:**

  ```javascript
  // Add a focused example here.
  ```

- **Related files:** [Link to relevant files]

## Example Pattern

### Service Initialization: Empty Array vs Null

- **Context:** Services that manage a collection of TODO records in memory.
- **Problem:** Initializing the collection as `null` forces every read and mutation path to handle a missing collection and can cause runtime errors when code expects an array.
- **Solution:** Initialize the collection as an empty array. This gives list, create, update, and delete operations a consistent collection interface from startup.
- **Example:**

  ```javascript
  const todos = [];
  ```

- **Related files:** [`packages/backend/src/app.js`](../../packages/backend/src/app.js), [`packages/backend/__tests__/app.test.js`](../../packages/backend/__tests__/app.test.js)
