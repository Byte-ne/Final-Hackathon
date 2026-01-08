const express = require('express')
const router = express.Router()
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret'

function getUserIdFromHeader(req) {
    const auth = req.headers.authorization
    if (!auth) return null
    const parts = auth.split(' ')
    if (parts.length !== 2) return null
    const token = parts[1]
    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        return decoded.id
    } catch (e) {
        return null
    }
}

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body
        if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' })

        const existing = await User.findOne({ email })
        if (existing) return res.status(400).json({ message: 'Email already registered' })

        const salt = await bcrypt.genSalt(10)
        const passwordHash = await bcrypt.hash(password, salt)

        const user = new User({ name, email, passwordHash })
        await user.save()

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
        res.json({ token })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
})

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) return res.status(400).json({ message: 'Missing fields' })

        const user = await User.findOne({ email })
        if (!user) return res.status(400).json({ message: 'Invalid credentials' })

        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid) return res.status(400).json({ message: 'Invalid credentials' })

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
        res.json({ token })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
})

// Get current user
router.get('/me', async (req, res) => {
    try {
        const userId = getUserIdFromHeader(req)
        if (!userId) return res.status(401).json({ message: 'Invalid token' })

        const user = await User.findById(userId).select('-passwordHash')
        if (!user) return res.status(404).json({ message: 'User not found' })
        res.json(user)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
})

// Update profile (name, bio, goal, profilePic)
router.put('/me', async (req, res) => {
    try {
        const userId = getUserIdFromHeader(req)
        if (!userId) return res.status(401).json({ message: 'Invalid token' })

        const { name, bio, goal, profilePic } = req.body
        const update = {}
        if (name) update.name = name
        if (bio !== undefined) update.bio = bio
        if (goal !== undefined) update.goal = goal
        if (profilePic !== undefined) update.profilePic = profilePic

        const user = await User.findByIdAndUpdate(userId, { $set: update }, { new: true }).select('-passwordHash')
        if (!user) return res.status(404).json({ message: 'User not found' })
        res.json(user)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
})

// Change password: requires currentPassword and newPassword
router.post('/change-password', async (req, res) => {
    try {
        const userId = getUserIdFromHeader(req)
        if (!userId) return res.status(401).json({ message: 'Invalid token' })

        const { currentPassword, newPassword } = req.body
        if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Missing fields' })

        const user = await User.findById(userId)
        if (!user) return res.status(404).json({ message: 'User not found' })

        const valid = await bcrypt.compare(currentPassword, user.passwordHash)
        if (!valid) return res.status(400).json({ message: 'Current password incorrect' })

        const salt = await bcrypt.genSalt(10)
        user.passwordHash = await bcrypt.hash(newPassword, salt)
        await user.save()
        res.json({ message: 'Password changed' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
})

module.exports = router
