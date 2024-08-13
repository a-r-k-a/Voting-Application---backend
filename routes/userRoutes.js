const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const { jwtAuthMiddleware, generateToken } = require('./../jwt');

//post route to add a person
//signup/register route
router.post('/signup', async (req, res) => {
    try {
        const data = req.body; //Assuming the request contains the user data

        //chech if there is already an admin user
        const adminUser = await User.findOne({role: 'admin'});
        if (data.role === 'admin' && adminUser) {
            return res.status(401).json({error: 'Admin user already exists'});
        }

        //validation
        //adhaar card number should have exactly 12 digits
        if (!/^\d{12}$/.test(data.aadharCardNumber)) {
        // if (!(data.aadharCardNumber) || data.aadharCardNumber.length !== 12) {
            return res.status(401).json({error: 'Adhaar card number must be of 12 characters'})
        }

        //check if the user with same adhaar card number exists
        const existingUser = await User.findOne({aadharCardNumber: data.aadharCardNumber});
        if (existingUser) {
            return res.status(401).json({error: 'User already exists'});
        }

        //creating a new user document with mongoose model
        const newUser = new User(data);

        //save the new user to the database
        const response = await newUser.save();
        console.log('DATA SAVED');

        //generating the payload to send the token
        const payload = {
            id: response.id
        }
        console.log(JSON.stringify(payload));

        //generating the token
        const token = generateToken(payload);

        res.status(200).json({response: response, token: token});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Internal server error'});
    }
})

//login route for the user
router.post('/login', async (req, res) => {
    try {
        //extract adhaar card and passworrd form the request body
        const { aadharCardNumber, password } = req.body;

        //check if the adhaar card or password is missing
        if (!aadharCardNumber || !password) {
            return res.status(400).json({error: 'Adhaar card number and password are required'});
        }

        //find the user by adhaar card number
        const user = await User.findOne({aadharCardNumber: aadharCardNumber});

        //if the user does not exist or the password does not match return error
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({error: 'Invalid adhaar card number or password'});
        }

        const payload = {
            id: user.id
        }
        const token = generateToken(payload);

        res.json({token:token});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Internal server error'});
    }
})

//profile route for the user
//get user profile
router.get('/profile', async (req, res) => {
    try {
        const userData = req.userData;  //userData is the key we are creating while creating the user and passing this data in the token
        const userId = userData.id;
        const user = await User.findById(userId);
        res.status(200).json({user});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Internal server error'});
    }
})

//route to change/update user password
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;  //extracting the id from the token 
        const { currentPassword, newPassword } = req.body; //extract the current and new password from the request body

        //check if the current and new password is present in the request body
        if (!currentPassword || !newPassword) {
            res.status(400).json({error: 'Both current and new password are required'});
        }

        //finding the user by userId
        const user = await User.findOneBy(userId);

        //if user does not exist or password does not match rreturn error
        if (!user || !(await user.comparePassword(currentPassword))) {
            return res.status(401).json({error: 'Invalid current password'})
        }
        //updating the password
        user.password = newPassword;
        await user.save();

        console.log('Password updated');
        res.status(200).json({message: 'Password Updated'});
    } catch (error) {
        console.log(error);
        res.status(200).json({error: 'Internal server error'});
    }
})

module.exports = router;
