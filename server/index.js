import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const JWT_SECRET = process.env.JWT_SECRET || 'pettycare-dev-secret-change-in-production'

const db = new Database(join(__dirname, 'data.db'))
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )
`)

const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

// ── Sign Up ──
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password || password.length < 6) {
      return res.status(400).json({ error: 'Invalid email or password (min 6 chars)' })
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' })
    }

    const hash = await bcrypt.hash(password, 10)
    const id = crypto.randomUUID()
    db.prepare('INSERT INTO users (id, email, password) VALUES (?, ?, ?)').run(id, email, hash)

    const token = jwt.sign({ userId: id, email }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id, email } })
  } catch (err) {
    console.error('Signup error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ── Sign In ──
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, email: user.email } })
  } catch (err) {
    console.error('Signin error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ── Me (validate token) ──
app.get('/api/auth/me', (req, res) => {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token' })
  }
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET)
    res.json({ user: { id: payload.userId, email: payload.email } })
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, '0.0.0.0', () => {
  console.log(`PettyCare API server running on http://0.0.0.0:${PORT}`)
})
