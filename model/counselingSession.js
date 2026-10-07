const mongoose = require('mongoose');
const { Schema } = mongoose;

const CounselingSessionSchema = new Schema({
  counselorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a Counselor model
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a Student model
    required: true
  },
  startDate: {
    type: Date,
    required: true,
    get: (value) => value.toISOString(), // Ensure the date is stored as UTC
  },
  endDate: {
    type: Date,
    required: true,
    get: (value) => value.toISOString(), // Ensure the date is stored as UTC
  }, 
  duration: {
    type: Number, // Duration in minutes
    required: true
  },
  createdAt: { 
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update the `updatedAt` field on save
CounselingSessionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('CounselingSession', CounselingSessionSchema);


