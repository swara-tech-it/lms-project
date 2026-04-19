const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/authMiddleware');


// ======================
// CREATE TEST (TEACHER)
// ======================
router.post('/', verifyToken, (req, res) => {
    const { title, batchId, subject, questions } = req.body;

    const sql = `
        INSERT INTO tests (title, batch_id, subject, created_by)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [title, batchId, subject, req.user.id], (err, result) => {
        if (err) return res.status(500).json({ message: "Error creating test" });

        const testId = result.insertId;

        const qSql = `
            INSERT INTO questions
            (test_id, question, option_a, option_b, option_c, option_d, correct_option)
            VALUES ?
        `;

        const values = questions.map(q => [
            testId,
            q.question,
            q.a,
            q.b,
            q.c,
            q.d,
            q.correct
        ]);

        db.query(qSql, [values], () => {
            res.json({ message: "Test created ✅" });
        });
    });
});


// ======================
// GET TESTS (STUDENT)
// ======================

router.get('/', verifyToken, (req, res) => {

    const sql = `
        SELECT t.*
            FROM tests t
            WHERE t.batch_id IN (
                SELECT batch_id
                FROM enrollments
                WHERE student_id = ?
                AND status = 'Approved'
            )

            
    `;

    db.query(sql, [req.user.id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: err.message });
        }

        res.json(result);
    });
});


// ======================
// GET QUESTIONS (NO ANSWERS)
// ======================
router.get('/:id', verifyToken, (req, res) => {
    db.query(
        `SELECT id, question, option_a, option_b, option_c, option_d 
         FROM questions WHERE test_id=?`,
        [req.params.id],
        (err, result) => res.json(result)
    );
});


// ======================
// SUBMIT TEST (ONCE)
// ======================
router.post('/submit', verifyToken, (req, res) => {
    const { testId, answers } = req.body;
    const studentId = req.user.id;

    // check already attempted
    db.query(
        `SELECT * FROM results WHERE student_id=? AND test_id=?`,
        [studentId, testId],
        (err, rows) => {

            if (rows.length > 0) {
                return res.status(400).json({ message: "Already attempted ❌" });
            }

            db.query(
                `SELECT id, correct_option FROM questions WHERE test_id=?`,
                [testId],
                (err, questions) => {

                    let score = 0;

                    questions.forEach(q => {
                        if (answers[q.id] === q.correct_option) {
                            score++;
                        }
                    });

                    db.query(
                        `INSERT INTO results (student_id, test_id, score, total)
                         VALUES (?, ?, ?, ?)`,
                        [studentId, testId, score, questions.length],
                        () => {
                            res.json({ message: "Submitted ✅", score });
                        }
                    );
                }
            );
        }
    );
});

module.exports = router;