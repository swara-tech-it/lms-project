const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middleware/authMiddleware");

router.post("/", verifyToken, (req, res) => {
    const { batchId, meetingLink } = req.body;
    const teacherId = req.user.id;

    db.query(
        "SELECT * FROM batches WHERE id=? AND created_by=?",
        [batchId, teacherId],
        (err, rows) => {
            if (err) return res.status(500).json(err);

            if (rows.length === 0) {
                return res.status(403).json({ message: "Invalid batch ❌" });
            }

            db.query(
                "UPDATE live_classes SET is_active=0 WHERE batch_id=?",
                [batchId],
                (err) => {
                    if (err) return res.status(500).json(err);

                    db.query(
                        `INSERT INTO live_classes (batch_id, teacher_id, meeting_link, is_active)
                         VALUES (?, ?, ?, 1)`,
                        [batchId, teacherId, meetingLink],
                        (err) => {
                            if (err) return res.status(500).json(err);

                            res.json({ message: "Zoom link assigned successfully ✅" });
                        }
                    );
                }
            );
        }
    );
});

router.get("/student", verifyToken, (req, res) => {
    const sql = `
        SELECT lc.*
        FROM live_classes lc
        JOIN enrollments e ON e.batch_id = lc.batch_id
        WHERE e.student_id = ?
        AND e.status = 'Approved'
        AND lc.is_active = 1
        ORDER BY lc.created_at DESC
        LIMIT 1
    `;

    db.query(sql, [req.user.id], (err, result) => {
        if (err) return res.status(500).json(err);

        res.json(result[0] || null);
    });
});

module.exports = router;
