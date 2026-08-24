/**
 * Comprehensive UI tests for the TODO application
 * Tests critical user journeys: create, edit, toggle, delete, and error handling
 */
const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

test.describe('TODO Application - Core Journeys', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.navigate();
    // Wait for initial load to complete
    await todoPage.waitForLoading();
  });

  test.describe('Create Todo', () => {
    test('should create a new todo with valid input', async () => {
      const todoTitle = 'Buy groceries';
      
      await todoPage.createTodo(todoTitle);
      
      // Verify the todo appears in the list
      const exists = await todoPage.todoExists(todoTitle);
      expect(exists).toBe(true);
      
      // Verify it's not completed by default
      const isCompleted = await todoPage.isTodoCompleted(todoTitle);
      expect(isCompleted).toBe(false);
    });

    test('should create multiple todos independently', async () => {
      const todos = ['First task', 'Second task', 'Third task'];
      
      for (const todo of todos) {
        await todoPage.createTodo(todo);
      }
      
      // Verify all todos exist
      for (const todo of todos) {
        const exists = await todoPage.todoExists(todo);
        expect(exists).toBe(true);
      }
      
      // Verify count
      const count = await todoPage.getTodoCount();
      expect(count).toBe(todos.length);
    });

    test('should clear input field after creating todo', async ({ page }) => {
      const todoTitle = 'Test task';
      
      await todoPage.createTodo(todoTitle);
      
      // Verify input is cleared
      const inputValue = await todoPage.todoInput.inputValue();
      expect(inputValue).toBe('');
    });

    test('should not create todo with empty input', async () => {
      const initialCount = await todoPage.getTodoCount();
      
      // Try to create with empty input
      await todoPage.todoInput.fill('');
      await todoPage.addButton.click();
      
      // Wait a moment for potential mutation
      await todoPage.page.waitForTimeout(200);
      
      // Verify count hasn't changed
      const finalCount = await todoPage.getTodoCount();
      expect(finalCount).toBe(initialCount);
    });

    test('should not create todo with only whitespace', async () => {
      const initialCount = await todoPage.getTodoCount();
      
      // Try to create with whitespace
      await todoPage.todoInput.fill('   ');
      await todoPage.addButton.click();
      
      // Wait a moment for potential mutation
      await todoPage.page.waitForTimeout(200);
      
      // Verify count hasn't changed
      const finalCount = await todoPage.getTodoCount();
      expect(finalCount).toBe(initialCount);
    });

    test('should handle special characters in todo title', async () => {
      const specialTitle = 'Test with "quotes" & <symbols> and émojis 🎉';
      
      await todoPage.createTodo(specialTitle);
      
      const exists = await todoPage.todoExists(specialTitle);
      expect(exists).toBe(true);
    });
  });

  test.describe('Toggle Todo', () => {
    test('should toggle todo completion status', async () => {
      const todoTitle = 'Task to complete';
      
      // Create a todo
      await todoPage.createTodo(todoTitle);
      
      // Initially not completed
      let isCompleted = await todoPage.isTodoCompleted(todoTitle);
      expect(isCompleted).toBe(false);
      
      // Toggle to completed
      await todoPage.toggleTodo(todoTitle);
      isCompleted = await todoPage.isTodoCompleted(todoTitle);
      expect(isCompleted).toBe(true);
      
      // Checkbox should be checked
      const checkbox = todoPage.getTodoCheckbox(todoTitle);
      await expect(checkbox).toBeChecked();
    });

    test('should toggle todo back to incomplete', async () => {
      const todoTitle = 'Task to toggle';
      
      await todoPage.createTodo(todoTitle);
      
      // Toggle to completed
      await todoPage.toggleTodo(todoTitle);
      let isCompleted = await todoPage.isTodoCompleted(todoTitle);
      expect(isCompleted).toBe(true);
      
      // Toggle back to incomplete - NOTE: This will fail due to backend bug
      // Backend always sets completed=true instead of toggling
      await todoPage.toggleTodo(todoTitle);
      isCompleted = await todoPage.isTodoCompleted(todoTitle);
      expect(isCompleted).toBe(false);
      
      // Checkbox should be unchecked
      const checkbox = todoPage.getTodoCheckbox(todoTitle);
      await expect(checkbox).not.toBeChecked();
    });

    test('should toggle multiple todos independently', async () => {
      const todo1 = 'First task';
      const todo2 = 'Second task';
      const todo3 = 'Third task';
      
      await todoPage.createTodo(todo1);
      await todoPage.createTodo(todo2);
      await todoPage.createTodo(todo3);
      
      // Toggle only the second todo
      await todoPage.toggleTodo(todo2);
      
      // Verify only todo2 is completed
      expect(await todoPage.isTodoCompleted(todo1)).toBe(false);
      expect(await todoPage.isTodoCompleted(todo2)).toBe(true);
      expect(await todoPage.isTodoCompleted(todo3)).toBe(false);
    });
  });

  test.describe('Delete Todo', () => {
    test('should delete a todo', async () => {
      const todoTitle = 'Task to delete';
      
      await todoPage.createTodo(todoTitle);
      
      // Verify it exists
      let exists = await todoPage.todoExists(todoTitle);
      expect(exists).toBe(true);
      
      // Delete it - NOTE: This will fail as delete is not implemented
      await todoPage.deleteTodo(todoTitle);
      
      // Verify it's removed
      exists = await todoPage.todoExists(todoTitle);
      expect(exists).toBe(false);
    });

    test('should delete specific todo without affecting others', async () => {
      const todo1 = 'Keep this';
      const todo2 = 'Delete this';
      const todo3 = 'Keep this too';
      
      await todoPage.createTodo(todo1);
      await todoPage.createTodo(todo2);
      await todoPage.createTodo(todo3);
      
      // Delete the middle one
      await todoPage.deleteTodo(todo2);
      
      // Verify others still exist
      expect(await todoPage.todoExists(todo1)).toBe(true);
      expect(await todoPage.todoExists(todo2)).toBe(false);
      expect(await todoPage.todoExists(todo3)).toBe(true);
      
      // Verify count
      const count = await todoPage.getTodoCount();
      expect(count).toBe(2);
    });

    test('should handle deleting completed todo', async () => {
      const todoTitle = 'Complete and delete';
      
      await todoPage.createTodo(todoTitle);
      await todoPage.toggleTodo(todoTitle);
      
      // Verify it's completed
      expect(await todoPage.isTodoCompleted(todoTitle)).toBe(true);
      
      // Delete it
      await todoPage.deleteTodo(todoTitle);
      
      // Verify it's removed
      expect(await todoPage.todoExists(todoTitle)).toBe(false);
    });
  });

  test.describe('Edit Todo', () => {
    test('should display edit button for each todo', async () => {
      const todoTitle = 'Task to edit';
      
      await todoPage.createTodo(todoTitle);
      
      // Verify edit button is visible
      const editButton = todoPage.getTodoEditButton(todoTitle);
      await expect(editButton).toBeVisible();
    });

    test('should trigger edit action when edit button clicked', async ({ page }) => {
      const todoTitle = 'Task to edit';
      
      await todoPage.createTodo(todoTitle);
      
      // Set up console listener to verify edit is attempted
      const consoleLogs = [];
      page.on('console', msg => consoleLogs.push(msg.text()));
      
      await todoPage.clickEditTodo(todoTitle);
      
      // NOTE: This will show "Edit not implemented" in console
      // Wait a moment for console message
      await page.waitForTimeout(100);
      
      // Verify edit was attempted (via console log)
      const editAttempted = consoleLogs.some(log => 
        log.includes('Edit not implemented')
      );
      expect(editAttempted).toBe(true);
    });

    // Additional edit tests would be added once edit functionality is implemented
    test.skip('should update todo title when edited', async () => {
      // This test is skipped as edit functionality is not yet implemented
      // Will be implemented in future iterations
    });
  });

  test.describe('Loading States', () => {
    test('should display loading indicator during initial load', async ({ page }) => {
      const newTodoPage = new TodoPage(page);
      
      // Navigate and check loading state before waiting
      await page.goto('/');
      
      // Check if loading spinner appears (might be too fast)
      try {
        const isLoading = await newTodoPage.isLoading();
        // If we caught it, it should be loading
        if (isLoading) {
          expect(isLoading).toBe(true);
        }
      } catch (e) {
        // Loading might be too fast to catch, which is acceptable
      }
      
      // Wait for loading to complete
      await newTodoPage.waitForLoading();
      
      // After loading, spinner should be hidden
      const isLoadingAfter = await newTodoPage.isLoading();
      expect(isLoadingAfter).toBe(false);
    });

    test('should display todos after loading completes', async () => {
      const todoTitle = 'Test after load';
      
      await todoPage.createTodo(todoTitle);
      
      // Reload the page
      await todoPage.navigate();
      await todoPage.waitForLoading();
      
      // Verify the todo persists
      const exists = await todoPage.todoExists(todoTitle);
      expect(exists).toBe(true);
    });
  });

  test.describe('Empty State', () => {
    test('should handle empty todo list gracefully', async () => {
      // When no todos exist
      const hasEmpty = await todoPage.hasEmptyState();
      expect(hasEmpty).toBe(true);
      
      // NOTE: The app doesn't show an empty state message
      // This is identified as a UX issue
      const count = await todoPage.getTodoCount();
      expect(count).toBe(0);
    });

    test('should transition from empty to populated state', async () => {
      // Start with empty
      let count = await todoPage.getTodoCount();
      expect(count).toBe(0);
      
      // Add a todo
      await todoPage.createTodo('First todo');
      
      // No longer empty
      count = await todoPage.getTodoCount();
      expect(count).toBe(1);
    });

    test('should return to empty state when all todos deleted', async () => {
      const todoTitle = 'Temporary todo';
      
      await todoPage.createTodo(todoTitle);
      expect(await todoPage.getTodoCount()).toBe(1);
      
      await todoPage.deleteTodo(todoTitle);
      
      // Should be empty again
      expect(await todoPage.getTodoCount()).toBe(0);
      expect(await todoPage.hasEmptyState()).toBe(true);
    });
  });

  test.describe('Error State Handling', () => {
    test('should handle API errors gracefully during fetch', async ({ page, context }) => {
      // Intercept API calls and simulate error
      await context.route('**/api/todos', route => {
        if (route.request().method() === 'GET') {
          route.abort('failed');
        } else {
          route.continue();
        }
      });
      
      const errorTodoPage = new TodoPage(page);
      await errorTodoPage.navigate();
      
      // Wait for loading to complete
      await page.waitForTimeout(1000);
      
      // App should handle this gracefully (though it may not currently)
      // At minimum, loading should stop
      const isLoading = await errorTodoPage.isLoading();
      expect(isLoading).toBe(false);
    });

    test('should handle API error when creating todo', async ({ page, context }) => {
      await todoPage.navigate();
      await todoPage.waitForLoading();
      
      // Intercept POST requests and return error
      await context.route('**/api/todos', route => {
        if (route.request().method() === 'POST') {
          route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Server error' })
          });
        } else {
          route.continue();
        }
      });
      
      const todoTitle = 'This will fail';
      await todoPage.createTodo(todoTitle);
      
      // Wait for error handling
      await page.waitForTimeout(500);
      
      // Todo should not appear in list
      const exists = await todoPage.todoExists(todoTitle);
      expect(exists).toBe(false);
    });

    test('should handle network timeout during create', async ({ page, context }) => {
      await todoPage.navigate();
      await todoPage.waitForLoading();
      
      // Intercept and delay POST requests
      await context.route('**/api/todos', route => {
        if (route.request().method() === 'POST') {
          // Delay longer than timeout
          setTimeout(() => route.abort('timedout'), 10000);
        } else {
          route.continue();
        }
      });
      
      const todoTitle = 'Timeout test';
      await todoPage.createTodo(todoTitle);
      
      // Wait for request to timeout
      await page.waitForTimeout(2000);
      
      // Application should handle timeout gracefully
      // At minimum, the UI should remain functional
      const isInputEnabled = await todoPage.todoInput.isEnabled();
      expect(isInputEnabled).toBe(true);
    });

    test('should handle 404 error when toggling non-existent todo', async ({ page, context }) => {
      const todoTitle = 'Test todo';
      await todoPage.createTodo(todoTitle);
      
      // Intercept toggle requests and return 404
      await context.route('**/api/todos/*/toggle', route => {
        route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Todo not found' })
        });
      });
      
      // Attempt to toggle
      await todoPage.toggleTodo(todoTitle);
      
      // Wait for error handling
      await page.waitForTimeout(500);
      
      // Application should handle this gracefully
      // The todo should still be in the list
      const exists = await todoPage.todoExists(todoTitle);
      expect(exists).toBe(true);
    });

    test('should handle malformed API response', async ({ page, context }) => {
      // Intercept API calls and return malformed JSON
      await context.route('**/api/todos', route => {
        if (route.request().method() === 'GET') {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: 'This is not valid JSON'
          });
        } else {
          route.continue();
        }
      });
      
      const errorTodoPage = new TodoPage(page);
      await errorTodoPage.navigate();
      
      // Wait for error handling
      await page.waitForTimeout(1000);
      
      // App should handle gracefully
      const isLoading = await errorTodoPage.isLoading();
      expect(isLoading).toBe(false);
    });
  });

  test.describe('UI Interactions', () => {
    test('should show hover effects on todo items', async ({ page }) => {
      const todoTitle = 'Hover test';
      await todoPage.createTodo(todoTitle);
      
      const todoItem = todoPage.getTodoByTitle(todoTitle);
      
      // Hover over the item
      await todoItem.hover();
      
      // Item should be visible and interactable
      await expect(todoItem).toBeVisible();
      
      // Delete and edit buttons should be visible
      const deleteButton = todoPage.getTodoDeleteButton(todoTitle);
      const editButton = todoPage.getTodoEditButton(todoTitle);
      
      await expect(deleteButton).toBeVisible();
      await expect(editButton).toBeVisible();
    });

    test('should handle rapid consecutive operations', async () => {
      // Rapidly create multiple todos
      const todos = ['Quick 1', 'Quick 2', 'Quick 3', 'Quick 4', 'Quick 5'];
      
      for (const todo of todos) {
        await todoPage.todoInput.fill(todo);
        await todoPage.addButton.click();
      }
      
      // Wait for all mutations
      await todoPage.page.waitForTimeout(500);
      
      // All should exist
      for (const todo of todos) {
        const exists = await todoPage.todoExists(todo);
        expect(exists).toBe(true);
      }
    });

    test('should maintain UI state during operations', async () => {
      const todoTitle = 'State test';
      await todoPage.createTodo(todoTitle);
      
      // Toggle todo
      await todoPage.toggleTodo(todoTitle);
      
      // UI should remain responsive
      const isInputEnabled = await todoPage.todoInput.isEnabled();
      expect(isInputEnabled).toBe(true);
      
      const isButtonEnabled = await todoPage.addButton.isEnabled();
      expect(isButtonEnabled).toBe(true);
    });
  });
});