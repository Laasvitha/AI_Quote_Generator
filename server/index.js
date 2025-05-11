const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const User = require("./models/User");
const Quote = require("./models/Quote");
const authUser = require("./middleware/authUser");

dotenv.config();
const app = express();
app.use(express.json());

const FRONTEND_ORIGIN = "https://ai-quote-generator-xi.vercel.app";

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true
}));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Default route
app.get("/", (req, res) => {
  res.send("🌍 AI Quote Generator API is running.");
});

// Generate quote (mock or AI)
app.post("/api/generate", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const quote = `Keep going!`; // Fallback if Hugging Face fails
    res.json({ quote });
  } catch (err) {
    res.status(500).json({ error: "Quote generation failed." });
  }
});

// Register user
app.post("/api/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "User already exists." });
    }
    const newUser = new User({ email, password });
    await newUser.save();
    const token = newUser.generateToken();
    res.json({ token });
  } catch {
    res.status(500).json({ message: "Registration failed." });
  }
});

// Login user
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = user.generateToken();
    res.json({ token });
  } catch {
    res.status(500).json({ message: "Login failed." });
  }
});

// Save quote
app.post("/api/save", authUser, async (req, res) => {
  try {
    const { text, category, language } = req.body;
    const quote = new Quote({ text, category, language, user: req.userId });
    await quote.save();
    res.json({ message: "✅ Quote saved!" });
  } catch {
    res.status(500).json({ message: "Save failed." });
  }
});

// Get user's quotes
app.get("/api/my-quotes", authUser, async (req, res) => {
  try {
    const quotes = await Quote.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(quotes);
  } catch {
    res.status(500).json({ message: "Couldn't load quotes." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌍 Server running at http://localhost:${PORT}`);
});
