const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    profilePic: { type: String, default: '' }, // data URL or image URL
    bio: { type: String, default: '' },
    goal: { type: String, default: '' },
    studyBuddies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    posts: [{ title: String, content: String, createdAt: Date }],
    examTargets: [{ exam: String, targetDate: Date, notes: String }],
    milestones: [{ title: String, description: String, date: Date }],
    createdAt: { type: Date, default: Date.now }
})

// Use the existing `students` collection if you want to integrate with Atlas data
module.exports = mongoose.model('User', UserSchema, 'students')
