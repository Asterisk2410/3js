const express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
const path = require('path');
const app = new express();
const http = require("http").Server(app);
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
require("dotenv").config();
const request = require('request');
require("dotenv").config();
app.set('view engine', 'ejs');

var staticOptions = {
    setHeaders: function (res, path, stat) {
      res.removeHeader("X-Powered-By");
      res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.header('Expires', '-1');
      res.header('Pragma', 'no-cache');
      res.header('X-Frame-Options', 'sameorigin');
      res.header('X-XSS-Protection', '1; mode=block');
      res.header('X-Content-Type-Options', 'nosniff');
      res.header('Strict-Transport-Security', "max-age=31536000; includeSubDomains; preload");
      res.header("Content-Security-Policy", "default-src 'self' https://dhxtd0d9wmdd7.cloudfront.net blob: data: gap:; connect-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net ; script-src 'self' https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js login.windows.net 'unsafe-inline' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' https://dhxtd0d9wmdd7.cloudfront.net blob: data:; manifest-src 'self' login.windows.net");
      res.header("X-Content-Security-Policy", "default-src 'self' blob: data: gap:; script-src 'self' login.windows.net; style-src 'self' 'unsafe-inline'; img-src 'self'-; manifest-src 'self' login.windows.net");
      res.header('Referrer-Policy', 'same-origin');
    }
}

app.disable('x-powered-by');
// app.use(express.static('public', staticOptions));

app.use(fileUpload());
app.use(cookieParser());
app.use(session({secret: 'secretkey', saveUninitialized: true, resave: true, cookie:{ maxAge: 1200000}}));
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({limit: '100mb', extended: false}));

// Serve static files from the "src" directory
app.use('/src/', express.static(path.join(__dirname, 'src')));

// If "application.html" is your main HTML file
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'src', 'application.html'), function(err) {
        if (err) {
            res.status(500).send('An error occurred while loading the application.');
        }
    });
});



const httpPort = process.env.PORT || 2002;
http.listen(httpPort, () =>
    console.log("Server listening: http://localhost:" + httpPort)
);