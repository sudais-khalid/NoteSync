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
  // Detailed, sectioned study notes (topic sections composed by the NLP
  // pipeline; readable prose a student can study from directly)
  detailedNotes: [{
    heading: { type: String },
    body: { type: String }
  }],
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

  // Character-offset spans into `transcript`, for inline highlighting in the
  // annotated-manuscript UI. Kept alongside the plain `entities`/`topics`
  // string arrays above (which remain the simple version used for tag/stat filtering).
  entitySpans: [{
    text: { type: String },
    type: { type: String },
    start: { type: Number },
    end: { type: Number }
  }],
  keyTermSpans: [{
    text: { type: String },
    score: { type: Number },
    start: { type: Number },
    end: { type: Number }
  }],
  enrichment: {
    type: String,
    enum: ['gemini', 'none'],
    default: 'none'
  },

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