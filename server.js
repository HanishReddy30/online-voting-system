const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false
}));

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
    aadhaar: { type: String, unique: true },
    username: { type: String, unique: true },
    password: String
});

const voteSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    vote: String
});

const User = mongoose.model('User', userSchema);
const Vote = mongoose.model('Vote', voteSchema);

app.post('/register', async (req, res) => {
    const { firstName, lastName, gender, birthDate, aadhaar, username, password, confirmpassword } = req.body;
    const errors = {};

    // Server-side validation
    if (!firstName.trim()) errors.firstName = 'First name is required.';
    if (!lastName.trim()) errors.lastName = 'Last name is required.';
    if (!gender) errors.gender = 'Please select your gender.';
    if (!birthDate) errors.birthDate = 'Date of birth is required.';
    if (!aadhaar.trim() || !/^\d{12}$/.test(aadhaar)) errors.aadhaar = 'Aadhaar number must be 12 digits.';
    if (!username.trim()) errors.username = 'Username is required.';
    if (!password.trim()) errors.password = 'Password is required.';
    if (password !== confirmpassword) errors.confirmpassword = 'Passwords do not match.';

    const birthDateObj = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDifference = today.getMonth() - birthDateObj.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
    }

    if (age < 18) errors.birthDate = 'You must be at least 18 years old.';

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }

    const newUser = new User({
        firstName,
        lastName,
        gender,
        birthDate,
        aadhaar,
        username,
        password
    });

    try {
        await newUser.save();
        console.log('User registered successfully');
        res.sendStatus(200);
    } catch (err) {
        if (err.code === 11000) {
            // Duplicate key error
            if (err.keyValue.aadhaar) errors.aadhaar = 'Aadhaar number already exists.';
            if (err.keyValue.username) errors.username = 'Username already exists.';
            return res.status(400).json({ errors });
        }
        console.log('Error in registration:', err);
        res.status(500).send('Error in registration.');
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const foundUser = await User.findOne({ username, password });

        if (!foundUser) {
            return res.status(400).send('Invalid username or password.');
        }

        const existingVote = await Vote.findOne({ username });

        if (existingVote) {
            return res.status(400).send('You have already voted.');
        }

        req.session.username = username;
        console.log('User logged in successfully');
        res.sendStatus(200);
    } catch (err) {
        console.log('Error in login:', err);
        res.status(500).send('Error in login.');
    }
});


app.post('/vote', async (req, res) => {
    const { vote } = req.body;
    const username = req.session.username;

    if (!username) {
        return res.status(403).send('You must be logged in to vote.');
    }

    try {
        const existingVote = await Vote.findOne({ username });

        if (existingVote) {
            return res.status(400).send('You have already voted.');
        }

        const newVote = new Vote({ username, vote });
        await newVote.save();
        console.log('Vote recorded successfully');
        res.redirect(`/vote-confirmation?username=${encodeURIComponent(username)}&vote=${encodeURIComponent(vote)}`);
    } catch (err) {
        console.log('Error in voting:', err);
        res.status(500).send('Error in voting.');
    }
});

app.get('/vote-confirmation', (req, res) => {
    const { username, vote } = req.query;
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
            <h2>Thank you, ${username}. Your vote for <strong>${vote}</strong> has been recorded successfully.</h2>
        </body>
        </html>
    `);
});

app.get('/results', async (req, res) => {
    try {
        const results = await Vote.aggregate([
            { $group: { _id: "$vote", count: { $sum: 1 } } }
        ]);
        res.json(results);
    } catch (err) {
        console.log('Error in fetching results:', err);
        res.status(500).send('Error in fetching results.');
    }
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
