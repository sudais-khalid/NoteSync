const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a lecture title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  subject: {
    type: String,
    trim: true,
    maxlength: [100, 'Subject cannot be more than 100 characters']
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Engineering', 'Business', 'Arts', 'Languages', 'Other'],
    default: 'Other'
  },

  // Raw verbatim speech-to-text output (unprocessed)
  rawTranscript: {
    type: String,
    default: ''
  },

  // Cleaned / final transcript used for summarization
  transcript: {
    type: String,
    required: [true, 'Transcript is required']
  },

  // AI-generated notes
  summary: {
    type: String,
    required: [true, 'Summary is required']
  },
  keyPoints: [{
    type: String
  }],
  definitions: [{
    type: String
  }],
  examTopics: [{
    type: String
  }],

  // NLP-derived fields
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'critical', 'mixed'],
    default: 'neutral'
  },
  entities: [{
    type: String
  }],
  topics: [{
    type: String
  }],
  readabilityScore: {
    type: Number,
    default: null
  },
  flashcards: [{
    question: { type: String },
    answer: { type: String }
  }],

  duration: {
    type: Number, // Duration in seconds
    default: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster searches
lectureSchema.index({ title: 'text', subject: 'text', tags: 'text' });

module.exports = mongoose.model('Lecture', lectureSchema);