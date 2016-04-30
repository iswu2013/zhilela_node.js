var http = require('http');
var https = require('https');
var express = require('express');
var fs = require('fs');
var morgan = require('morgan');
var path = require('path');

var app = express();
var port = process.env.PORT || 8080;
process.env.NODE_ENV = app.get('env');
var config = require('./config')[app.get('env')];
app.set('config',config);


var sslOptions = {};
if(config.ssl.key) {
  try {
    sslOptions.cert = fs.readFileSync(config.ssl.cert);
  } catch (e){
    console.error(e);
  }
}

app.set('views',path.join(__dirname,'views'));
app.set('view engine','mustache');
app.engine('mustache',require('hogan-express'));

var knex = require('knex')({
  client:'mysql',
  connection:config.database
});

var bookshelf = require('bookshelf')(knex);
app.set("Bookshelf",bookshelf);

var middleware = require('./middleware')(app);
app.use(express.static(__dirname+"/public"));
app.use(morgan('combined'));

app.use('/api/v:version',function (req, res, next) {
  var version = app.get('config').version;
  if(req.params.version == version) {
    middleware.routes['v'+version](req,res,next);
  } else {
    next({
      status:410,
      code:'DEPRECATED',
      message: 'The API version is deprecated or does not exist.'
    });
  }
});

app.use(middleware.routes.routes.views);