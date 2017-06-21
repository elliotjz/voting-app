var express = require("express");
var app = express();
var cookieParser = require("cookie-parser");
var session = require("express-session");
var passport = require("passport");
var Strategy = require("passport-twitter").Strategy;
var controller = require('./controller');

app.set("view engine", "pug");

app.use(express.static('./public'));

// Grab ID from cookies
var cookieParserFunction = cookieParser();
app.use(function(req, res, next){
    cookieParserFunction(req, res, next);
});

var sessionFunction = session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
});

app.use(function(req, res, next){
    sessionFunction(req, res, next);
});

var passportInitializer = passport.initialize();
app.use(function(req, res, next){
    passportInitializer(req, res, next);
});

var passportSessionFunction = passport.session();
app.use(function(req, res, next){
    passportSessionFunction(req, res, next);
});

app.use(function(req, res, next){
    res.locals.user = req.user;
    next();
});

passport.serializeUser(function(user, next) {
    next(null, user);
});

passport.deserializeUser(function(user, next) {
    next(null, user);
});

let twitterObj = {
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET,
    callbackURL: process.env.CALLBACK_URL
}

var twitterStrategy = new Strategy(
    twitterObj,
    function(token, tokenSecret, profile, next){
        next(null, profile);
    }
);
passport.use(twitterStrategy);

// Set up Routes
controller(app, passport);

app.listen(3000, function(){
    console.log("Server running at http://127.0.0.1:3000");
});
