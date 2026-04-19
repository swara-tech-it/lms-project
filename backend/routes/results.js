const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middleware/authMiddleware");

// GET student results
router.get("/student", verifyToken, (req, res) => {

    const sql = `
        SELECT 
            r.id,
            r.score,
            r.total,
            r.attempted_at,
            t.title AS testTitle,
            t.subject
        FROM results r
        JOIN tests t ON r.test_id = t.id
        WHERE r.student_id = ?
        ORDER BY r.attempted_at DESC
    `;

    db.query(sql, [req.user.id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: err.message });
        }
        res.json(result);
    });
});

module.exports = router;