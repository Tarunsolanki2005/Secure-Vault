const User = require("../models/User"); 
const auth = require("../middleware/verifyToken");
const express = require("express");
const Password = require("../models/Password");
const { encrypt, decrypt } = require("../utils/encryption");

const router = express.Router();

/* ================= ADD PASSWORD ================= */
router.post("/add", auth, async (req, res) => {
    try {
        const { website, username, password } = req.body;

        const user = await User.findById(req.userId);

        // 🔥 FIX: prevent crash
        if (!user) {
            return res.status(404).json({ message: "User not found ❌" });
        }

        const encryptedPassword = encrypt(password, user.encryptionKey);

        const newPass = new Password({
            userId: req.userId,
            website,
            username,
            password: encryptedPassword
        });

        await newPass.save();

        res.json({ message: "Password saved 🔐" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error ❌" });
    }
});


/* ================= GET PASSWORDS ================= */
router.get("/", auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        // 🔥 FIX
        if (!user) {
            return res.status(404).json({ message: "User not found ❌" });
        }

        const data = await Password.find({ userId: req.userId });

        const result = data.map(item => ({
            _id: item._id,
            website: item.website,
            username: item.username,
            password: decrypt(item.password, user.encryptionKey)
        }));

        res.json(result);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error ❌" });
    }
});


/* ================= DELETE ================= */
router.delete("/:id", auth, async (req, res) => {
    try {
        await Password.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted successfully 🗑️" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Delete failed ❌" });
    }
});


/* ================= UPDATE ================= */
router.put("/:id", auth, async (req, res) => {
    try {
        const { website, username, password } = req.body;

        const user = await User.findById(req.userId);

        // 🔥 FIX
        if (!user) {
            return res.status(404).json({ message: "User not found ❌" });
        }

        const encryptedPassword = encrypt(password, user.encryptionKey);

        await Password.findByIdAndUpdate(req.params.id, {
            website,
            username,
            password: encryptedPassword
        });

        res.json({ message: "Updated successfully ✏️" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Update failed ❌" });
    }
});

module.exports = router;