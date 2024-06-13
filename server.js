const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/votingDB')
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
      console.log('MongoDB connection error:', err);
      process.exit(1); // Exit the process with a failure code
  });

// Define Mongoose Schemas and Models
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

// Registration endpoint
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

// Login endpoint
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

// Vote endpoint
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
        res.redirect('/results.html');
    } catch (err) {
        console.log('Error in voting:', err);
        res.send('Error in voting.');
    }
});

// Results endpoint
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

// Start the server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});
