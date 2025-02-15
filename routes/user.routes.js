const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.get('/register', (req, res) => {
    res.render('register');
});

router.post(
    '/register',
    [
        body('email').trim().isEmail(),
        body('password').trim().isLength({ min: 5 }),
        body('user_name').trim().isLength({ min: 3 }),
    ],
    async (req, res) => {
        console.log(req.body);
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: 'Invalid data',
            });
        }

        const { email, user_name, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const newUser = await userModel.create({
                email,
                user_name,
                password: hashedPassword,
            });

            res.json(newUser);
        } catch (error) {
            res.status(500).json({ message: 'Error registering user' });
        }
    }
);

router.get('/login', (req, res) => {
    res.render('login');
});

router.post(
    '/login',
    [
        body('user_name').trim().isLength({ min: 3 }),
        body('password').trim().isLength({ min: 5 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: 'Invalid data',
            });
        }

        const { user_name, password } = req.body;
        const user = await userModel.findOne({ user_name });

        if (!user) {
            return res.status(400).json({
                message: 'Username or password is incorrect',
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Username or password is incorrect',
            });
        }

        // Generate JWT Token
        const token = jwt.sign(
            {
                userID: user._id,
                email: user.email,
                username: user.user_name,
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, { httpOnly: true, secure: false });
        res.redirect('/');
    }
);

router.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error(err);
            return res.redirect("/");
        }
        res.clearCookie("token"); 
        res.clearCookie("connect.sid"); 
        res.redirect("/user/login");
    });
});


module.exports = router;
