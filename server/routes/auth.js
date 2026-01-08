const express = require('express')
const router = express.Router()
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { moderateText } = require('../utils/moderation')

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
        const { name, email, password, username, age } = req.body
        if (!name || !email || !password || !username || age === undefined) return res.status(400).json({ message: 'Missing fields' })

        // basic age check (platform minimum age 13)
        const ageNum = parseInt(age, 10)
        if (isNaN(ageNum) || ageNum < 13) return res.status(400).json({ message: 'You must be 13 or older to register' })

        // normalize username and ensure it's not the same as email
        const normalizedUsername = ('' + username).trim().toLowerCase()
        if (normalizedUsername === ('' + email).trim().toLowerCase()) return res.status(400).json({ message: 'Username cannot be the same as email' })

        const existingEmail = await User.findOne({ email })
        if (existingEmail) return res.status(400).json({ message: 'Email already registered' })
        const existingUsername = await User.findOne({ username: normalizedUsername })
        if (existingUsername) return res.status(400).json({ message: 'Username already taken' })

        const salt = await bcrypt.genSalt(10)
        const passwordHash = await bcrypt.hash(password, salt)

        const user = new User({ name, email, passwordHash, username: normalizedUsername, age: ageNum })
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
        if (bio !== undefined) {
            const check = await moderateText(bio || '')
            if (!check.ok) return res.status(400).json({ message: check.reason || 'Bio not allowed' })
            update.bio = bio
        }
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

// Add a study buddy (send or accept buddy relationship)
router.post('/add-buddy', async (req, res) => {
    try {
        const userId = getUserIdFromHeader(req)
        if (!userId) return res.status(401).json({ message: 'Invalid token' })
        const { buddyId } = req.body
        if (!buddyId) return res.status(400).json({ message: 'Missing buddyId' })
        const me = await User.findById(userId)
        const other = await User.findById(buddyId)
        if (!other) return res.status(404).json({ message: 'User not found' })
        // create a buddy request notification for the other user
        other.notifications = other.notifications || []
        other.notifications.push({ type: 'buddy_request', text: `${me.name || 'Someone'} sent you a buddy request`, from: me._id })
        await other.save()

        // emit notification via socket.io (best-effort)
        try { req.app.get('io')?.emit('notification:received', { to: other._id.toString(), type: 'buddy_request', from: { id: me._id, name: me.name } }) } catch (e) { }

        res.json({ message: 'Buddy request sent' })
    } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }) }
})

// Respond to buddy request: { buddyId, action: 'accept'|'reject' }
router.post('/respond-buddy', async (req, res) => {
    try {
        const userId = getUserIdFromHeader(req)
        if (!userId) return res.status(401).json({ message: 'Invalid token' })
        const { buddyId, action } = req.body
        if (!buddyId || !action) return res.status(400).json({ message: 'Missing fields' })
        const me = await User.findById(userId)
        const other = await User.findById(buddyId)
        if (!other) return res.status(404).json({ message: 'User not found' })

        if (action === 'accept') {
            if (!me.studyBuddies.includes(buddyId)) { me.studyBuddies.push(buddyId) }
            if (!other.studyBuddies.includes(userId)) { other.studyBuddies.push(userId) }
            await me.save(); await other.save()
            // notify requester
            other.notifications = other.notifications || []
            other.notifications.push({ type: 'buddy_accepted', text: `${me.name || 'Someone'} accepted your buddy request`, from: me._id })
            await other.save()
            try { req.app.get('io')?.emit('notification:received', { to: other._id.toString(), type: 'buddy_accepted', from: { id: me._id, name: me.name } }) } catch (e) { }
            return res.json({ message: 'Buddy request accepted' })
        }

        if (action === 'reject') {
            // optional: record rejection
            other.notifications = other.notifications || []
            other.notifications.push({ type: 'buddy_rejected', text: `${me.name || 'Someone'} rejected your buddy request`, from: me._id })
            await other.save()
            try { req.app.get('io')?.emit('notification:received', { to: other._id.toString(), type: 'buddy_rejected', from: { id: me._id, name: me.name } }) } catch (e) { }
            return res.json({ message: 'Buddy request rejected' })
        }

        res.status(400).json({ message: 'Unknown action' })
    } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }) }
})

// Get notifications for current user
router.get('/notifications', async (req, res) => {
    try {
        const userId = getUserIdFromHeader(req)
        if (!userId) return res.status(401).json({ message: 'Invalid token' })
        const me = await User.findById(userId).select('notifications').populate('notifications.from', 'name profilePic')
        res.json(me.notifications || [])
    } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }) }
})

// Mark a single notification read: { id }
router.post('/notifications/mark-read', async (req, res) => {
    try {
        const userId = getUserIdFromHeader(req)
        if (!userId) return res.status(401).json({ message: 'Invalid token' })
        const { id } = req.body
        if (!id) return res.status(400).json({ message: 'Missing id' })
        const me = await User.findById(userId)
        if (!me) return res.status(404).json({ message: 'User not found' })
        const item = me.notifications.id(id)
        if (!item) return res.status(404).json({ message: 'Notification not found' })
        item.read = true
        await me.save()
        res.json({ message: 'Marked read' })
    } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }) }
})

// Mark all notifications read
router.post('/notifications/mark-all', async (req, res) => {
    try {
        const userId = getUserIdFromHeader(req)
        if (!userId) return res.status(401).json({ message: 'Invalid token' })
        const me = await User.findById(userId)
        if (!me) return res.status(404).json({ message: 'User not found' })
            (me.notifications || []).forEach(n => n.read = true)
        await me.save()
        res.json({ message: 'All marked read' })
    } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }) }
})

module.exports = router
