const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotificationSchema = new Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['meeting_booked', 'meeting_reminder', 'meeting_start', 'meeting_nearing_end', 'meeting_end', 'system_update'],
    required: true
  },
  relatedSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CounselingSession'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);
