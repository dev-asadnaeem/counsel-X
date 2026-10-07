const mongoose = require('mongoose');

const CallLogSchema = new mongoose.Schema({
  callerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  callType: {
    type: String,
    enum: ['video', 'voice'],
    required: true
  },
  status: {
    type: String,
    enum: ['initiated', 'accepted', 'rejected', 'missed', 'ended'],
    default: 'initiated'
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  durationSeconds: {
    type: Number,
    default: 0
  },
  relatedSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CounselingSession'
  }
}, { timestamps: true });

module.exports = mongoose.model('CallLog', CallLogSchema);
