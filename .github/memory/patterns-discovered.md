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

---

### REST API: Input Validation Pattern

- **Context:** POST and PUT endpoints that accept user input for creating or updating resources.
- **Problem:** Missing or empty input can cause errors downstream if not validated early. Tests expect specific error codes (400) for bad input.
- **Solution:** Validate required fields at the start of the handler. Return 400 with an error message for missing or empty values. Use trim() to handle whitespace-only strings.
- **Example:**

  ```javascript
  app.post('/api/todos', (req, res) => {
    const { title } = req.body;
    
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    // Proceed with valid input
  });
  ```

- **Related files:** [`packages/backend/src/app.js`](../../packages/backend/src/app.js)

---

### REST API: Resource Not Found Pattern

- **Context:** PUT, PATCH, DELETE endpoints that operate on a specific resource by ID.
- **Problem:** Attempting to modify a non-existent resource should return a clear error, not crash or silently fail.
- **Solution:** After attempting to find the resource, check if it exists. Return 404 with an error message if not found. Use early return to avoid nesting.
- **Example:**

  ```javascript
  app.put('/api/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const todo = todos.find((t) => t.id === id);
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    // Proceed with update
  });
  ```

- **Related files:** [`packages/backend/src/app.js`](../../packages/backend/src/app.js)

---

### REST API: Toggle Boolean State Pattern

- **Context:** Endpoints that toggle a boolean property (e.g., completed status).
- **Problem:** Hardcoding the value (e.g., always setting to `true`) breaks the toggle behavior and causes tests to fail.
- **Solution:** Use the logical NOT operator (`!`) to flip the boolean value.
- **Example:**

  ```javascript
  app.patch('/api/todos/:id/toggle', (req, res) => {
    const todo = todos.find((t) => t.id === id);
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    todo.completed = !todo.completed; // Toggle
    res.json(todo);
  });
  ```

- **Related files:** [`packages/backend/src/app.js`](../../packages/backend/src/app.js)

---

### REST API: Delete Resource Pattern

- **Context:** DELETE endpoints that remove a resource from an in-memory array.
- **Problem:** Using `filter()` creates a new array, which may not update the reference correctly. Direct mutation is needed for in-memory stores.
- **Solution:** Use `findIndex()` to locate the resource, check if it exists (return 404 if not), then use `splice()` to remove it from the array.
- **Example:**

  ```javascript
  app.delete('/api/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const todoIndex = todos.findIndex((t) => t.id === id);
    
    if (todoIndex === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    todos.splice(todoIndex, 1);
    res.json({ message: 'Todo deleted' });
  });
  ```

- **Related files:** [`packages/backend/src/app.js`](../../packages/backend/src/app.js)

---

### TDD Workflow: Incremental Fix and Verify

- **Context:** Fixing multiple failing tests in a test suite.
- **Problem:** Fixing everything at once makes it hard to isolate issues and can introduce new bugs.
- **Solution:** Fix one endpoint or one class of failures at a time. Run focused tests after each fix to verify it works before moving to the next. Use `npm test -- --testNamePattern="..."` to run specific tests.
- **Example:**

  ```bash
  # Fix GET endpoint, then verify
  npm test -- --testNamePattern="GET /api/todos"
  
  # Fix POST endpoint, then verify
  npm test -- --testNamePattern="POST /api/todos"
  
  # Finally, run all tests
  npm test
  ```

- **Related files:** [`packages/backend/__tests__/app.test.js`](../../packages/backend/__tests__/app.test.js)
