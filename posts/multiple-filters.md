# Use multiple filters with counts

**Published 2019-01-05**

Demo first: This app displays a list of transactions, and lets the user filter the list by different properties. Each filter configuration shows how many transactions will be visible if that configuration is selected, given all the other filters' values.

<img alt="Demo of numbers updating as new filters are selected" src="https://raw.githubusercontent.com/theneva/multiple-filters-usage/master/filters-demo.gif" width="400px">

Here's how to build that.

## Tech & links

The principles presented here are not specific to any given programming language. However, the demo must be written in a language, and the syntax is obviously specific to that one language.

The demo code is written using TypeScript, and tested using Jest. The web app is written with React on top of [create-react-app][create-react-app].

The code snippets shown here do not include type definitions, as they can get pretty verbose. They can be found together with the rest of the code discussed in this post at [theneva/multiple-filters-with-counts].

## Setup

You have a list of something to display somewhere, such as the transactions in this example:

```ts
type Category = 'internet' | 'transport' | 'food';
type Receipt = 'present' | 'missing';
type Year = string; // We can't really be more strict than this…

type Transaction = {
  text: string;
  category: Category;
  receipt: Receipt;
  year: Year;
};

const transactions: Transaction[] = [
  { text: 'Apple', category: 'internet', receipt: 'present', year: '2017' },
  { text: 'Taxi', category: 'transport', receipt: 'present', year: '2017' },
  { text: 'Coop', category: 'food', receipt: 'missing', year: '2018' },
  { text: 'Tesco', category: 'food', receipt: 'present', year: '2019' },
  { text: 'Tube', category: 'transport', receipt: 'present', year: '2019' },
];
```

To let the user quickly find what they're looking for, you allow filtering the transactions by any combination of three different properties:

1. Their category
2. Whether they have a receipt attached
3. Which year they were recorded

### Allow filtering by property

Easy enough: just set up a configuration for each filter:

```ts
type Filters = {
  category: CategoryFilter;
  receipt: ReceiptFilter;
  year: YearFilter;
};

const filters: Filters = {
  category: 'food',
  year: '2019',
  receipt: 'present',
};
```

Then apply the filters to the list, and display the filtered transactions in your UI:

```ts
const filtered = transactions
  .filter(t => t.category === filters.category)
  .filter(t => t.receipt === filters.receipt)
  .filter(t => t.year === filters.year);
```

### Allow skipping a filter

We just introduced a new problem: now you can't _not_ filter by a given property. Let's recognise a special value called `all` that allows everything through, and only apply the filters if they are not configured to `all`:

```ts
type CategoryFilterConfiguration = 'all' | Category;
type ReceiptFilterConfiguration = 'all' | Receipt;
type YearFilterConfiguration = 'all' | Year;

// Rewrite the Filters type
type Filters = {
  category: CategoryFilterConfiguration;
  receipt: ReceiptFilterConfiguration;
  year: YearFilterConfiguration;
};

const filters: Filters = {
  category: 'food',
  year: 'all',
  receipt: 'all',
};

// We'll reassign this to the remaining values after each filter
// that is not configured to 'all'.
let filtered = transactions;

// The category filter is configured to 'food', so this filter is applied.
if (filters.category !== 'all') {
  filtered = filtered.filter(t => t.category === filters.category);
}

// This filter is skipped because filters.receipt is 'all'.
if (filters.receipt !== 'all') {
  filtered = filtered.filter(t => t.receipt === filters.receipt);
}

// This filter is skipped because filters.year is 'all'.
if (filters.year !== 'all') {
  filtered = filtered.filter(t => t.year === filters.year);
}

// `filtered` now contains only transactions with category 'food'.
```

There are more clever (and less repetitive) ways to construct this particular filtering. My reasoning for the explicitness of this code can be found in [A note on abstractions][a-note-on-abstractions]. They boil down to the facts that **abstractions rely on assumptions** and **assumptions depend on your domain**.

## Counts

That wasn't too bad. Now let's add another simple feature: we want to show a number next to each filter configuration that indicates how many transactions will be displayed if that configuration is selected. Take a look at the demo at the top!

### What do the counts represent?

Each filter has multiple possible configurations:

| Filter     | Legal values                                 |
| ---------- | -------------------------------------------- |
| `category` | `all` \| `internet` \| `food` \| `transport` |
| `receipt`  | `all` \| `present` \| `missing`              |
| `year`     | `all` \| Any year, such as `2018`            |

Keep in mind that multiple filters can be selected at the same time.

Each configuration's `count` represents how many transactions will be visible after the respective configuration for that filter _and all other filters_ are applied, should the user select that particular configuration.

In other words, each filter must know:

1. How many transactions are left after all _other_ filters are applied
2. How those transactions are divided by the respective filter's configurations

### Count transactions when no filters are applied

When no filters are applied (i.e., every filter is configured to `all`), counting the available transaction is a simple matter: `all` refers to the total number of transactions, and we can simply count all the transactions grouped by each legal filter configuration.

The `category` and `receipt` filters have a predetermined set of legal configurations, so we can just count them. Using `receipt` as an example, and extracting it to a function for good measure:

```ts
type ReceiptCounts = { [key in ReceiptFilterConfiguration]: number };

function receiptCounts(transactions: Transaction[]) {
  const initialReceiptCounts: ReceiptCounts = {
    all: transactions.length,
    present: 0,
    missing: 0,
  };

  return transactions.reduce((counts, transaction) => {
    counts[transaction.receipt]++;
    return counts;
  });
}
```

`receiptCounts` returns an object with one key keys for each legal filter configuration, and values representing the number of transactions that match the configuration.

```ts
{
  all: 5,
  present: 4,
  missing: 1,
};
```

Repeat this process for the category filter, giving us the function `categoryCounts`. Again, we could introduce several abstractions to reduce code repetition, and again, we're not making any assumptions about the domain right now.

For the year filter, we have to determine which years to include in the grouping. We could do one of:

1. Predefine a set of years to include
2. Include the years that exist in the list

Since option (1) is liable to both include years that don't have any transaction, and lack years that have transactions (for example, on January 1st), let's go with option 2.

The only difference from the other filters is that we need to define the year if it doesn't already exist in the counts.

```ts
// TS doesn't allow union types, so we have to specify string as the key again
type YearCounts = { [key: string]: number };

function yearCounts(transactions: Transaction[]) {
  const initialYearCounts: YearCounts = {
    all: transactions.length,
  };

  return transactions.reduce((counts, transaction) => {
    if (counts[transaction.year] == null) {
      // We had no previous transactions from this year; now there's 1.
      counts[transaction.year] = 1;
    } else {
      // The year already exists; just increment the count.
      counts[transaction.year]++;
    }
  }, initialYearCounts);
}
```

This gives us the counts we need!

### Count transactions when another filter is applied

This is where it gets complicated.

The approach of counting the transactions grouped by legal configurations (or used configurations, in the `year` case) works when no filters are applied, because every filter would be the first to be applied.

When another filter is applied, however, there is no way for the filter we're looking at to include the transactions that are filtered away.

For example, say we apply a category filter to the transactions:

```ts
const filters = {
  category: 'food',
  receipt: 'all',
  year: 'all',
};
```

This leaves only the two food-related transactions in the filtered list that will be displayed to the user:

```ts
[
  { text: 'Coop', category: 'food', receipt: 'missing', year: '2018' },
  { text: 'Tesco', category: 'food', receipt: 'present', year: '2019' },
];
```

The only way to get the non-food items back into the list is to change the `category` filter—changing just the `receipt` and/or `year` filters cannot possibly bring them back. It follows that the counts for the `receipt` and `year` configurations should only consider the transactions that survived the `category` filter.

The correct counts given these filter configurations are:

| filter     | counts                                                                     |
| ---------- | -------------------------------------------------------------------------- |
| `category` | `{ all: 5, food: 2, transport: 2, internet: 1}` (where `food` is selected) |
| `receipt`  | `{ all: 2, present: 1, missing: 1 }`                                       |
| `year`     | `{ all: 2, '2018': 1, '2019': 1 }`                                         |

### Determine which transactions are available

The only way to determine which transactions are available to any given filter is to apply all the other filters and look at the transactions that remain.

First of all, we need a way to know which transactions are left after the filters are applied, instead of just counting them. We have to rewrite our counters to store transactions instead of numbers. Using the `receipt` filter as an example again:

```ts
// Update the type
type ReceiptCounts = {
  [key in ReceiptFilterConfiguration]: Array<Transaction>
};

function receiptCounts(transactions: Transaction[]) {
  const initialReceiptCounts: ReceiptCounts = {
    all: transactions,
    present: [],
    missing: [],
  };

  return transactions.reduce((counts, transaction) => {
    counts[transaction.receipt].push(transaction);
    return counts;
  });
}
```

`receiptCounts` still returns an object with keys representing the legal configurations, but the values are now arrays containing the transactions that will be left after the filter configuration is applied.

Modify the `category` and `year` groupings in the same way, and we can start determining which transactions are left after all filters are applied. As a slight bonus, we can use these groupings in place of the filters from before! We know both which filters are included in each configuration, and which filter configuration is selected, so the grouping is all we need.

Now, we need to find out which transactions are left after applying all other filters. We use our grouping functions from before (`receiptCounts`, `categoryCounts`, and `yearCounts`) in combination with the filter configurations.

We start by grouping all transactions by all but one of the filters:

```ts
const allByReceipt = receiptCounts(transactions);
const allByCategory = categoryCounts(transactions);
```

Assuming we still have this filter configuration:

```ts
const filters = {
  category: 'food',
  receipt: 'all',
  year: 'all',
};
```

… we then grab only the filtered transactions:

```ts
const filteredByReceipt = allByReceipt[filters.receipt];
const filteredByCategory = allByCategory[filters.category];
```

We can then apply the grouping to the remaining items of the initial filtering:

```ts
const filteredByReceiptGroupedByCategory = categoryCounts(filteredByReceipt);

const filteredByReceiptGroupedByYear = yearCounts(filteredByReceipt);
const filteredByCategoryGroupedByYear = yearCounts(filteredByCategory);
```

Finally, we apply the filters:

```ts
const filteredByReceiptAndCategory = filteredByReceiptGroupedByCategory[filters.category];
const filteredByReceiptAndYear = filteredByReceiptGroupedByYear[filters.year;]
const filteredByCategoryAndYear = filteredByCategoryGroupedByYear[filters.year];
```

We now have the resulting transactions from every combination of two different filters:

- `receipt` and `category`
- `receipt` and `year`
- `category` and `year`

We can use these filtered items as a basis for the grouping functions one last time, to determine which transactions are _actually_ available to each configuration of each filter:

```ts
const availableTransactionsByCategory = categoryCounts(
  filteredByReceiptAndYear,
);
const availableTransactionsByReceipt = receiptCounts(filteredByCategoryAndYear);
const availableTransactionsByYear = yearCounts(filteredByReceiptAndCategory);
```

We did it! Each filter configuration's transactions are determined from only the remaining transactions after all other filters have been applied.

As an example, `availableTransactionsByReceipt` is now:

```ts
{
  all: [
    { text: 'Coop', category: 'food', receipt: 'missing', year: '2018' },
    { text: 'Tesco', category: 'food', receipt: 'present', year: '2019' },
  ],
  present: [
    { text: 'Tesco', category: 'food', receipt: 'present', year: '2019' },
  ],
  missing: [
    { text: 'Coop', category: 'food', receipt: 'missing', year: '2018' },
  ],
}
```

### Abstracting the filter application

Applying every permutation of all filters except one gets tedious, and is prone to errors. Even though we refrained from writing abstractions previously, it prevents quite a bit of overhead in this case. Also, the domain should not be able to affect the assumptions we have to make to apply these filters (namely, that the grouping of transactions by filter configuration is an object with keys corresponding to the legal filter configurations, and values representing the transactions available through that configuration), so we should be safe.

We can introduce functions to apply each filter, and then another function to apply all filters except one:

```ts
type FilterName = keyof Filters;

type FilterFunctions = {
  [name in FilterName]: (
    transactions: Transaction[],
    configurations: Filters,
  ) => Transaction[]
};

const filterFunctions: FilterFunctions = {
  category(transactions: Transaction[], configurations: Filters) {
    return categoryCounts(transactions)[configurations.category];
  },

  receipt(transactions: Transaction[], configurations: Filters) {
    return receiptCounts(transactions)[configurations.receipt];
  },

  year(transactions: Transaction[], configurations: Filters) {
    return yearCounts(transactions)[filters.year];
  },
};

function applyFiltersExcept(
  except: FilterName,
  transactions: Transaction[],
  configurations: Filters,
) {
  // Stick all the filter functions in a new array and delete the exception
  const filterFunctionsWithoutException = {
    ...filterFunctions(configurations),
  };
  delete filterFunctionsWithoutException[except];

  // Get the other filters as an array
  const otherFilters = Object.values(filterFunctionsWithoutException);

  // Apply all other filters, resulting in only the remaining transactions
  return otherFilters.reduce((filtered, filter) => filter(filtered), [
    ...transactions,
  ]);
}
```

We can then use `applyFiltersExcept` like this:

```ts
const categories = groupByCategory(
  applyFiltersExcept('category', transactions, filters),
);
const receipts = groupByReceipt(
  applyFiltersExcept('receipt', transactions, filters),
);
const years = groupByYear(applyFiltersExcept('year', transactions, filters));
```

Note: We could use closures to our advantage to avoid passing in transactions and filters to every function call, although that might make the code less readable.

We finally have a set of objects that represent the available transactions per filter configuration after all other filters are applied. Adding a new filter is little work: we would only need to write functions for grouping and filtering.

### Performance note

This approach is a nasty <code>O(n<sup>2</sup>)</code> algorithm (for each filter, each filter except one is applied to all items), but it performs well on sane amounts of data: in the demo app, a few hundred items are updated instantly, and 5,000 items (which is way too many to display on a website) are counted, filtered, and re-rendered by React in less than a second on a MacBook Pro.

If this does turn out to be too slow, we could [memoize][memoization] the grouping function to cache its return values for any given set of parameters, and be careful with the order in which we apply the filters. Note that the order in which the filters are applied does not matter from a functional point of view, as the resulting filtered list will be the same regardless.

Memoization is also a useful technique to [avoid unnecessary rendering][react-memo] when writing function components with React.

## Parting notes

Thanks for reading! A seemingly trivial feature can sure prove to be much more complex than it looks.

If you have any questions, feel free to reach out at martin\[at\]lehmann\[dot\]tech or [@theneva][twitter].

[create-react-app]: https://github.com/facebook/create-react-app
[twitter]: https://twitter.com/theneva
[memoization]: https://en.wikipedia.org/wiki/Memoization
[react-memo]: https://reactjs.org/docs/react-api.html#reactmemo
[a-note-on-abstractions]: https://lehmann.tech/a-note-on-abstractions.md

<font color="red">TODO merge the repos and put them up in this repo</font> [theneva/multiple-filters-with-counts]: https://github.com/theneva/multiple-filters-with-counts

```

```
