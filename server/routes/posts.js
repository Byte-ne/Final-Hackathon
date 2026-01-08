const express = require('express')
const router = express.Router()
const Post = require('../models/Post')
const User = require('../models/User')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret'

function getUserIdFromHeader(req) {
    const auth = req.headers.authorization
    if (!auth) return null
    const parts = auth.split(' ')
    if (parts.length !== 2) return null
    try { return jwt.verify(parts[1], JWT_SECRET).id } catch (e) { return null }
}

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
        const post = new Post({ author: userId, title, content, media, isVideo })
        await post.save()
        const p = await Post.findById(post._id).populate('author', 'name profilePic')
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
        post.comments.push({ author: userId, text: req.body.text })
        await post.save()
        const populated = await Post.findById(post._id).populate('comments.author', 'name profilePic')
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
        res.json({ message: 'Request sent' })
    } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }) }
})

module.exports = router
