const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/exam-compass'
// Mongoose 7+ no longer needs or supports useNewUrlParser/useUnifiedTopology options.
mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err))

// Auth routes
app.use('/api/auth', require('./routes/auth'))
// Posts / feed
app.use('/api/posts', require('./routes/posts'))

app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from server' })
})

app.listen(port, () => {
    console.log(`Server listening on ${port}`)
})
