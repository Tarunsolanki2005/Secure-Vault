require("dotenv").config();
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const passwordRoutes = require("./routes/password");

dotenv.config();

const app = express();

//connect database here 
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

//routes
app.use("/api/auth", authRoutes);
app.use("/api/password", passwordRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("Server is running successfully 🚀");
});

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});