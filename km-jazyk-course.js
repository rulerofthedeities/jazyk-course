'use strict';
var express = require('express'),
    app = express(),
    sslRedirect = require('heroku-ssl-redirect'),
    compression = require('compression'),
    path = require('path'),
    bodyParser = require('body-parser'),
    bearerToken  = require('express-bearer-token'),
    fs = require('fs'),
    routes = require('./server/routes'),
    checks = require('./server/checks'),
    {mongoose} = require('./server/mongoose'),
    https = require('https'),
    prerender = require('prerender-node');

// config
app.set('port', process.env.PORT || 5010);
app.set('env', process.env.NODE_ENV || 'development');
app.set('token_expiration', 604800);// Token expires after 7 days

// check for warnings
checks.checkWarnings(app);

// middleware
app.use(compression());
app.use(bearerToken());
app.use(sslRedirect());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'dist')));
app.use(prerender.set('protocol', 'https'));

// routing
routes.initialize(app, new express.Router());

// server
if (app.get('env') === 'development') {
  const options = {
    key: fs.readFileSync('../ssl/jazyk.key'),
    cert: fs.readFileSync('../ssl/jazyk.cer')
  };
  https.createServer(options, app).listen(app.get('port'), function() {
    console.log('Local https server running on port ' + app.get('port'));
  });
} else {
  app.listen(app.get('port'), function() {
    console.log('Server running on port ' + app.get('port'));
  });
}
