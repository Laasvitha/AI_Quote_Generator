require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const Quote = require('./models/Quote');
const User = require('./models/User');
const authUser = require('./middleware/authUser');
const authAdmin = require('./middleware/authAdmin');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// 🔐 Register
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name)
    return res.status(400).json({ error: "All fields required" });

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashed });
    res.json({ message: "✅ Registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// 🔑 Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, name: user.name, role: user.role });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// 🤖 AI Quote Generation with fallback
const fallbackQuotes = [
  "Code is like humor. When you have to explain it, it’s bad.",
  "Simplicity is the soul of efficiency.",
  "Programs must be written for people to read.",
  "First, solve the problem. Then, write the code.",
  "Clean code always looks like it was written by someone who cares.",
  "Any fool can write code a computer can understand. Good programmers write code humans can understand.",
  "Experience is the name everyone gives to their mistakes.",
  "In order to be irreplaceable, one must always be different.",
  "Talk is cheap. Show me the code.",
  "The best error message is the one that never shows up.",
  "Make it work, make it right, make it fast.",
  "Good code is its own best documentation.",
  "The code you write makes you a programmer. The code you delete makes you a good one.",
  "Software is a great combination between artistry and engineering.",
  "It works on my machine.",
  "Debugging is like being the detective in a crime movie where you are also the murderer.",
  "The most disastrous thing you can ever learn is your first programming language.",
  "There are two ways to write error-free programs; only the third one works.",
  "Before software can be reusable it first has to be usable.",
  "A good programmer is someone who always looks both ways before crossing a one-way street."
];

app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required' });

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct',
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_TOKEN}`
        }
      }
    );

    const output = response.data;
    console.log("✅ HF Response:", JSON.stringify(output, null, 2));
    const generated = output?.[0]?.generated_text || output.generated_text || fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    res.json({ quote: generated });
  } catch (err) {
    console.error("❌ HF API Error:", err.response?.data || err.message);
    const fallback = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    res.json({ quote: fallback });
  }
});

// 💾 Save Quote
app.post('/api/save', authUser, async (req, res) => {
  const { text, category, language } = req.body;
  if (!text) return res.status(400).json({ error: 'Quote text is required' });

  try {
    const newQuote = new Quote({ text, category, language, user: req.user.userId });
    await newQuote.save();
    res.json({ message: '✅ Quote saved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save quote' });
  }
});

// 📜 My Quotes
app.get('/api/my-quotes', authUser, async (req, res) => {
  try {
    const quotes = await Quote.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: 'Fetch error' });
  }
});

// 👤 My Profile
app.get('/api/my-profile', authUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("name email");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// 🛡️ Admin: All Quotes
app.get('/api/admin/quotes', authAdmin, async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: 'Admin fetch failed' });
  }
});

// 🛠️ Admin: Update Quote
app.put('/api/admin/quote/:id', authAdmin, async (req, res) => {
  const { id } = req.params;
  const { text, category, language } = req.body;

  try {
    const updated = await Quote.findByIdAndUpdate(id, { text, category, language }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Quote not found' });
    res.json({ message: '✅ Quote updated', quote: updated });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

// 🗑️ Admin: Delete Quote
app.delete('/api/admin/quote/:id', authAdmin, async (req, res) => {
  try {
    const deleted = await Quote.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Quote not found' });
    res.json({ message: '🗑️ Quote deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

// 📊 Admin: Stats
app.get('/api/admin/stats', authAdmin, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const quoteCount = await Quote.countDocuments();

    const quotesByDay = await Quote.aggregate([
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const usersByDay = await User.aggregate([
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({ userCount, quoteCount, quotesByDay, usersByDay });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// 🚀 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌍 Server running at http://localhost:${PORT}`));
