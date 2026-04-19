const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    let token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: "Token required ❌" });
    }

    // REMOVE "Bearer "
    if (token.startsWith("Bearer ")) {
        token = token.slice(7);
    }

    try {
        const decoded = jwt.verify(token, "SECRET_KEY");
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token ❌" });
    }
};

module.exports = verifyToken;