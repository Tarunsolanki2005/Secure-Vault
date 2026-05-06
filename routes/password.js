const User = require("../models/User"); 
const auth = require("../middleware/verifyToken");
const express = require("express");
const Password = require("../models/Password");
const { encrypt, decrypt } = require("../utils/encryption");

const router = express.Router();

//Add password
router.post("/add", auth, async (req, res) => {
    const { website, username, password } = req.body;

    const user = await User.findById(req.userId);
    const encryptedPassword = encrypt(password, user.encryptionKey);

    const newPass = new Password({
        userId: req.userId,   // ✅ from token
        website,
        username,
        password: encryptedPassword
    });

    await newPass.save();

    res.json({ message: "Password saved 🔐" });
});

// GET PASSWORDS
router.get("/", auth, async (req, res) => {
    const data = await Password.find({ userId: req.userId });
    const user = await User.findById(req.userId);

    const result = data.map(item => ({
        _id: item._id,
        website: item.website,
        username: item.username,
        password: decrypt(item.password, user.encryptionKey)
    }));

    res.json(result);
});


// DELETE PASSWORD ✅ (NEW)
router.delete("/:id", auth, async (req, res) => {
    try {
        await Password.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted successfully 🗑️" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.put("/:id", auth, async (req, res) => {
    try {
        const { website, username, password } = req.body;

        const user = await User.findById(req.userId);
        const encryptedPassword = encrypt(password, user.encryptionKey);

        await Password.findByIdAndUpdate(req.params.id, {
            website,
            username,
            password: encryptedPassword
        });

        res.json({ message: "Updated successfully ✏️" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ✏️ UPDATE PASSWORD
// ✏️ UPDATE PASSWORD
router.put("/:id", auth, async (req, res) => {
    try {
        const { website, username, password } = req.body;

        const user = await User.findById(req.userId);
        const encryptedPassword = encrypt(password, user.encryptionKey);

        await Password.findByIdAndUpdate(req.params.id, {
            website,
            username,
            password: encryptedPassword
        });

        res.json({ message: "Updated successfully ✏️" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Update failed" });
    }
});

module.exports = router;    