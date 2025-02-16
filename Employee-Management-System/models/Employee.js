const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true,
  },
  designation: {
    type: String,
    required: true,
  },
  salary: {
    type: Number,
    required: true,
    min: 1000,
  },
  date_of_joining: {
    type: Date,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  employee_photo: {
    type: String,
    required: false, // Optional field to store file path or URL
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

// Automatically update `updated_at` whenever an employee document is modified
employeeSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.updated_at = Date.now();
  }
  next();
});

// Create and export the model
module.exports = mongoose.model('Employee', employeeSchema);
