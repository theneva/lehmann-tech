var path = require('path');
var fs = require('fs');
var express = require('express');
var app = express();
var marked = require('marked');

app.get('/:title', function(req, res) {
  var title = req.params.title;
  var postPath = path.join(__dirname, 'posts', title + '.md');

  console.log('trying to load file from path', postPath);

  fs.readFile(postPath, 'utf8', function(err, markdown) {
    if (err) {
      return res.status(404).send('Could not find a post called "' + title + '.md"');
    }

    res.send(marked(markdown));
  }); 
});

app.listen(5678, function(err) {
  if (err) throw new Error(err);
  console.log('listening on port', 5678);
});
