const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;

module.exports = function (req, res, next) {
    const authHeader = req.headers.authorization;

    console.log("AUTH HEADER:", authHeader); // ✅ DEBUG

    if (!authHeader) {
        return res.status(401).json({ message: "No token ❌" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Invalid token ❌" });
    }

    try {
        const decoded = jwt.verify(token, SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.log("JWT ERROR:", error.message); // optional debug
        res.status(401).json({ message: "Invalid token ❌" });
    }
};