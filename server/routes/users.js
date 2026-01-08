const express = require('express')
const router = express.Router()
const User = require('../models/User')

// GET /api/users/search?q=term
router.get('/search', async (req, res) => {
    try {
        const q = (req.query.q || '').trim()
        if (!q) return res.json([])
        // If q looks like an ObjectId, search by id as well
        const idMatch = /^[0-9a-fA-F]{24}$/.test(q)
        const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, ''), 'i')
        const query = idMatch ? { $or: [{ _id: q }, { name: regex }, { email: regex }, { username: regex }] } : { $or: [{ name: regex }, { email: regex }, { username: regex }] }
        const users = await User.find(query).limit(20).select('_id name email username profilePic')
        res.json(users)
    } catch (e) {
        console.error(e)
        res.status(500).json({ message: 'Server error' })
    }
})

module.exports = router
