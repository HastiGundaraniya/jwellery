const express = require('express');
const User = require('../models/userModel');
const Attendance = require('../models/attendanceModel');

const router = express.Router();

// router.get('/', async (req, res) => {
//     try {
//         const users = await User.find({}).sort({ createdAt: -1 });
//         res.status(200).json(users);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

router.post('/login', async (req, res) => {
    console.log('in the login route')
    const { email, password, authLevel } = req.body; 

    try {   
        const user = await User.login(email, password, authLevel); 
        res.json(user);
    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message });
    }
});


module.exports = router;
