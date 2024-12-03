const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET;

//list_of_users
router.get('/users' , async(req, res)=> {
    try{
        const users = await User.find()
        res.status(200).json(users);
        console.log("get users called");
        
    }catch(err){
        res.status(500).json({ message: 'Server ERROR', error: err.message });
    }
    
})

// Sign Up
router.post('/signup', async (req, res) => {
    const { username, password , location} = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword , location});

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Sign In
// Sign In
router.post('/signin', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Include location in the payload
        const token = jwt.sign(
            { 
                id: user._id, 
                username: user.username, 
                location: user.location // Add location to the payload
            },
            SECRET_KEY, 
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Login successful', token, location: user.location });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


module.exports = router;
