const express = require('express')
const router = express.Router()
const Post = require('../models/Post')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const fs = require('fs')

// ensure `fetch` is available (node 18+ has global fetch)
let fetchFn = global.fetch
if (!fetchFn) {
    try {
        fetchFn = (...args) => import('node-fetch').then(m => m.default(...args))
        global.fetch = fetchFn
    } catch (e) {
        console.warn('node-fetch not available; moderation network calls may fail')
    }
}

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret'

function getUserIdFromHeader(req) {
    const auth = req.headers.authorization
    if (!auth) return null
    const parts = auth.split(' ')
    if (parts.length !== 2) return null
    try { return jwt.verify(parts[1], JWT_SECRET).id } catch (e) { return null }
}

const { moderateText, moderateImages } = require('../utils/moderation')

// Get feed
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate('author', 'name profilePic')
        res.json(posts)
    } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }) }
})

// Create post
router.post('/', async (req, res) => {
    try {
        const userId = getUserIdFromHeader(req)
        if (!userId) return res.status(401).json({ message: 'Unauthorized' })
        const { title, content, media, isVideo } = req.body
        // Run moderation checks
        const tcheck = await moderateText(content)
        if (!tcheck.ok) return res.status(400).json({ message: tcheck.reason || 'Content not allowed' })
        const icheck = await moderateImages(Array.isArray(media) ? media : [])
        if (!icheck.ok) return res.status(400).json({ message: icheck.reason || 'Image content not allowed' })
        // extract hashtags from content
        const tags = (content && typeof content === 'string') ? (content.match(/#(\w+)/g) || []).map(t => t.replace('#', '').toLowerCase()) : []
        const post = new Post({ author: userId, title, content, tags, media, isVideo })
        await post.save()
        const p = await Post.findById(post._id).populate('author', 'name profilePic')
        // record a lightweight reference on the user's profile posts array
        try {
            const u = await User.findById(userId)
            if (u) {
                u.posts = u.posts || []
                u.posts.unshift({ title: post.title || '', content: post.content || '', createdAt: post.createdAt || new Date() })
                // keep recent posts array reasonable (e.g., last 50)
                if (u.posts.length > 50) u.posts = u.posts.slice(0, 50)
                await u.save()
            }
        } catch (e) { console.warn('Failed to attach post to user profile', e.message || e) }
        try { req.app.get('io')?.emit('post:created', p) } catch (e) { }
        res.json(p)
    } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }) }
})

// Like/unlike
router.post('/:id/like', async (req, res) => {
    try {
        const userId = getUserIdFromHeader(req)
        if (!userId) return res.status(401).json({ message: 'Unauthorized' })
        const post = await Post.findById(req.params.id)
        if (!post) return res.status(404).json({ message: 'Not found' })
        const idx = post.likes.indexOf(userId)
        if (idx === -1) post.likes.push(userId)
        else post.likes.splice(idx, 1)
        await post.save()
        try { req.app.get('io')?.emit('post:liked', { id: post._id.toString(), likes: post.likes.length }) } catch (e) { }
        res.json({ likes: post.likes.length })
    } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }) }
})

// Comment
router.post('/:id/comment', async (req, res) => {
    try {
        const userId = getUserIdFromHeader(req)
        if (!userId) return res.status(401).json({ message: 'Unauthorized' })
        const post = await Post.findById(req.params.id)
        if (!post) return res.status(404).json({ message: 'Not found' })
        // moderate comment text
        const check = await moderateText(req.body.text || '')
        if (!check.ok) return res.status(400).json({ message: check.reason || 'Comment not allowed' })
        post.comments.push({ author: userId, text: req.body.text })
        await post.save()
        const populated = await Post.findById(post._id).populate('comments.author', 'name profilePic')
        try { req.app.get('io')?.emit('post:commented', { id: post._id.toString(), comments: populated.comments }) } catch (e) { }
        res.json(populated.comments)
    } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }) }
})

// Send study buddy request
router.post('/:id/study-request', async (req, res) => {
    try {
        const fromId = getUserIdFromHeader(req)
        if (!fromId) return res.status(401).json({ message: 'Unauthorized' })
        const post = await Post.findById(req.params.id)
        if (!post) return res.status(404).json({ message: 'Not found' })
        post.studyRequests.push({ from: fromId, status: 'pending' })
        await post.save()
        try { req.app.get('io')?.emit('post:study-request', { id: post._id.toString(), from: fromId.toString() }) } catch (e) { }
        res.json({ message: 'Request sent' })
    } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }) }
})

// Delete all posts (admin function)
router.delete('/all', async (req, res) => {
    try {
        const result = await Post.deleteMany({})
        res.json({
            message: 'All posts deleted successfully',
            deletedCount: result.deletedCount
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' })
    }
})

module.exports = router
