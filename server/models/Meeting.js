const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  organization: { type: String, default: '' },
  experience: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'beginner' },
  questions: { type: String, default: '' },
  userId: { type: String, required: true },
  registrationDate: { type: Date, default: Date.now }
});

const MeetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['webinar', 'qna', 'other'], default: 'qna' },
  date: { type: String, required: true }, // ISO date string
  time: { type: String, required: true }, // e.g., '14:00'
  language: { type: String, required: true },
  topics: [{ type: String }],
  expert: { type: String },
  joinUrl: { type: String },
  youtubeUrl: { type: String }, // YouTube recording URL
  attendees: [{ type: String }], // user ids or emails of registered users
  registrations: [RegistrationSchema], // detailed registration information
  duration: { type: String }, // e.g., '1h', '45m'
  archived: { type: Boolean, default: false },
  creator: { type: String, required: true }, // user id or email of creator
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Meeting', MeetingSchema); 