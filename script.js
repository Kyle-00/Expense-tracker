/* =========================================================
   Expense Tracker - Core Logic (Kenyan Shillings)
   Uses OOP, destructuring, spread/rest operators,
   and functional array methods.
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
 * Manages a collection of Expense objects.
 */
class ExpenseTracker {
  constructor(expenses = []) {
    this.expenses = [...expenses];
  }

  addExpense(expense) {
    this.expenses = [...this.expenses, expense];
    return this.expenses;
  }

  addExpenses(...newExpenses) {
    this.expenses = [...this.expenses, ...newExpenses];
    return this.expenses;
  }

  removeExpense(id) {
    this.expenses = this.expenses.filter((expense) => expense.id !== id);
    return this.expenses;
  }

  getAllExpenses() {
    return [...this.expenses];
  }

  getTotal(category) {
    const list = this.filterByCategory(category);
    return list.reduce((total, { amount }) => total + Number(amount), 0);
  }

  filterByCategory(category) {
    if (!category || category === "all") {
      return [...this.expenses];
    }
    return this.expenses.filter(({ category: expenseCategory }) => expenseCategory === category);
  }

  getCategories() {
    return [...new Set(this.expenses.map(({ category }) => category))];
  }

  saveToStorage() {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.expenses));
    }
  }

  loadFromStorage() {
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      this.expenses = stored ? JSON.parse(stored) : [];
    }
    return this.expenses;
  }
}

/* =========================================================
   DOM / UI Logic (Kenyan Shillings - KSh)
   ========================================================= */
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
   * Format as Kenyan Shillings (KSh)
   */
  const formatCurrency = (value) => {
    return `KSh ${Number(value).toFixed(2)}`;
  };

  /**
   * Simple escape to prevent XSS
   */
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }

  const render = () => {
    const selectedCategory = filterSelect.value;
    const expensesToShow = tracker.filterByCategory(selectedCategory);

    expenseListEl.innerHTML = "";

    expensesToShow.forEach(({ id, description, amount, category, date }) => {
      const li = document.createElement("li");
      li.className = "expense-item";
      li.dataset.id = id;

      li.innerHTML = `
        <div class="expense-item__details">
          <span class="expense-item__description">${escapeHtml(description)}</span>
          <span class="expense-item__meta">
            <span class="expense-item__category">${escapeHtml(category)}</span>
            <span>${escapeHtml(date)}</span>
          </span>
        </div>
        <div class="expense-item__right">
          <span class="expense-item__amount">${formatCurrency(amount)}</span>
          <button class="btn btn--danger" data-action="delete" data-id="${id}">
            Delete
          </button>
        </div>
      `;
      expenseListEl.appendChild(li);
    });

    emptyMessageEl.style.display = expensesToShow.length === 0 ? "block" : "none";
    totalAmountEl.textContent = formatCurrency(tracker.getTotal(selectedCategory));
  };

  const handleAddExpense = (event) => {
    event.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = amountInput.value;
    const category = categoryInput.value;

    if (!description || !amount || !category) return;

    const newExpense = new Expense(description, amount, category);
    tracker.addExpense(newExpense);
    tracker.saveToStorage();

    form.reset();
    render();
  };

  const handleListClick = (event) => {
    const deleteButton = event.target.closest('[data-action="delete"]');
    if (deleteButton) {
      const id = deleteButton.dataset.id;
      if (id) {
        tracker.removeExpense(Number(id));
        tracker.saveToStorage();
        render();
      }
    }
  };

  const handleFilterChange = () => render();

  tracker.loadFromStorage();

  form.addEventListener("submit", handleAddExpense);
  expenseListEl.addEventListener("click", handleListClick);
  filterSelect.addEventListener("change", handleFilterChange);

  render();
}

// Export for testing (Node environment)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { Expense, ExpenseTracker };
}