const GROQ_KEY = process.env.GROQ_API_KEY

// ensure `fetch` is available
let fetchFn = global.fetch
if (!fetchFn) {
    try {
        fetchFn = (...args) => import('node-fetch').then(m => m.default(...args))
        global.fetch = fetchFn
    } catch (e) {
        console.warn('node-fetch not available; moderation network calls may fail')
    }
}

async function analyzeGroqResponse(json) {
    // Recursive inspector to find flags, labeled categories or high scores
    const badLabels = ['sexual', 'porn', 'hentai', 'violence', 'abuse', 'hate', 'harassment']
    let flagged = false
    let details = []

    function walk(obj, path = '') {
        if (flagged) return
        if (obj && typeof obj === 'object') {
            if (Array.isArray(obj)) {
                for (let i = 0; i < obj.length; i++) walk(obj[i], `${path}[${i}]`)
                return
            }
            // check for common moderation signals
            if (typeof obj.flagged === 'boolean' && obj.flagged) {
                flagged = true; details.push(path + '.flagged'); return
            }
            // check for label/className + score/probability
            const keys = Object.keys(obj)
            const lowerKeys = keys.map(k => k.toLowerCase())
            if ((lowerKeys.includes('label') || lowerKeys.includes('classname') || lowerKeys.includes('classname'))
                && (lowerKeys.includes('score') || lowerKeys.includes('probability') || lowerKeys.includes('confidence'))) {
                const label = obj.label || obj.className || obj.ClassName || obj.classname || ''
                const score = parseFloat(obj.score || obj.probability || obj.confidence || 0)
                const ll = ('' + label).toLowerCase()
                for (const b of badLabels) if (ll.includes(b) && score > 0.65) { flagged = true; details.push(`${path}:${label}@${score}`); return }
            }
            // check for category objects
            if (obj.categories && Array.isArray(obj.categories)) {
                for (const c of obj.categories) {
                    const cname = (c.name || c.label || '') + ''
                    const prob = parseFloat(c.probability || c.score || 0)
                    for (const b of badLabels) if (('' + cname).toLowerCase().includes(b) && prob > 0.65) { flagged = true; details.push(`${path}.categories:${cname}@${prob}`); return }
                }
            }
            // descend
            for (const k of keys) walk(obj[k], path ? `${path}.${k}` : k)
        } else if (typeof obj === 'string') {
            const s = obj.toLowerCase()
            for (const b of badLabels) if (s.includes(b)) { flagged = true; details.push(`${path}:contains(${b})`); return }
        }
    }

    try { walk(json) } catch (e) { /* best-effort */ }
    return { flagged, details }
}

async function moderateText(content) {
    if (!content || typeof content !== 'string') return { ok: true }
    // Try Groq API if key provided
    if (GROQ_KEY) {
        try {
            const res = await fetch('https://api.groq.ai/v1/moderations', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: content })
            })
            if (res.ok) {
                const j = await res.json()
                const analysis = await analyzeGroqResponse(j)
                if (analysis.flagged) return { ok: false, reason: 'Text flagged by moderation', details: analysis.details }
            }
        } catch (e) {
            console.warn('Groq moderation failed:', e.message || e)
        }
    }

    // Fallback simple profanity check
    const bad = ['fuck', 'shit', 'bitch', 'porn', 'rape']
    const low = content.toLowerCase()
    for (const w of bad) if (low.includes(w)) return { ok: false, reason: 'Text contains disallowed words' }
    return { ok: true }
}

async function moderateImages(mediaArray) {
    if (!mediaArray || !Array.isArray(mediaArray) || mediaArray.length === 0) return { ok: true }
    try {
        let nsfwModel = global.nsfwModel
        if (!nsfwModel) {
            const tf = require('@tensorflow/tfjs-node')
            const nsfw = require('nsfwjs')
            nsfwModel = await nsfw.load()
            global.nsfwModel = nsfwModel
        }
        const tf = require('@tensorflow/tfjs-node')
        for (const m of mediaArray) {
            try {
                let buffer = null
                if (typeof m === 'string' && m.startsWith('data:')) {
                    const parts = m.split(',')
                    const b = parts[1]
                    buffer = Buffer.from(b, 'base64')
                } else if (typeof m === 'string' && (m.startsWith('http://') || m.startsWith('https://'))) {
                    const r = await fetch(m)
                    const ab = await r.arrayBuffer()
                    buffer = Buffer.from(ab)
                }
                if (!buffer) continue
                const image = tf.node.decodeImage(buffer, 3)
                const predictions = await nsfwModel.classify(image)
                image.dispose()
                for (const p of predictions) {
                    if ((p.className.toLowerCase().includes('porn') || p.className.toLowerCase().includes('hentai') || p.className.toLowerCase().includes('sexual')) && p.probability > 0.7) {
                        return { ok: false, reason: 'Image flagged as NSFW' }
                    }
                }
            } catch (e) {
                console.warn('Image moderation error:', e.message || e)
            }
        }
        return { ok: true }
    } catch (e) {
        console.warn('NSFW model unavailable (optional). Install @tensorflow/tfjs-node and nsfwjs to enable image moderation.')
        return { ok: true }
    }
}

module.exports = { moderateText, moderateImages }
