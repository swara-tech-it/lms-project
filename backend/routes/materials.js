const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// 📦 STORAGE CONFIG
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

// ======================
// UPLOAD MATERIAL (TEACHER)
// ======================
router.post('/', verifyToken, upload.single('file'), (req, res) => {
    const { batchId, title } = req.body;
    const fileName = req.file.filename;

    const sql = `
        INSERT INTO materials (batch_id, title, file)
        VALUES (?, ?, ?)
    `;

    db.query(sql, [batchId, title, fileName], (err) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Upload failed" });
        }

        res.json({ message: "File uploaded ✅" });
    });
});


// ======================
// ✅ GET MATERIALS (ONLY ENROLLED STUDENTS)
// ======================
router.get('/', verifyToken, (req, res) => {
    const userId = req.user.id;

    const sql = `
        SELECT m.id, m.title, m.file, b.name AS batchName
        FROM materials m
        JOIN enrollments e ON m.batch_id = e.batch_id
        JOIN batches b ON m.batch_id = b.id
        WHERE e.student_id = ? AND e.status = 'Approved'
    `;

    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Error fetching materials" });
        }

        res.json(result);
    });
});


// ======================
// 🔐 SECURE DOWNLOAD
// ======================
router.get('/download/:id', verifyToken, (req, res) => {
    const materialId = req.params.id;
    const userId = req.user.id;

    const sql = `
        SELECT m.file 
        FROM materials m
        JOIN enrollments e ON m.batch_id = e.batch_id
        WHERE m.id = ? 
        AND e.student_id = ?
        AND e.status = 'Approved'
    `;

    db.query(sql, [materialId, userId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Download error" });
        }

        if (result.length === 0) {
            return res.status(403).json({ message: "Access denied ❌" });
        }

        const filePath = path.join(__dirname, '../../uploads', result[0].file);
        res.download(filePath);
    });
});

module.exports = router;