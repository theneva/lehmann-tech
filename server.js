const path = require('path');
const express = require('express');
const app = express();

const renderMarkdownFile = require('./MarkdownFileRenderer');
const renderTemplate = require('./TemplateRenderer');

app.get('/favicon.ico', (req, res) => res.sendStatus(404));

app.get('/:title', (req, res) => {
  const title = req.params.title;
  const postPath = path.join(__dirname, 'posts', title + '.md');

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
