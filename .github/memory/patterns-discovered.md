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

---

### Code Quality: Systematic Lint Error Resolution

- **Context:** Resolving ESLint errors across a codebase after implementing features.
- **Problem:** Fixing lint errors randomly can miss related issues and make it hard to verify the impact of changes.
- **Solution:** Run lint to identify all errors, categorize by type (unused variables, console statements, style issues), fix similar issues together in one pass, then verify tests still pass. This ensures no functionality is broken while improving code quality.
- **Example:**

  ```bash
  # Identify errors by category
  npm run lint
  
  # Fix unused variables
  # Remove or use unused imports/variables
  
  # Fix console statements
  # Remove console.log or replace with proper logging
  
  # Verify tests after fixes
  npm test
  
  # Confirm zero lint errors
  npm run lint
  ```

- **Related files:** [`packages/backend/src/app.js`](../../packages/backend/src/app.js), [`packages/backend/src/index.js`](../../packages/backend/src/index.js)

---

### React Query: Error Handling in Queries

- **Context:** React Query hooks that fetch data from an API.
- **Problem:** Without error handling, failed API requests can cause silent failures or unclear error states in the UI.
- **Solution:** Check `response.ok` in the `queryFn` and throw an error with a descriptive message if the response indicates failure. Use the `error` state from `useQuery` to display error messages in the UI.
- **Example:**

  ```javascript
  const useTodos = () => {
    return useQuery({
      queryKey: ['todos'],
      queryFn: async () => {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error('Failed to load todos');
        }
        return response.json();
      },
    });
  };

  // In component
  const { data: todos = [], isLoading, error } = useTodos();

  {error && (
    <Card>
      <CardContent>
        <Typography color="error" align="center">
          Failed to load todos. Please try again later.
        </Typography>
      </CardContent>
    </Card>
  )}
  ```

- **Related files:** [`packages/frontend/src/App.js`](../../packages/frontend/src/App.js)

---

### React Query: Mutation Pattern with Cache Invalidation

- **Context:** Creating, updating, or deleting data with React Query mutations.
- **Problem:** After a successful mutation, the UI can display stale data if the cache isn't updated.
- **Solution:** Use `useMutation` with an `onSuccess` callback that invalidates the relevant query cache. This triggers an automatic refetch of the latest data.
- **Example:**

  ```javascript
  const deleteTodoMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
  ```

- **Related files:** [`packages/frontend/src/App.js`](../../packages/frontend/src/App.js)

---

### React: Inline Edit Pattern with State Management

- **Context:** Allowing users to edit items in a list without navigating to a separate page.
- **Problem:** Managing edit state across multiple list items can become complex and error-prone.
- **Solution:** Use state variables to track which item is being edited (`editingId`) and the temporary edited value (`editingTitle`). Show an input field when editing, otherwise show the display text. Provide save and cancel actions.
- **Example:**

  ```javascript
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleStartEdit = (id, currentTitle) => {
    setEditingId(id);
    setEditingTitle(currentTitle);
  };

  const handleSaveEdit = (id) => {
    if (editingTitle.trim()) {
      editTodoMutation.mutate({ id, title: editingTitle });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  // In render
  {editingId === todo.id ? (
    <Box sx={{ flex: 1, display: 'flex', gap: 1 }}>
      <TextField
        value={editingTitle}
        onChange={(e) => setEditingTitle(e.target.value)}
      />
      <Button onClick={() => handleSaveEdit(todo.id)}>Save</Button>
      <Button onClick={handleCancelEdit}>Cancel</Button>
    </Box>
  ) : (
    <Typography>{todo.title}</Typography>
  )}
  ```

- **Related files:** [`packages/frontend/src/App.js`](../../packages/frontend/src/App.js)

---

### React: Conditional Rendering for Empty State

- **Context:** Displaying a list of items that may be empty.
- **Problem:** Empty lists can appear broken or confusing to users without a message explaining the state.
- **Solution:** Add conditional rendering that shows a user-friendly message when the list is empty. Check both loading and error states to ensure the message only shows when appropriate.
- **Example:**

  ```javascript
  {!isLoading && !error && todos.length === 0 && (
    <Card>
      <CardContent>
        <Typography align="center" color="text.secondary">
          No todos yet. Add one above to get started!
        </Typography>
      </CardContent>
    </Card>
  )}

  {!isLoading && !error && todos.length > 0 && (
    <Card>
      <List>
        {todos.map(todo => <ListItem key={todo.id}>...</ListItem>)}
      </List>
    </Card>
  )}
  ```

- **Related files:** [`packages/frontend/src/App.js`](../../packages/frontend/src/App.js)

---

### React: Derived State from Props/Data

- **Context:** Displaying statistics or computed values based on a list of data.
- **Problem:** Hardcoding values (like `0`) makes the UI static and inaccurate.
- **Solution:** Calculate derived values directly from the source data using array methods. This keeps the UI in sync with the data automatically.
- **Example:**

  ```javascript
  const incompleteCount = todos.filter((todo) => !todo.completed).length;
  const completedCount = todos.filter((todo) => todo.completed).length;

  // In render
  <Chip label={`${incompleteCount} items left`} color="primary" />
  <Chip label={`${completedCount} completed`} color="success" />
  ```

- **Related files:** [`packages/frontend/src/App.js`](../../packages/frontend/src/App.js)

---

### React Testing Library: Test Organization Pattern

- **Context:** Writing comprehensive test suites for React components.
- **Problem:** Large test files with many tests can become hard to navigate and understand.
- **Solution:** Organize tests into logical `describe` blocks by feature area. Create helper functions for common setup (like rendering with providers). Use `beforeEach` and `afterEach` for test isolation.
- **Example:**

  ```javascript
  const createTestQueryClient = () =>
    new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

  const renderApp = () => {
    const testQueryClient = createTestQueryClient();
    return render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );
  };

  describe('Basic Rendering', () => {
    test('renders TODO App heading', async () => { ... });
  });

  describe('Empty State', () => {
    test('displays empty state message when no todos exist', async () => { ... });
  });

  describe('Delete Functionality', () => {
    test('deletes a todo when delete button is clicked', async () => { ... });
  });
  ```

- **Related files:** [`packages/frontend/src/__tests__/App.test.js`](../../packages/frontend/src/__tests__/App.test.js)

---

### React Testing Library: Mocking Fetch for Component Tests

- **Context:** Testing components that make API calls using fetch.
- **Problem:** Real API calls in tests are slow, unreliable, and can cause test failures due to network issues.
- **Solution:** Mock `global.fetch` with Jest. Set up different mock implementations for different test scenarios. Clear mocks between tests to avoid interference.
- **Example:**

  ```javascript
  global.fetch = jest.fn();

  beforeEach(() => {
    global.fetch.mockClear();
  });

  test('displays todos from API', async () => {
    const mockTodos = [
      { id: 1, title: 'Test todo', completed: false }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTodos,
    });

    renderApp();

    await waitFor(() => {
      expect(screen.getByText('Test todo')).toBeInTheDocument();
    });
  });

  test('handles API errors', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    renderApp();

    await waitFor(() => {
      expect(screen.getByText(/failed to load todos/i)).toBeInTheDocument();
    });
  });
  ```

- **Related files:** [`packages/frontend/src/__tests__/App.test.js`](../../packages/frontend/src/__tests__/App.test.js)

---

### React Testing Library: waitFor Best Practice

- **Context:** Testing asynchronous behavior in React components.
- **Problem:** Using multiple assertions inside `waitFor` can cause lint errors and makes tests harder to debug.
- **Solution:** Use `waitFor` for a single assertion that waits for a specific condition. Place additional synchronous assertions outside of `waitFor`.
- **Example:**

  ```javascript
  // ❌ Bad: Multiple assertions in waitFor
  await waitFor(() => {
    expect(screen.queryByDisplayValue('Title')).not.toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
  });

  // ✅ Good: Single assertion in waitFor, others outside
  await waitFor(() => {
    expect(screen.queryByDisplayValue('Title')).not.toBeInTheDocument();
  });
  expect(screen.getByText('Title')).toBeInTheDocument();
  ```

- **Related files:** [`packages/frontend/src/__tests__/App.test.js`](../../packages/frontend/src/__tests__/App.test.js)

---

### TDD Frontend: Test-First Development with React Testing Library

- **Context:** Implementing new React component features or fixing bugs.
- **Problem:** Writing implementation code first can lead to untestable code or missing test coverage.
- **Solution:** Follow the RED-GREEN-REFACTOR cycle: write tests first that describe the desired behavior (RED - they fail), implement the minimum code to make tests pass (GREEN), then refactor while keeping tests green. This ensures every feature has test coverage and is testable by design.
- **Example:**

  ```javascript
  // 1. RED: Write test first (it will fail)
  test('deletes a todo when delete button is clicked', async () => {
    // Setup mock data
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, title: 'Todo', completed: false }],
    });

    renderApp();

    // Verify delete button works
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/todos/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  // 2. Run test - it fails because delete isn't implemented
  // 3. GREEN: Implement minimum code to pass
  const deleteTodoMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  // 4. Run test - it passes
  // 5. REFACTOR: Clean up while keeping tests green
  ```

- **Related files:** [`packages/frontend/src/__tests__/App.test.js`](../../packages/frontend/src/__tests__/App.test.js), [`packages/frontend/src/App.js`](../../packages/frontend/src/App.js)

---

### API Configuration: Relative vs Absolute URLs

- **Context:** Configuring API endpoints in frontend applications.
- **Problem:** Hardcoded absolute URLs (like `http://localhost:3001/api/todos`) break when deploying to different environments or when the API is served from the same domain.
- **Solution:** Use relative URLs (like `/api/todos`) when the frontend and backend are served from the same origin or when using a proxy. This makes the application more portable across environments.
- **Example:**

  ```javascript
  // ❌ Bad: Hardcoded absolute URL
  const API_URL = 'http://localhost:3001/api/todos';

  // ✅ Good: Relative URL
  const API_URL = '/api/todos';

  // For development with separate ports, configure proxy in package.json:
  {
    "proxy": "http://localhost:3001"
  }
  ```

- **Related files:** [`packages/frontend/src/App.js`](../../packages/frontend/src/App.js), [`packages/frontend/package.json`](../../packages/frontend/package.json)
