const path = require('path');
const fs = require('fs');

module.exports = function renderTemplate(templatePath, replacements) {
  return new Promise((resolve, reject) => {
    fs.readFile(templatePath, 'utf8', (err, template) => {
      if (err) {
        return reject(err);
      }

      const templateRenderedAsHtml = Object.keys(replacements)
        .reduce((partiallyRenderedTemplate, replacementKey) => partiallyRenderedTemplate.replace(
            new RegExp(`\\{\\{${replacementKey}\\}\\}`, 'g'),
            replacements[replacementKey]
         ), template);

      return resolve(templateRenderedAsHtml);
    });
  });
};
