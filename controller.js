var bodyParser = require('body-parser');

let urlencodedParser = bodyParser.urlencoded({extended: false});

module.exports = function(app, passport) {

    app.get("/", function(req, res){
        let user = {};
        if (req.user) {
            user.name = req.user.displayName;
            user.id = req.user._json.id_str;
        }
        res.render("index", { user: user });
    });

    app.get('/my-polls', function(req, res) {
        let user = {};
        if (req.user) {
            user.name = req.user.displayName;
            user.id = req.user._json.id_str;
            res.render('my-polls', { user: user });
        } else {
            res.redirect('/');
        }
    })

    app.get('/new-poll', function(req, res) {
        let user = {};
        if (req.user) {
            user.name = req.user.displayName;
            user.id = req.user._json.id_str;
            res.render('new-poll', { user: user });
        } else {
            res.redirect('/');
        }
    })

    app.post('/poll-submit', urlencodedParser, function(req, res) {
        console.log("post");
        let title = req.body.title;
        let options = req.body.options.split(',');
        options.forEach(function(option, index) {
            options[index] = option.trim();
        })
        /*
        Save to MONGO!
        */
        res.redirect('/my-polls');
    })

    var twitterAuthenticator = passport.authenticate("twitter");
    app.get("/signin", function(req, res){
        twitterAuthenticator(req, res);
    });

    app.get("/signout", function(req, res){
        var username;
        if(req.user) username = req.user.username;
        else username = "user";
        req.session.destroy();
        res.locals.user = null
        res.render("signout", { user: {} });
    });

    var authenticateNewUser = passport.authenticate("twitter", { failureRedirect: "/signout" });
    app.get("/auth/twitter/callback",
        function(req, res, next){
            authenticateNewUser(req, res, next);
        },
        function(req, res){
            // SAVE THESE TO MONGO!!!
            //console.log(req.user.displayName);
            //console.log(req.user._json.id_str);
            /////
            res.redirect("/");
        });
}