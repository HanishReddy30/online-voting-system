const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://localhost:27017/votingDB', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    gender: String,
    birthDate: String,
    aadhaar: String,
    username: String,
    password: String
});

const voteSchema = new mongoose.Schema({
    username: String,
    vote: String
});

const User = mongoose.model('User', userSchema);
const Vote = mongoose.model('Vote', voteSchema);

app.post('/register', (req, res) => {
    const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        gender: req.body.gender,
        birthDate: req.body.birthDate,
        aadhaar: req.body.aadhaar,
        username: req.body.username,
        password: req.body.password
    });
    newUser.save((err) => {
        if (err) {
            console.log(err);
            res.send('Error in registration.');
        } else {
            res.redirect('/login.html');
        }
    });
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ username: username, password: password }, (err, foundUser) => {
        if (err) {
            console.log(err);
            res.send('Error in login.');
        } else {
            if (foundUser) {
                res.redirect('/voting.html');
            } else {
                res.send('Invalid username or password.');
            }
        }
    });
});

app.post('/vote', (req, res) => {
    const username = req.body.username;
    const userVote = req.body.vote;

    const newVote = new Vote({
        username: username,
        vote: userVote
    });

    newVote.save((err) => {
        if (err) {
            console.log(err);
            res.send('Error in voting.');
        } else {
            res.redirect('/result.html');
        }
    });
});

app.get('/results', (req, res) => {
    Vote.aggregate([
        {
            $group: {
                _id: "$vote",
                count: { $sum: 1 }
            }
        }
    ]).exec((err, results) => {
        if (err) {
            console.log(err);
            res.send('Error in fetching results.');
        } else {
            res.json(results);
        }
    });
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
