// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');
var path = require('path');
var crypto = require('crypto');
var bodyParser = require('body-parser');
var cc = require('./cloud/push_functions.js');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI || 'mongodb://superuser:12345678@ec2-54-213-135-81.us-west-2.compute.amazonaws.com/eventro';

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  verbose: true,
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'EWVn1O9MYRPjbTmwXKnGH3Vht52wQ5Mw7JeNsGt9',
  masterKey: process.env.MASTER_KEY || 'fvflekc06v0QHyWtE3zYiDzlh6gpZA0U6IP8j36W', //Add your master key here. Keep it secret!
  fileKey: process.env.FILE_KEY || '', // Add the file key to provide access to files already hosted on Parse
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  },
  push: {
      android: {
        senderId: '114881002975',
        apiKey: 'AIzaSyC0Cq8q67YKMatVX_zLoAk__ho0a58TtoY'
      },
      ios: [
        {
          pfx: 'dev-cert.p12', // Dev PFX or P12
          bundleId: 'com.geteventro.app',
          production: false // Dev
        },
        {
          pfx: 'dist-cert.p12', // Prod PFX or P12
          bundleId: 'com.geteventro.app',
          production: true // Prod
        }
      ]
    }
});

var dashboard = new ParseDashboard({
  "apps": [{
    "serverURL": "http://parseserver-dm5pm-env.us-east-1.elasticbeanstalk.com/parse",
    "appId": "EWVn1O9MYRPjbTmwXKnGH3Vht52wQ5Mw7JeNsGt9",
    "masterKey": "fvflekc06v0QHyWtE3zYiDzlh6gpZA0U6IP8j36W",
    "appName": "eventro",
    "iconName": "eventro.png"
  }],
  "users": [
    {
      "user":"alvajindia@gmail.com",
      "pass":"vajid123!@#"
    },
    {
      "user":"liam@appamap.com",
      "pass":"liam123!@#"
    }
  ],
  "iconsFolder": "icons"
});

// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// make the Parse Dashboard available at /dashboard
app.use('/dashboard', dashboard);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('Make sure to star the parse-server repo on GitHub!');
});

/* Below section is the re-factored node-firebase-parse server code*/

// var config = require('./config.js')(app, express, bodyParser);
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})); // for parsing       application/x-www-form-urlencoded

// Parse Model for sending Push Notification.
var myfirebase = require('./firebase_parse/connectfirebase.js');
// Firebase Model
var myparse = require('./firebase_parse/connectparse.js');
// Request and Response Module
require('./firebase_parse/route')(app, myfirebase, myparse);

require('./firebase_parse/notification').locationService(myparse);

app.use('/vajidtest', function(req,res){
  console.log('vajid test reached');
  cc.test();
  return res.json("test");
});

/*// Run app on 8080 port.
http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});*/



// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
