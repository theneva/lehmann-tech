# Get the date of the next Monday in JS

With plain JS:

```js
function nextMondayDateString() {
  // Get the current date for math purposes later.
  const now = new Date();
  
  // Start from now
  const nextMonday = new Date(); 
 
  // Add 8 days to the current date, then subtract the current day.
  // Sunday = day 0, Saturday = day 6.
  // Monday is 2 days from Saturday, so 6 + 2 = 8.
  nextMonday.setDate(now.getDate() + 8 - now.getDay());

  // Format it as required. This yields DD.MM.YYYY
  return `${nextMonday.getDate()}.${nextMonday.getMonth()}.${nextMonday.getFullYear()}`;
}
```

Alternatively, if you already have [Moment.js](https://momentjs.com/) in your project and need [.day()](https://momentjs.com/docs/#/get-set/day/) :

```
moment().day(8).format('DD.MM.YYYY');
```
