const fs = require('fs');

const poem = fs.readFileSync('./poem.txt', 'utf8');

console.log(poem);
