# Expense Tracker

A simple, client-side Expense Tracker built with **HTML**, **CSS**, and **vanilla JavaScript**. It demonstrates object-oriented programming, functional array methods, destructuring, the spread/rest operators, localStorage persistence, and unit testing with Jest.

## Features

- Add a new expense with a description, amount, and category
- View all recorded expenses in a structured list
- Remove any expense from the list
- Automatically calculate and display the total expenses
- Filter expenses by category (the total updates to match the filter)
- Expenses persist across page reloads using `localStorage`

## Project Structure

```
expense-tracker/
├── index.html        # UI markup
├── styles.css        # Styling
├── script.js         # Expense & ExpenseTracker classes + DOM logic
├── script.test.js    # Jest unit tests
├── package.json      # Project metadata & test scripts
└── README.md         # This file
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/expense-tracker.git
cd expense-tracker
```

### 2. Open the app

No build step is required — it's a static site. Simply open `index.html` in your browser.

### 3. Install dependencies (for testing)

```bash
npm install
```

## Running the Tests

Unit tests are written with [Jest](https://jestjs.io/) and cover:

- Adding expenses (single and multiple via the rest operator)
- Removing expenses
- Calculating totals (overall and per category)
- Filtering expenses by category
- Saving and loading expenses from `localStorage`

Run the test suite:

```bash
npm test
```

Run tests in watch mode while developing:

```bash
npm run test:watch
```

## How It Works

### Expense class

Represents a single expense with a `description`, `amount`, `category`, `id`, and `date`.

### ExpenseTracker class

Manages the collection of expenses:

- `addExpense(expense)` – adds one expense (uses the spread operator)
- `addExpenses(...expenses)` – adds several expenses at once (rest operator)
- `removeExpense(id)` – removes an expense by id (`filter`)
- `getTotal(category?)` – sums expense amounts (`reduce`), optionally filtered by category
- `filterByCategory(category)` – returns expenses matching a category (`filter` + destructuring)
- `getCategories()` – returns the unique categories currently in use (`map` + `Set`)
- `saveToStorage()` / `loadFromStorage()` – persist and restore data via `localStorage`

### UI

`script.js` wires the form, expense list, filter dropdown, and total display to the `ExpenseTracker` instance. Expenses are re-rendered any time the list changes, and the current state is saved to `localStorage` after every add/remove.

## Deployment (GitHub Pages)

1. Push this project to a GitHub repository.
2. In the repository, go to **Settings → Pages**.
3. Under **Source**, select the branch (e.g. `main`) and the root folder (`/`).
4. Save — GitHub will provide a URL such as `https://<your-username>.github.io/expense-tracker/`.
5. Visit the URL to use your deployed Expense Tracker.

## License

This project is open source and available under the MIT License
