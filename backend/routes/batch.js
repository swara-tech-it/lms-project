const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/authMiddleware');


// CREATE BATCH
router.post('/', verifyToken, (req, res) => {
    const { name, subject, className, capacity, startDate, endDate } = req.body;
    const teacherId = req.user.id;

    const sql = `
        INSERT INTO batches (name, subject, class, capacity, created_by, start_date, end_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [name, subject, className, capacity, teacherId, startDate, endDate], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "DB Error" });
        }

        res.json({
            message: "Batch created",
            batchId: result.insertId
        });
    });
});


// ⭐ ADD THIS (VERY IMPORTANT)
router.get('/', verifyToken, (req, res) => {
    const sql = "SELECT * FROM batches";

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "DB Error" });
        }

        res.json(result);
    });
});

// GET batches created by teacher
router.get('/my', verifyToken, (req, res) => {
    const teacherId = req.user.id;

    const sql = `
        SELECT id, name, subject
        FROM batches
        WHERE created_by = ?
    `;

    db.query(sql, [teacherId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Error fetching batches" });
        }

        res.json(result);
    });
});

module.exports = router;