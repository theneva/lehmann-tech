var path = require('path');
var fs = require('fs');
var express = require('express');
var app = express();
var marked = require('marked');

app.get('/favicon.ico', function(req, res) {
  return res.sendStatus(404);
});

app.get('/:title', function(req, res) {
  var title = req.params.title;
  var postPath = path.join(__dirname, 'posts', title + '.md');

  fs.readFile(postPath, 'utf8', function(err, markdown) {
    if (err) {
      console.log(err);
      return res.status(404).send('Could not find a post called "' + title + '.md"');
    }

    var indexPath = path.join(__dirname, 'index.html');
    fs.readFile(indexPath, 'utf8', function(err, template) {
      if (err) {
        console.log(err);
        return res.send(500).send('Something went wrong.');
      }

      var renderedPost = marked(markdown);
      var html = template.replace(/\{\{POSTS\}\}/g, renderedPost);
      res.send(html);
    });
  }); 
});

app.listen(5678, function(err) {
  if (err) throw new Error(err);
  console.log('listening on port', 5678);
});
