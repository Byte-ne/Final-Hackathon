const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
})

const PostSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, default: '' },
    content: { type: String, default: '' },
    tags: [{ type: String }],
    media: [{ type: String }], // URLs or data-URIs
    isVideo: { type: Boolean, default: false },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [CommentSchema],
    studyRequests: [{ from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' } }],
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Post', PostSchema)
