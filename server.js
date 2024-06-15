const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://localhost:27017/votingDB')
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
      console.log('MongoDB connection error:', err);
      process.exit(1); // Exit the process with a failure code
  });

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

app.post('/register', async (req, res) => {
    console.log('Register endpoint hit');
    const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        gender: req.body.gender,
        birthDate: req.body.birthDate,
        aadhaar: req.body.aadhaar,
        username: req.body.username,
        password: req.body.password
    });
    try {
        await newUser.save();
        console.log('User registered successfully');
        res.redirect('/login.html');
    } catch (err) {
        console.log('Error in registration:', err);
        res.send('Error in registration.');
    }
});

app.post('/login', async (req, res) => {
    console.log('Login endpoint hit');
    const username = req.body.username;
    const password = req.body.password;
    try {
        const foundUser = await User.findOne({ username: username, password: password });
        if (foundUser) {
            console.log('User logged in successfully');
            res.redirect('/voting.html');
        } else {
            console.log('Invalid username or password');
            res.send('Invalid username or password.');
        }
    } catch (err) {
        console.log('Error in login:', err);
        res.send('Error in login.');
    }
});

app.post('/vote', async (req, res) => {
    console.log('Vote endpoint hit');
    const username = req.body.username;
    const userVote = req.body.vote;

    const newVote = new Vote({
        username: username,
        vote: userVote
    });
    try {
        await newVote.save();
        console.log('Vote recorded successfully');
        res.redirect(`/vote-confirmation?username=${encodeURIComponent(username)}&vote=${encodeURIComponent(userVote)}`);
    } catch (err) {
        console.log('Error in voting:', err);
        res.send('Error in voting.');
    }
});

app.get('/vote-confirmation', (req, res) => {
    const username = req.query.username;
    const vote = req.query.vote;

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Vote Confirmation</title>
            <link rel="stylesheet" href="voting.css">
        </head>
        <body>
            <h1 style="color: blueviolet;">Vote Confirmation</h1>
            <p>Thank you, ${username}. Your vote for <strong>${vote}</strong> has been recorded successfully.</p>
            
        </body>
        </html>
    `);
});

app.get('/results', async (req, res) => {
    console.log('Results endpoint hit');
    try {
        const results = await Vote.aggregate([
            {
                $group: {
                    _id: "$vote",
                    count: { $sum: 1 }
                }
            }
        ]);
        res.json(results);
    } catch (err) {
        console.log('Error in fetching results:', err);
        res.send('Error in fetching results.');
    }
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
