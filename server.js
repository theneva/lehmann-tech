const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();

const renderMarkdownFile = require('./MarkdownFileRenderer');
const renderTemplate = require('./TemplateRenderer');

app.get('/favicon.ico', (req, res) => res.sendStatus(404));

app.get('/', (req, res) => {
  return fs.readdir(path.join(__dirname, 'posts'), (err, fileNames) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Something went wrong!');
    }

    const fileListHtml = '<ul>' + fileNames.map(fileName => `<li><a href="/${fileName}">${fileName}</a></li>`).join('') + '</ul>';
    return res.send(fileListHtml);
  });
});

app.get('/:title', (req, res) => {
  const rawTitle = req.params.title;

  const title = rawTitle.endsWith('.md')
    ? rawTitle
    : `${rawTitle}.md`;

  const postPath = path.join(__dirname, 'posts', title);

  renderMarkdownFile(postPath)
    .then(renderedPost => {
      const replacements = {
        post: renderedPost,
      };

      renderTemplate('application.template', replacements)
        .then(html => res.send(html))
        .catch(err => {
          console.log(err);
          res.status(500).send('Something went wrong!')
        });
    })
    .catch(err => {
      console.log(err);
      return res.status(404).send('Could not find a post called "' + title + '.md"');
    });

});

app.listen(5678, err => {
  if (err) throw new Error(err);
  console.log('listening on port', 5678);
});
