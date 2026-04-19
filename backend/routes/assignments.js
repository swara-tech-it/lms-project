const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middleware/authMiddleware");

// GET student assignments

router.get("/student", verifyToken, (req, res) => {

    const sql = `
        SELECT 
            a.id,
            a.file AS fileName,
            a.score,
            a.status,
            b.name AS batchName
        FROM assignments a
        JOIN batches b ON a.batch_id = b.id
        WHERE a.student_id = ?
    `;

    db.query(sql, [req.user.id], (err, result) => {
        if (err) {
            console.log("ASSIGNMENT ERROR:", err);
            return res.status(500).json({ message: err.message });
        }

        res.json(result);
    });
});

module.exports = router;