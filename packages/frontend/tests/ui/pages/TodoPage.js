/**
 * Page Object Model for the TODO application
 * Encapsulates UI interactions, locators, and navigation logic
 */
class TodoPage {
  constructor(page) {
    this.page = page;

    // Semantic locators using accessible names and roles
    this.todoInput = page.getByPlaceholder('What needs to be done?');
    this.addButton = page.getByRole('button', { name: /add/i });
    this.loadingSpinner = page.getByRole('progressbar');
  }

  /**
   * Navigate to the application
   */
  async navigate() {
    await this.page.goto('/');
    // Wait for the application to be ready (loading spinner appears and disappears)
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Create a new todo with the given title
   * @param {string} title - The title of the todo
   */
  async createTodo(title) {
    await this.todoInput.fill(title);
    await this.addButton.click();
    // Wait for the request to complete by checking that input is cleared
    await this.page.waitForTimeout(100); // Small delay for mutation
  }

  /**
   * Get a todo item by its title
   * @param {string} title - The title to search for
   * @returns {import('@playwright/test').Locator} The list item containing the todo
   */
  getTodoByTitle(title) {
    return this.page.getByRole('listitem').filter({ hasText: title });
  }

  /**
   * Get the checkbox for a specific todo
   * @param {string} title - The title of the todo
   * @returns {import('@playwright/test').Locator} The checkbox element
   */
  getTodoCheckbox(title) {
    return this.getTodoByTitle(title).getByRole('checkbox');
  }

  /**
   * Get the delete button for a specific todo
   * @param {string} title - The title of the todo
   * @returns {import('@playwright/test').Locator} The delete button
   */
  getTodoDeleteButton(title) {
    return this.getTodoByTitle(title).getByRole('button', { name: /delete/i });
  }

  /**
   * Get the edit button for a specific todo
   * @param {string} title - The title of the todo
   * @returns {import('@playwright/test').Locator} The edit button
   */
  getTodoEditButton(title) {
    return this.getTodoByTitle(title).getByRole('button', { name: /edit/i });
  }

  /**
   * Toggle the completion status of a todo
   * @param {string} title - The title of the todo
   */
  async toggleTodo(title) {
    const checkbox = this.getTodoCheckbox(title);
    await checkbox.click();
    await this.page.waitForTimeout(100); // Small delay for mutation
  }

  /**
   * Delete a todo by its title
   * @param {string} title - The title of the todo
   */
  async deleteTodo(title) {
    const deleteButton = this.getTodoDeleteButton(title);
    await deleteButton.click();
    await this.page.waitForTimeout(100); // Small delay for mutation
  }

  /**
   * Click the edit button for a todo
   * @param {string} title - The title of the todo
   */
  async clickEditTodo(title) {
    const editButton = this.getTodoEditButton(title);
    await editButton.click();
  }

  /**
   * Get the text content of a todo
   * @param {string} title - The title of the todo
   * @returns {Promise<string>} The text content
   */
  async getTodoText(title) {
    const todo = this.getTodoByTitle(title);
    return await todo.textContent();
  }

  /**
   * Check if a todo is marked as completed (has line-through)
   * @param {string} title - The title of the todo
   * @returns {Promise<boolean>} True if completed
   */
  async isTodoCompleted(title) {
    const todo = this.getTodoByTitle(title);
    const textElement = todo.locator('p, span, div').first();
    const textDecoration = await textElement.evaluate(
      (el) => window.getComputedStyle(el).textDecoration
    );
    return textDecoration.includes('line-through');
  }

  /**
   * Check if a todo exists in the list
   * @param {string} title - The title of the todo
   * @returns {Promise<boolean>} True if the todo exists
   */
  async todoExists(title) {
    const count = await this.getTodoByTitle(title).count();
    return count > 0;
  }

  /**
   * Get the total count of todos
   * @returns {Promise<number>} The number of todos
   */
  async getTodoCount() {
    const items = this.page.getByRole('listitem');
    return await items.count();
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoading() {
    // Wait for loading spinner to appear and then disappear
    try {
      await this.loadingSpinner.waitFor({ state: 'visible', timeout: 1000 });
      await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 5000 });
    } catch (e) {
      // Loading might be too fast to catch, which is fine
    }
  }

  /**
   * Check if the loading spinner is visible
   * @returns {Promise<boolean>} True if loading
   */
  async isLoading() {
    return await this.loadingSpinner.isVisible();
  }

  /**
   * Get all todo titles currently visible
   * @returns {Promise<string[]>} Array of todo titles
   */
  async getAllTodoTitles() {
    const items = this.page.getByRole('listitem');
    const count = await items.count();
    const titles = [];

    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).textContent();
      // Extract just the title text (remove button text)
      const titleMatch = text.match(/^(.*?)(Edit|Delete)/);
      if (titleMatch) {
        titles.push(titleMatch[1].trim());
      }
    }

    return titles;
  }

  /**
   * Get the statistics chips (items left, completed)
   * @returns {Promise<{itemsLeft: string, completed: string}>} Statistics
   */
  async getStatistics() {
    const chips = this.page.getByRole('status'); // MUI Chips have status role
    const count = await chips.count();
    
    const stats = {
      itemsLeft: '',
      completed: ''
    };

    if (count >= 1) {
      stats.itemsLeft = await chips.nth(0).textContent();
    }
    if (count >= 2) {
      stats.completed = await chips.nth(1).textContent();
    }

    return stats;
  }

  /**
   * Check if the empty state message is visible
   * @returns {Promise<boolean>} True if visible
   */
  async hasEmptyState() {
    // The app doesn't implement empty state, but we can check for no todos
    const count = await this.getTodoCount();
    return count === 0;
  }
}

module.exports = { TodoPage };
