const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, default: '' },
    media: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
})

const GroupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [MessageSchema],
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Group', GroupSchema)
