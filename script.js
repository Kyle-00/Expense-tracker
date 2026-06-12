/* =========================================================
   Expense Tracker - Core Logic
   Uses OOP, destructuring, spread/rest operators,
   and functional array methods (map, filter, reduce).
   ========================================================= */

const STORAGE_KEY = "expenses";

/**
 * Represents a single expense entry.
 */
class Expense {
  constructor(description, amount, category, id, date) {
    this.id = id ?? Date.now() + Math.floor(Math.random() * 1000);
    this.description = description;
    this.amount = Number(amount);
    this.category = category;
    this.date = date ?? new Date().toLocaleDateString();
  }
}

/**
 * Manages a collection of Expense objects:
 * adding, removing, filtering, totaling, and persistence.
 */
class ExpenseTracker {
  constructor(expenses = []) {
    // spread operator used to create a fresh copy of the array
    this.expenses = [...expenses];
  }

  /**
   * Add a single expense to the tracker.
   * @param {Expense} expense
   * @returns {Expense[]} updated list of expenses
   */
  addExpense(expense) {
    this.expenses = [...this.expenses, expense];
    return this.expenses;
  }

  /**
   * Add multiple expenses at once using the rest operator.
   * @param  {...Expense} newExpenses
   * @returns {Expense[]} updated list of expenses
   */
  addExpenses(...newExpenses) {
    this.expenses = [...this.expenses, ...newExpenses];
    return this.expenses;
  }

  /**
   * Remove an expense by its id.
   * @param {number|string} id
   * @returns {Expense[]} updated list of expenses
   */
  removeExpense(id) {
    this.expenses = this.expenses.filter((expense) => expense.id !== id);
    return this.expenses;
  }

  /**
   * Returns a copy of all expenses.
   * @returns {Expense[]}
   */
  getAllExpenses() {
    return [...this.expenses];
  }

  /**
   * Calculate the total of all (or filtered) expenses using reduce.
   * @param {string} [category] optional category filter ("all" or empty = no filter)
   * @returns {number}
   */
  getTotal(category) {
    const list = this.filterByCategory(category);
    return list.reduce((total, { amount }) => total + Number(amount), 0);
  }

  /**
   * Filter expenses by category using destructuring + filter.
   * @param {string} category
   * @returns {Expense[]}
   */
  filterByCategory(category) {
    if (!category || category === "all") {
      return [...this.expenses];
    }
    return this.expenses.filter(({ category: expenseCategory }) => expenseCategory === category);
  }

  /**
   * Get a unique list of categories currently in use.
   * @returns {string[]}
   */
  getCategories() {
    return [...new Set(this.expenses.map(({ category }) => category))];
  }

  /**
   * Persist the current expenses to localStorage.
   */
  saveToStorage() {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.expenses));
    }
  }

  /**
   * Load expenses from localStorage (if available).
   * @returns {Expense[]}
   */
  loadFromStorage() {
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      this.expenses = stored ? JSON.parse(stored) : [];
    }
    return this.expenses;
  }
}

/* ======= DOM / UI Logic ======== */
if (typeof document !== "undefined" && document.getElementById("expense-form")) {
  const tracker = new ExpenseTracker();

  const form = document.getElementById("expense-form");
  const descriptionInput = document.getElementById("description");
  const amountInput = document.getElementById("amount");
  const categoryInput = document.getElementById("category");
  const filterSelect = document.getElementById("filter-category");
  const expenseListEl = document.getElementById("expense-list");
  const totalAmountEl = document.getElementById("total-amount");
  const emptyMessageEl = document.getElementById("empty-message");

  /**
   * Format a number as USD currency.
   * @param {number} value
   * @returns {string}
   */
  const formatCurrency = (value) =>
    `$${Number(value).toFixed(2)}`;

  /**
   * Render the expense list and total based on the current filter.
   */
  const render = () => {
    const selectedCategory = filterSelect.value;
    const expensesToShow = tracker.filterByCategory(selectedCategory);

    // Clear current list
    expenseListEl.innerHTML = "";

    // Use map to build list item markup, then join
    expensesToShow
      .map(({ id, description, amount, category, date }) => {
        const li = document.createElement("li");
        li.className = "expense-item";
        li.dataset.id = id;

        li.innerHTML = `
          <div class="expense-item__details">
            <span class="expense-item__description">${description}</span>
            <span class="expense-item__meta">
              <span class="expense-item__category">${category}</span>${date}
            </span>
          </div>
          <div class="expense-item__right">
            <span class="expense-item__amount">${formatCurrency(amount)}</span>
            <button class="btn btn--danger" data-action="delete" data-id="${id}">
              Delete
            </button>
          </div>
        `;
        return li;
      })
      .forEach((li) => expenseListEl.appendChild(li));

    // Show/hide empty message
    emptyMessageEl.style.display = expensesToShow.length === 0 ? "block" : "none";

    // Update total (respects current filter)
    totalAmountEl.textContent = formatCurrency(tracker.getTotal(selectedCategory));
  };

  /**
   * Handle form submission to add a new expense.
   */
  const handleAddExpense = (event) => {
    event.preventDefault();

    // Destructure values straight from the inputs
    const { value: description } = descriptionInput;
    const { value: amount } = amountInput;
    const { value: category } = categoryInput;

    if (!description.trim() || !amount || !category) {
      return;
    }

    const newExpense = new Expense(description.trim(), amount, category);
    tracker.addExpense(newExpense);
    tracker.saveToStorage();

    form.reset();
    render();
  };

  /**
   * Handle delete button clicks via event delegation.
   */
  const handleListClick = (event) => {
    const { target } = event;
    if (target.matches('[data-action="delete"]')) {
      const { id } = target.dataset;
      // ids were stored as numbers, dataset gives strings -> compare loosely-safe
      tracker.removeExpense(Number(id));
      tracker.saveToStorage();
      render();
    }
  };

  /**
   * Handle category filter changes.
   */
  const handleFilterChange = () => {
    render();
  };

  // Load any saved expenses on page load
  tracker.loadFromStorage();

  // Wire up event listeners
  form.addEventListener("submit", handleAddExpense);
  expenseListEl.addEventListener("click", handleListClick);
  filterSelect.addEventListener("change", handleFilterChange);

  // Initial render
  render();
}

/* =========================================================
   Export for testing (Node / Jest environment)
   ========================================================= */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { Expense, ExpenseTracker };
}