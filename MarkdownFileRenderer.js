const fs = require('fs');
const marked = require('marked');

module.exports = function renderMarkdownFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, markdown) => {
      if (err) {
        return reject(err);
      }

      return resolve(marked(markdown));
    });
  });
}
