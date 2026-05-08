const express = require('express');
const cors = require('cors');

const app = express();
const db = require('./backend/db');
const authRoutes = require('./backend/routes/auth');

const verifyToken = require('./backend/middleware/authMiddleware');
const forgotRoutes = require("./backend/routes/forgotPassword");
const enrollmentRoutes = require('./backend/routes/enrollment');
const batchRoutes = require('./backend/routes/batch');
const resultsRoutes = require("./backend/routes/results");
const liveClassRoutes = require("./backend/routes/liveClass");


//app.use(cors());
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

app.use('/api', authRoutes);
app.use("/api/forgot", forgotRoutes);
//app.use('/api', enrollmentRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/materials', require('./backend/routes/materials'));
app.use('/uploads', express.static('uploads'));
app.use('/api/tests', require('./backend/routes/test'));
app.use('/api/assignments', require('./backend/routes/assignments'));
//app.use("/api/results", require("./backend/routes/results"));
app.use("/api/live-class", liveClassRoutes);
app.use('/api', authRoutes);

app.use("/api/results", resultsRoutes);

// Home route
app.get('/', (req, res) => {
    res.send('LMS Server Running 🚀');
});

// ✅ COLLEGES API (ONLY HERE)
app.get("/api/colleges", (req, res) => {
    const sql = `
        SELECT DISTINCT college FROM teachers WHERE college IS NOT NULL
        UNION
        SELECT DISTINCT college FROM students WHERE college IS NOT NULL
        UNION
        SELECT DISTINCT college FROM admins WHERE college IS NOT NULL
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "DB error" });
        }

        res.json(results);
    });
});

// Admin dashboard
app.get('/api/admin/dashboard', verifyToken, (req, res) => {
    res.json({
        message: "Welcome Admin 🎉",
        user: req.user
    });
});


// SINGLE LISTENER ONLY
app.listen(5000, () => {
    console.log('Server running on http://localhost:3000');
});