const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    default: 'motivational'
  },
  language: {
    type: String,
    default: 'en'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'  // reference to the user who created the quote
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Quote', quoteSchema);
