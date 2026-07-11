const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add your full name'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't return password by default
  },
  university: {
    type: String,
    required: [true, 'Please add your university name'],
    trim: true,
    maxlength: [200, 'University name cannot exceed 200 characters']
  },
  fieldOfStudy: {
    type: String,
    required: [true, 'Please add your field of study'],
    trim: true,
    maxlength: [100, 'Field of study cannot exceed 100 characters']
  },
  educationLevel: {
    type: String,
    required: [true, 'Please select your education level'],
    enum: ['High School', 'Bachelor\'s', 'Master\'s', 'PhD', 'Other']
  },
  profilePicture: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Match user password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// NOTE: no explicit email index here — `unique: true` on the email field
// already creates one; declaring both triggers a Mongoose duplicate-index warning.

module.exports = mongoose.model('User', userSchema);