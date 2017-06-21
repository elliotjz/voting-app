let bodyParser = require('body-parser');
let mongoose = require('mongoose');
var makePollId = require('./public/js/makePollId');

let urlencodedParser = bodyParser.urlencoded({extended: false});

// Set up database
mongoose.connect(process.env.MLAB_URL);
let userSchema = new mongoose.Schema({
    id: String,
    name: String,
})
let pollSchema = new mongoose.Schema({
    id: String,
    owner: String,
    title: String,
    votes: Object,
    votees: Array
})
let UserModel = mongoose.model('users', userSchema);
let PollModel = mongoose.model('polls', pollSchema);


module.exports = function(app, passport) {

    app.get("/", function(req, res){
        PollModel.find({}, function(err, polls) {
            if (err) throw err;
            let user = {};
            if (req.user) {
                user.name = req.user.displayName;
                user.id = req.user._json.id_str;
            }
            res.render("index", {
                user: user,
                polls: polls
            });
        });
    });

    app.get('/my-polls', function(req, res) {
        if (!req.user) {
            res.redirect('/');
        } else {
            let user = {};
            user.name = req.user.displayName;
            user.id = req.user._json.id_str;
            PollModel.find({owner: user.id}, function(err, polls) {
                if (err) throw err;
                res.render('my-polls', {
                    user: user,
                    polls: polls
                });
            });
        }
    })

    app.get('/poll', function(req, res) {
        let message = req.query.message;
        let user = {};
        if (req.user) {
            user.name = req.user.displayName;
            user.id = req.user._json.id_str;
        }
        PollModel.find({ id: req.query.id }, function(err, poll) {
            if (err) throw err;
            if (poll) {
                res.render('poll', { user: user, polls: poll, message: message });
            } else {
                res.redirect('/');
            }
        });
    })

    app.get('/new-poll', function(req, res) {
        if (req.user) {
            let user = {};
            user.name = req.user.displayName;
            res.render('new-poll', {
                user: user
            });
        } else {
            res.redirect('/');
        }
    })

    app.post('/poll-submit', urlencodedParser, function(req, res) {
        let options = req.body.options.split(',');
        let optionsObj = {}
        options.forEach(function(option) {
            if (option.trim() !== '') {
                optionsObj[option.trim()] = 0;
            }
        })
        newPoll = {
            id: makePollId(),
            owner: req.user._json.id_str,
            title: req.body.title,
            votes: optionsObj,
            votees: []
        }
        //Save to DB
        PollModel(newPoll).save(function(err, data) {
            if (err) throw err;
            res.redirect('/my-polls');
        })
    })

    app.post('/vote-submit', urlencodedParser, function(req, res) {
        let chosenOption = req.body.vote;
        let newVotes;
        PollModel.find({ id: req.body.pollId }, function(err, poll) {
            if (err) throw err;
            newVotes = poll[0].votes;
            newVotees = poll[0].votees;

            if (chosenOption !== 'I have a better option...') {
                newVotes[chosenOption] += 1;
            } else {
                newVotes[req.body.newOption] = 1
            }
            let ipAddress = req.connection.remoteAddress;
            let alreadyVoted = false;
            for (let i = 0; i < newVotees.length; i++ ) {
                if (newVotees[i] === ipAddress) alreadyVoted = true;
            }
            if (alreadyVoted) {
                res.redirect('/poll?id=' + req.body.pollId + "&message=1");
            } else {
                newVotees.push(ipAddress);
                PollModel.update({ id: req.body.pollId }, {
                    $set: { votes: newVotes, votees: newVotees }
                    }, function(err, data) {
                    if (err) throw err;
                    res.redirect('/poll?id=' + req.body.pollId);
                })
            }
        })
    })

    app.post('/delete-poll', function(req, res) {
        let pollId = req.query.id;
        PollModel.remove({ id: pollId }, function(err, poll) {
            if (err) throw err;
        })
        res.redirect('/my-polls');
    })

    var twitterAuthenticator = passport.authenticate("twitter");

    app.get("/signin", function(req, res){
        twitterAuthenticator(req, res);
    });

    app.get("/signout", function(req, res){
        PollModel.find({}, function(err, polls) {
            if (err) throw err;
            var username;
            if(req.user) username = req.user.username;
            else username = "user";
            req.session.destroy();
            res.locals.user = null;
            res.render("signout", { user: {}, polls: polls });
        })
    });

    var authenticateNewUser = passport.authenticate("twitter", { failureRedirect: "/signout" });

    app.get("/auth/twitter/callback", function(req, res, next){
            authenticateNewUser(req, res, next);
        }, function(req, res){
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

