// Mock localStorage for Node environment
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

const { Expense, ExpenseTracker } = require("./script");

describe("Expense", () => {
  test("creates an expense with the correct properties", () => {
    const expense = new Expense("Coffee", 4.5, "Food", 1, "6/12/2026");

    expect(expense).toMatchObject({
      id: 1,
      description: "Coffee",
      amount: 4.5,
      category: "Food",
      date: "6/12/2026",
    });
  });

  test("converts amount to a number even if passed as a string", () => {
    const expense = new Expense("Snack", "2.50", "Food", 2);
    expect(expense.amount).toBe(2.5);
    expect(typeof expense.amount).toBe("number");
  });

  test("auto-generates an id and date when not provided", () => {
    const expense = new Expense("Taxi", 10, "Transportation");
    expect(expense.id).toBeDefined();
    expect(expense.date).toBeDefined();
  });
});

describe("ExpenseTracker - adding expenses", () => {
  test("starts with an empty list by default", () => {
    const tracker = new ExpenseTracker();
    expect(tracker.getAllExpenses()).toEqual([]);
  });

  test("adds a single expense", () => {
    const tracker = new ExpenseTracker();
    const expense = new Expense("Groceries", 50, "Food", 1);

    const result = tracker.addExpense(expense);

    expect(result).toHaveLength(1);
    expect(tracker.getAllExpenses()[0]).toMatchObject({
      description: "Groceries",
      amount: 50,
      category: "Food",
    });
  });

  test("adds multiple expenses at once using the rest operator", () => {
    const tracker = new ExpenseTracker();
    const e1 = new Expense("Lunch", 12, "Food", 1);
    const e2 = new Expense("Bus fare", 3, "Transportation", 2);
    const e3 = new Expense("Movie", 15, "Entertainment", 3);

    tracker.addExpenses(e1, e2, e3);

    expect(tracker.getAllExpenses()).toHaveLength(3);
  });

  test("does not mutate the original expenses array reference", () => {
    const initial = [new Expense("Initial", 5, "Other", 1)];
    const tracker = new ExpenseTracker(initial);

    tracker.addExpense(new Expense("New", 10, "Food", 2));

    expect(initial).toHaveLength(1);
    expect(tracker.getAllExpenses()).toHaveLength(2);
  });
});

describe("ExpenseTracker - removing expenses", () => {
  test("removes an expense by id", () => {
    const tracker = new ExpenseTracker([
      new Expense("Groceries", 50, "Food", 1),
      new Expense("Gas", 30, "Transportation", 2),
    ]);

    tracker.removeExpense(1);

    const remaining = tracker.getAllExpenses();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(2);
  });

  test("does nothing if the id does not exist", () => {
    const tracker = new ExpenseTracker([new Expense("Groceries", 50, "Food", 1)]);

    tracker.removeExpense(999);

    expect(tracker.getAllExpenses()).toHaveLength(1);
  });
});

describe("ExpenseTracker - calculating totals", () => {
  test("returns 0 for an empty list", () => {
    const tracker = new ExpenseTracker();
    expect(tracker.getTotal()).toBe(0);
  });

  test("calculates the total of all expenses", () => {
    const tracker = new ExpenseTracker([
      new Expense("Groceries", 50, "Food", 1),
      new Expense("Gas", 30, "Transportation", 2),
      new Expense("Movie", 20, "Entertainment", 3),
    ]);

    expect(tracker.getTotal()).toBe(100);
  });

  test("calculates the total for a specific category", () => {
    const tracker = new ExpenseTracker([
      new Expense("Groceries", 50, "Food", 1),
      new Expense("Snacks", 10, "Food", 2),
      new Expense("Gas", 30, "Transportation", 3),
    ]);

    expect(tracker.getTotal("Food")).toBe(60);
    expect(tracker.getTotal("Transportation")).toBe(30);
  });
});

describe("ExpenseTracker - filtering by category", () => {
  let tracker;

  beforeEach(() => {
    tracker = new ExpenseTracker([
      new Expense("Groceries", 50, "Food", 1),
      new Expense("Snacks", 10, "Food", 2),
      new Expense("Gas", 30, "Transportation", 3),
      new Expense("Movie", 20, "Entertainment", 4),
    ]);
  });

  test("returns all expenses when category is 'all' or empty", () => {
    expect(tracker.filterByCategory("all")).toHaveLength(4);
    expect(tracker.filterByCategory()).toHaveLength(4);
  });

  test("returns only expenses matching the given category", () => {
    const foodExpenses = tracker.filterByCategory("Food");
    expect(foodExpenses).toHaveLength(2);
    expect(foodExpenses.every(({ category }) => category === "Food")).toBe(true);
  });

  test("returns an empty array when no expenses match the category", () => {
    expect(tracker.filterByCategory("Health")).toEqual([]);
  });

  test("returns a list of unique categories", () => {
    expect(tracker.getCategories().sort()).toEqual(
      ["Entertainment", "Food", "Transportation"].sort()
    );
  });
});

describe("ExpenseTracker - localStorage persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("saves expenses to localStorage", () => {
    const tracker = new ExpenseTracker([new Expense("Groceries", 50, "Food", 1)]);
    tracker.saveToStorage();

    const stored = JSON.parse(localStorage.getItem("expenses"));
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({ description: "Groceries", amount: 50, category: "Food" });
  });

  test("loads expenses from localStorage", () => {
    const seedExpenses = [new Expense("Gas", 30, "Transportation", 1)];
    localStorage.setItem("expenses", JSON.stringify(seedExpenses));

    const tracker = new ExpenseTracker();
    const loaded = tracker.loadFromStorage();

    expect(loaded).toHaveLength(1);
    expect(loaded[0]).toMatchObject({ description: "Gas", amount: 30, category: "Transportation" });
  });

  test("loads an empty array when localStorage has no data", () => {
    const tracker = new ExpenseTracker();
    const loaded = tracker.loadFromStorage();
    expect(loaded).toEqual([]);
  });
});