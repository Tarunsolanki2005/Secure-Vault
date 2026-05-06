const crypto = require("crypto");

const ALGORITHM = "aes-256-cbc";

// 🔐 Encrypt
function encrypt(text, key) {
    const hashedKey = crypto.createHash("sha256").update(key).digest();
    const iv = Buffer.alloc(16, 0);

    const cipher = crypto.createCipheriv(ALGORITHM, hashedKey, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    return encrypted;
}

// 🔓 Decrypt
function decrypt(text, key) {
    const hashedKey = crypto.createHash("sha256").update(key).digest();
    const iv = Buffer.alloc(16, 0);

    const decipher = crypto.createDecipheriv(ALGORITHM, hashedKey, iv);

    let decrypted = decipher.update(text, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
}

module.exports = { encrypt, decrypt };