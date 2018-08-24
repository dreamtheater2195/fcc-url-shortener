'use strict';

var express = require('express');
var mongo = require('mongodb');
var dns = require('dns');
var {mongoose} = require('./db/mongoose');
var {Link} = require('./models/link');
var bodyParser = require('body-parser');
var cors = require('cors');
var validUrl = require('valid-url');
var shortid = require('shortid');
var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);
mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true });

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl/new', function (req, res) {
  const {url} = req.body;
  if (validUrl.isUri(url)) {
    dns.lookup(url, (err) => {
      if (err) 
        return res.json({"error": err});
    });
    Link.findOne({url}, function(err, link) {
      if (err) {
        return res.json({"error": err});
      }
      if (link) {
        return res.json({
          original_url: url,
          short_url: link.short
        });
      } 
      const newShortCode = shortid.generate();
      const newLink = new Link({
        url: url,
        short: newShortCode
      });
      newLink.save().then(function(doc) {
        res.json({
          original_url: url,
          short_url: newShortCode
        });
      });
    });
  } else {
    res.json({"error":"invalid URL"});
  }
});

app.get('/api/shorturl/:short', function (req, res) {
  const short = req.params.short;
  Link.findOne({short}, function (err, link) {
    if (link) {
      res.redirect(link.url);
    } else {
      res.json({
        error: "Shortlink not found in the database." 
      });
    }
  });
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});