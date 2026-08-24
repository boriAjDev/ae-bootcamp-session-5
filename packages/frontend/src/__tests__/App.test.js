import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '../App';

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// Mock fetch for tests
global.fetch = jest.fn();

beforeEach(() => {
  global.fetch.mockClear();
});

afterEach(() => {
  jest.clearAllMocks();
});

// Helper to render App with QueryClient
const renderApp = () => {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>
      <App />
    </QueryClientProvider>
  );
};

describe('Basic Rendering', () => {
  test('renders TODO App heading', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderApp();

    const headingElement = await screen.findByText(/TODO App/i);
    expect(headingElement).toBeInTheDocument();
  });
});

describe('Empty State', () => {
  test('displays empty state message when no todos exist', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderApp();

    await waitFor(() => {
      expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
    });
  });
});

describe('Stats Calculation', () => {
  test('displays correct count of incomplete items', async () => {
    const mockTodos = [
      { id: 1, title: 'Todo 1', completed: false },
      { id: 2, title: 'Todo 2', completed: true },
      { id: 3, title: 'Todo 3', completed: false },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTodos,
    });

    renderApp();

    await waitFor(() => {
      expect(screen.getByText(/2 items left/i)).toBeInTheDocument();
    });
  });

  test('displays correct count of completed items', async () => {
    const mockTodos = [
      { id: 1, title: 'Todo 1', completed: false },
      { id: 2, title: 'Todo 2', completed: true },
      { id: 3, title: 'Todo 3', completed: true },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTodos,
    });

    renderApp();

    await waitFor(() => {
      expect(screen.getByText(/2 completed/i)).toBeInTheDocument();
    });
  });
});

describe('Delete Functionality', () => {
  test('deletes a todo when delete button is clicked', async () => {
    const mockTodos = [
      { id: 1, title: 'Todo to delete', completed: false },
    ];

    // Mock initial fetch
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTodos,
    });

    renderApp();

    await waitFor(() => {
      expect(screen.getByText('Todo to delete')).toBeInTheDocument();
    });

    // Mock delete request
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    // Mock refetch after delete
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const user = userEvent.setup();
    const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
    await user.click(deleteButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/todos/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });
});

describe('Error Handling', () => {
  test('displays error message when fetching todos fails', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    renderApp();

    await waitFor(() => {
      expect(screen.getByText(/failed to load todos/i)).toBeInTheDocument();
    });
  });

  test('displays error message when API returns error status', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Server error' }),
    });

    renderApp();

    await waitFor(() => {
      expect(screen.getByText(/failed to load todos/i)).toBeInTheDocument();
    });
  });
});

describe('Edit Functionality', () => {
  test('allows editing a todo title', async () => {
    const mockTodos = [
      { id: 1, title: 'Original title', completed: false },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTodos,
    });

    renderApp();

    await waitFor(() => {
      expect(screen.getByText('Original title')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const editButton = screen.getAllByRole('button', { name: /edit/i })[0];
    await user.click(editButton);

    // Should show an input field with the current title
    const input = screen.getByDisplayValue('Original title');
    expect(input).toBeInTheDocument();

    // Change the title
    await user.clear(input);
    await user.type(input, 'Updated title');

    // Mock update request
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, title: 'Updated title', completed: false }),
    });

    // Mock refetch after update
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, title: 'Updated title', completed: false }],
    });

    // Save the changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/todos/1'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ title: 'Updated title' }),
        })
      );
    });
  });

  test('cancels editing when cancel button is clicked', async () => {
    const mockTodos = [
      { id: 1, title: 'Original title', completed: false },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTodos,
    });

    renderApp();

    await waitFor(() => {
      expect(screen.getByText('Original title')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const editButton = screen.getAllByRole('button', { name: /edit/i })[0];
    await user.click(editButton);

    // Should show an input field
    const input = screen.getByDisplayValue('Original title');
    expect(input).toBeInTheDocument();

    // Click cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Should hide the input and show the original title again
    await waitFor(() => {
      expect(screen.queryByDisplayValue('Original title')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Original title')).toBeInTheDocument();
  });
});
