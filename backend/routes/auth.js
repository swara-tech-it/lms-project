const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require("../middleware/authMiddleware");

// REGISTER TEACHER
/* router.post("/register-teacher", (req, res) => {
    const { name, email, phone, college } = req.body;

    const password = "123456"; // default password

    const sql = "INSERT INTO teachers (name, email, password, college) VALUES (?, ?, ?, ?)";

    db.query(sql, [name, email, password, college], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "DB Error" });
        }

        res.json({ message: "Teacher Registered Successfully ✅" });
    });
}); */

router.post("/register-teacher", (req, res) => {

    const {
        firstname,
        lastname,
        username,
        email,
        phone,
        college
    } = req.body;

    const password = "123456";

    // CHECK DUPLICATE EMAIL OR USERNAME
    const checkSql = `
        SELECT * FROM teachers
        WHERE email = ? OR username = ?
    `;

    db.query(checkSql, [email, username], (err, rows) => {

        if (err) {
            console.log(err);
            return res.status(500).json({
                message: "DB Error"
            });
        }

        if (rows.length > 0) {
            return res.json({
                message: "Email or Username already exists"
            });
        }

        const sql = `
            INSERT INTO teachers
            (
                firstname,
                lastname,
                username,
                email,
                password,
                college
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                firstname,
                lastname,
                username,
                email,
                password,
                college
            ],
            (err, result) => {

                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        message: "DB Error"
                    });
                }

                res.json({
                    message: "Teacher Registered Successfully ✅"
                });
            }
        );
    });
});

/* router.post("/register-student", verifyToken, (req, res) => {

    const db = require("../db");

    const { name, email, phone } = req.body;

    const college = req.user.college; // ✅ NOW SAFE

    const sql = `
        INSERT INTO students (name, email, password, college)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [name, email, "123456", college], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "DB Error" });
        }

        res.json({ message: "Student Registered Successfully ✅" });
    });
}); */

router.post("/register-student", verifyToken, (req, res) => {

    const {
        firstname,
        lastname,
        username,
        email,
        phone
    } = req.body;

    const college = req.user.college;

    // CHECK DUPLICATE
    const checkSql = `
        SELECT * FROM students
        WHERE email = ? OR username = ?
    `;

    db.query(checkSql, [email, username], (err, rows) => {

        if (err) {
            console.log(err);
            return res.status(500).json({
                message: "DB Error"
            });
        }

        if (rows.length > 0) {
            return res.json({
                message: "Email or Username already exists"
            });
        }

        const sql = `
            INSERT INTO students
            (
                firstname,
                lastname,
                username,
                email,
                password,
                college
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                firstname,
                lastname,
                username,
                email,
                "123456",
                college
            ],
            (err, result) => {

                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        message: "DB Error"
                    });
                }

                res.json({
                    message: "Student Registered Successfully ✅"
                });
            }
        );
    });
});


// ================= ADMIN REGISTER =================
router.post('/admin/register', async (req, res) => {

    console.log(req.body); // ✅ ONLY HERE (inside route)

    const { name, email, password } = req.body;

    // save
    const hashed = await bcrypt.hash(password, 10);

    // login
    const match = await bcrypt.compare(password, user.password);

    const sql = "INSERT INTO admins (name, email, password) VALUES (?, ?, ?)";
    db.query(sql, [name, email, hashedPassword], (err, result) => {
        if (err) return res.send(err);
        res.send("Admin Registered ✅");
    });
});

// ================= ADMIN LOGIN =================

router.post('/admin/login', (req, res) => {

    console.log(req.body);

    const { username, password, college } = req.body;

    db.query(
        "SELECT * FROM admins WHERE username=? AND college=?",
        [username, college],
        (err, result) => {

            if (err) {
                console.log(err);
                return res.status(500).json({
                    message: "DB Error"
                });
            }

            if (result.length === 0) {
                return res.json({
                    message: "Admin not found"
                });
            }

            const admin = result[0];

            if (password !== admin.password) {
                return res.json({
                    message: "Wrong password"
                });
            }

            const token = jwt.sign(
                {
                    id: admin.id,
                    role: "admin",
                    college: admin.college
                },
                "SECRET_KEY",
                { expiresIn: "1d" }
            );

            res.json({
                token,
                role: "admin",
                user: admin
            });
        }
    );
});
// ================= Teacher LOGIN =================

router.post('/teacher/login', (req, res) => {
    const { email, password, college } = req.body;

    db.query(
        "SELECT * FROM teachers WHERE (email=? OR username=?) AND college=?",
        [email, college],
        async (err, result) => {
            if (err) return res.status(500).json({ message: "DB Error" });

            if (result.length === 0) {
                return res.json({ message: "Teacher not found" });
            }

            const teacher = result[0];

            //const match = await bcrypt.compare(password, teacher.password);
            const match = password === teacher.password;
            if (!match) {
                return res.json({ message: "Wrong password" });
            }

            const token = jwt.sign(
                { id: teacher.id, role: "teacher", college: teacher.college },
                "SECRET_KEY",
                { expiresIn: "1d" }
            );

            res.json({
                token,
                role: "teacher",
                user: teacher
            });
        }
    );
});

// ================= Student LOGIN =================

/* router.post('/student/login', (req, res) => {
    const { email, password, college } = req.body;

    db.query(
        "SELECT * FROM students WHERE email=? AND password=? AND college=?",
        [email, password, college],
        (err, result) => {
            if (err) return res.status(500).json({ message: "DB Error" });

            if (result.length > 0) {
                res.json({ token: "student-token", user: result[0] });
            } else {
                res.json({ message: "Invalid credentials or college" });
            }
        }
    );
}); */

router.post('/student/login', (req, res) => { 
    const { email, password, college } = req.body; 
    db.query( "SELECT * FROM students WHERE (email=? OR username=?) AND college=?", 
        [email, college], 
        async (err, result) => { 
            if (err) return res.status(500).json({ message: "DB Error" }); 
            if (result.length === 0) { return res.json({ message: "Student not found" }); } 
            const student = result[0]; 
            //const match = await bcrypt.compare(password, student.password); 
            const match = password === student.password;
            if (!match) { 
                return res.json({ message: "Wrong password" }); 
            } 
            const token = jwt.sign( { 
                id: student.id, 
                role: "student", 
                college: 
                student.college 
            }, 
                "SECRET_KEY", { expiresIn: "1d" } ); 
                res.json({ token, 
                    role: "student", 
                    user: student }); } ); 
            });



module.exports = router;