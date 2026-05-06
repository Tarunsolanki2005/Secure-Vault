const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;
console.log("JWT SECRET:", process.env.JWT_SECRET);  // 👈 ADD HERE
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();
const crypto = require("crypto");

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        const encryptionKey = crypto.randomBytes(32).toString("hex");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            password: hashedPassword,
            encryptionKey
        });

        await newUser.save();

        res.json({ message: "User registered successfully ✅" });

    } catch (error) {
        console.log("ERROR:", error);
        res.status(500).json({ error: error.message });
    }
});


// 🔐 LOGIN (JWT VERSION)
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ message: "User not found ❌" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Wrong password ❌" });
        }

        // ✅ CREATE TOKEN
        const token = jwt.sign(
            { userId: user._id },
            SECRET,
            { expiresIn: "1d" }
        );

        // ✅ SEND TOKEN (NOT userId)
        res.json({
            message: "Login successful ✅",
            token
        });

    } catch (error) {
        console.log("LOGIN ERROR:", error);
        res.status(500).json({ error: error.message });
    }
});
module.exports = router;