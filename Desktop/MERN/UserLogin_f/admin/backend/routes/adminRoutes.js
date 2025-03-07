const express = require('express');
const User = require('../models/userModel');
const Attendance = require('../models/attendanceModel')
const Admin = require('../models/adminModel')
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');

const router = express.Router();

// Function to create a JWT token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '3d' });
};


router.post('/login', async (req,res) => {
  const { email, password } = req.body;
  try {   
    const admin = await Admin.adminLogin(email, password); 
    res.json(admin);
} catch (err) {
    console.log(err)
    res.status(400).json({ error: err.message });
}
})


// Signup Route
router.post('/signup', async (req, res) => {
  const { name, email, password, authLevel } = req.body; 

  try {
    const user = await User.signup(name, email, password, authLevel); 

    // Create token
    const token = createToken(user._id);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
          user: process.env.EMAIL_USER, // Your email
          pass: process.env.EMAIL_PASS, // App password (not your Gmail password)
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "User credentials",
      text: `Hello ${name},\n\nYour account has been created successfully.\n\nLogin Credentials:\nEmail: ${email}\nPassword: ${password}\n\nPlease change your password after login.\n\nRegards,\nYour Team`
  };
  await transporter.sendMail(mailOptions);

    res.status(200).json({ name, email, token, authLevel, message: "Signup successful, email sent!" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.get('/students', async (req, res) => {
  try {
    const students = await User.find({ authLevel: 'student' });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/attendance', async (req, res) => {
  const { date, subject, time, students } = req.body;

  if (!date || !subject || !time || !students || students.length === 0) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Validate student IDs (optional but recommended)
  try {
    for (let student of students) {
      const user = await User.findById(student.studentId);
      if (!user) {
        return res.status(400).json({ message: `Student with ID ${student.studentId} not found` });
      }
    }

    // Create a new attendance record
    const attendance = new Attendance({
      date,
      time,
      subject,
      students
    });

    await attendance.save();
    res.status(201).json({ message: 'Attendance submitted successfully!' });

  } catch (error) {
    console.error('Error submitting attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});




module.exports = router;
