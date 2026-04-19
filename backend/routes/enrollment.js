const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/authMiddleware');


// ======================
// STUDENT - APPLY
// ======================
router.post('/', verifyToken, (req, res) => {
    const studentId = req.user.id;
    const { batchId } = req.body;

    const sql = `
        INSERT INTO enrollments (student_id, batch_id, status)
        VALUES (?, ?, 'Pending')
    `;

    db.query(sql, [studentId, batchId], (err) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Insert failed" });
        }

        res.json({ message: "Enrollment request sent" });
    });
});


// ======================
// STUDENT - MY ENROLLMENTS
// ======================
router.get('/', verifyToken, (req, res) => {

    const sql = `
        SELECT e.*, b.name AS batchName
        FROM enrollments e
        JOIN batches b ON e.batch_id = b.id
        WHERE e.student_id = ?
    `;

    db.query(sql, [req.user.id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "DB Error" });
        }

        res.json(result);
    });
});


// ======================
// TEACHER - PENDING REQUESTS
// ======================
router.get('/teacher', verifyToken, (req, res) => {

    const sql = `
        SELECT e.*, s.name AS studentName, b.name AS batchName
        FROM enrollments e
        JOIN students s ON e.student_id = s.id
        JOIN batches b ON e.batch_id = b.id
        WHERE e.status = 'Pending'
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "DB Error" });
        }

        res.json(result);
    });
});


// ======================
// APPROVE ENROLLMENT
// ======================
router.put('/approve/:id', verifyToken, (req, res) => {

    const enrollmentId = req.params.id;

    const getBatchSql = `SELECT batch_id FROM enrollments WHERE id=?`;

    db.query(getBatchSql, [enrollmentId], (err, rows) => {
        if (err || rows.length === 0) {
            return res.status(500).json({ message: "Error finding enrollment" });
        }

        const batchId = rows[0].batch_id;

        db.query(
            "UPDATE enrollments SET status='Approved' WHERE id=?",
            [enrollmentId],
            (err) => {
                if (err) {
                    return res.status(500).json({ message: "Update failed" });
                }

                db.query(
                    "UPDATE batches SET enrolled = enrolled + 1 WHERE id=?",
                    [batchId]
                );

                res.json({ message: "Approved + Count Updated ✅" });
            }
        );
    });
});

module.exports = router;