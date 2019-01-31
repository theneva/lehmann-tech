# A note on abstractions

**Published 2019-01-05**

In [the post on multiple list filters with counts][multiple-filters], I wrote some repetitive and explicit code that could easily be replaced by an abstraction. Read that post first for some context for the example, then come back here.

There are more clever (and less repetitive) ways to construct this particular filtering. As programmers, we constantly look for ways to simplify and abstract, and stay DRY. Go ahead! Just keep in mind that **abstractions rely on assumptions**, and **assumptions depend on your domain**.

In the domain of card transactions, these assumptions all hold true:

- The `all` configuration is always checked by comparing the filter configuration to the string `'all'`
- We always filter using `===` on a single property/field of the transaction object
- The has the same name as the property/field name on on the transaction object

That lets us write something like this abstraction, which would make it less of a hassle to add more filters in the future:

```ts
function filter(
  transactions: Transaction[],
  fieldName: keyof Transaction, // name that exists Transaction as string
  filterConfiguration: string,
) {
  if (filterConfiguration === 'all') {
    return transactions;
  }

  return transactions.filter(t => t[fieldName] === filterConfiguration);
}
```

That function can then be used like this:

```ts
let filtered = transactions;
filtered = filter(filtered, 'category', filters.category);
filtered = filter(filtered, 'receipt', filters.receipt);
filtered = filter(filtered, 'year', filters.year);
```

Or, if you want to get fancy and avoid explicitly handling each filter altogether, iterate through the filters this:

```ts
const filtered = Object.entries(filters).reduce(
  (ts, [filterName, filterConfiguration]) =>
    filter(ts, filterName, filterConfiguration),
  [...transactions],
);
```

## When the domain changes, your assumptions break down

However, these abstractions break down quickly when you need to do custom filtering.

For example, the `receipt` field might be a list of receipts associated with the transaction, and the filtering must be expressed as something like:

```ts
transactions.filter(t => {
    const shouldHaveReceipt = filters.receipt === 'present';
    const receiptCount = t.receipts.length;

    if (filters.receipt === 'present') {
        return receiptCount > 0;
    } else {
        return receiptCount === 0;
    }
};
```

As another example, we might want to change the `year` filter into a range, so that the configuration looks something like:

```ts
{
    category: 'all',
    receipt: 'all',
    year: { start: '2017', end: '2018' },
}
```

This obviously requires custom filtering, as the `year` filter configuration and the `year` property on the transaction are no longer the same type.

For these reasons, these examples are written to be explicit, not terse.

[multiple-filters]: https://lehmann.tech/multiple-filters.md
