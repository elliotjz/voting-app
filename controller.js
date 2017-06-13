let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let env = require('./env');
var makePollId = require('./public/js/makePollId');

let urlencodedParser = bodyParser.urlencoded({extended: false});

// Connect to database
mongoose.connect(env.mlab_url);

// Create schema
let userSchema = new mongoose.Schema({
    id: String,
    name: String,
})

let pollSchema = new mongoose.Schema({
    id: String,
    owner: String,
    title: String,
    votes: Object
})

let UserModel = mongoose.model('users', userSchema);
let PollModel = mongoose.model('polls', pollSchema);

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
            res.render('new-poll', { user: user });
        } else {
            res.redirect('/');
        }
    })

    app.post('/poll-submit', urlencodedParser, function(req, res) {
        console.log("post");
        let options = req.body.options.split(',');
        let optionsObj = {}
        options.forEach(function(option) {
            optionsObj[option.trim()] = 0;
        })
        newPoll = {
            id: makePollId(),
            owner: req.user._json.id_str,
            title: req.body.title,
            votes: optionsObj
        }
        //Save to DB
        let newPollDoc = PollModel(newPoll).save(function(err, data) {
            if (err) throw err;
        })

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
            newUser = {
                id: req.user._json.id_str,
                name: req.user.displayName,
            }
            UserModel.findOne({ id: newUser.id }, function(err, data) {
                if (err) throw err;
                if (!data) {
                    let newUserDoc = UserModel(newUser).save(function(err, data) {
                        if (err) throw err;
                    })
                }
                res.redirect('/');
            })
        });
}