'use strict';

let Twitter = require('node-twitter-api');
let http = require('http');

module.exports = function(app) {

	let twitter = new Twitter({
		consumerKey: process.env.CONSUMER_KEY,
		consumerSecret: process.env.CONSUMER_SECRET,
		callback: process.env.CALLBACK_URL
	});

	let _requestSecret;

	app.get('/', function(req, res) {
		res.render('index', {message: "Hi Voting app"});
	});

	app.get('/request-token', function(req, res) {
		twitter.getRequestToken(function(err, requestToken, requestSecret) {
			if (err) res.status(500).send(err);
			else {
				_requestSecret = requestSecret;
				res.redirect("https://api.twitter.com/oauth/authenticate?oauth_token=" + requestToken);
			}
		})
	})

	app.get('/access-token', function(req, res) {
		let requestToken = req.query.oauth_token
		let verifier = req.query.oauth_verifier;

		twitter.getAccessToken(requestToken, _requestSecret, verifier, function(err, accessToken, accessSecret) {
			if (err) res.status(500).send(err);
			else {
				twitter.verifyCredentials(accessToken, accessSecret, function(err, user) {
					if (err) res.status(500).send(err);
					else {
						console.log(user);
						res.send(user);
					}
				});
			}
		});
	})

	app.get('/auth/twitter/callback', function(req, res) {
		res.render('signed-in');
	});

	app.get('/sign-in-fail', function(req, res) {
		res.render('sign-in-fail');
	});

	app.use(function(req, res, next) {
	    res.status(400);
	    res.end('404: File Not Found');
	});
}


