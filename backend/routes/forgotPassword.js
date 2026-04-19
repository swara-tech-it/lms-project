const express = require("express");
const router = express.Router();
const db = require("../db");
const nodemailer = require("nodemailer");

// store OTP temporarily (simple version)
let otpStore = {};

// EMAIL CONFIG
 const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "swaraj0694@gmail.com",
        pass: "odkt aadk nlfk xugx"
    }
});
 
/* const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
        user: "swaraj0694@gmail.com",
        pass: "odkt aadk nlfk xugx"
    }
}); */

// SEND OTP
router.post("/send-otp", (req, res) => {
    const { email } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000);

    otpStore[email] = otp;

    transporter.sendMail({
        from: "LMS <swaraj0694@gmail.com>",
        to: email,
        subject: "Password Reset OTP",
        text: `Your OTP is ${otp}`
    });

    res.json({ message: "OTP sent" });
});

// VERIFY OTP
router.post("/verify-otp", (req, res) => {
    const { email, otp } = req.body;

    if (otpStore[email] == otp) {
        res.json({ success: true });
    } else {
        res.json({ success: false, message: "Invalid OTP" });
    }
});

// RESET PASSWORD
router.post("/reset-password", (req, res) => {
    const { email, newPassword } = req.body;

    db.query(
        "UPDATE students SET password=? WHERE email=?",
        [newPassword, email],
        (err) => {
            if (err) return res.status(500).json({ message: "DB error" });

            res.json({ message: "Password updated" });
        }
    );
});

module.exports = router;