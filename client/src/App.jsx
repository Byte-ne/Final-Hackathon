import React from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { Compass, Home, UserCircle, LogOut, MapPin, Newspaper, Bell } from 'lucide-react'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Feed from './pages/Feed'
import ProtectedRoute from './components/ProtectedRoute'

function Navigation() {
    const navigate = useNavigate()
    const isAuthenticated = !!localStorage.getItem('token')
    const [notifications, setNotifications] = React.useState([])
    const [unread, setUnread] = React.useState(0)
    const [showNotif, setShowNotif] = React.useState(false)

    async function fetchNotifications() {
        try {
            const token = localStorage.getItem('token')
            if (!token) return
            const res = await fetch('http://localhost:5000/api/auth/notifications', { headers: { Authorization: `Bearer ${token}` } })
            const data = await res.json()
            setNotifications(Array.isArray(data) ? data : [])
            setUnread((Array.isArray(data) ? data : []).filter(n => !n.read).length)
        } catch (e) { }
    }

    React.useEffect(() => {
        if (isAuthenticated) fetchNotifications()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated])

    async function markRead(id) {
        try {
            const token = localStorage.getItem('token')
            await fetch('http://localhost:5000/api/auth/notifications/mark-read', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id }) })
            fetchNotifications()
        } catch (e) { }
    }

    async function markAll() {
        try {
            const token = localStorage.getItem('token')
            await fetch('http://localhost:5000/api/auth/notifications/mark-all', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
            fetchNotifications()
        } catch (e) { }
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/login')
    }

    return (
        <nav className="nav-bar">
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                    <Compass size={24} />
                    Exam Compass
                </Link>

                <div className="nav-links">
                    {isAuthenticated ? (
                        <>
                            <Link to="/" className="nav-link">
                                <Home size={16} />
                                Home
                            </Link>
                            <Link to="/feed" className="nav-link">
                                <Newspaper size={16} />
                                Feed
                            </Link>
                            <Link to="/profile" className="nav-link">
                                <UserCircle size={16} />
                                Profile
                            </Link>
                            <div style={{ position: 'relative' }}>
                                <button type="button" className="nav-link" onClick={() => { setShowNotif(s => !s); if (!showNotif) fetchNotifications() }} style={{ position: 'relative' }}>
                                    <Bell size={16} />
                                    Notifications
                                    {unread > 0 && <span className="notif-badge">{unread}</span>}
                                </button>
                                {showNotif && (
                                    <div className="notif-dropdown">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid var(--border-light)' }}>
                                            <strong>Notifications</strong>
                                            <button type="button" onClick={markAll} style={{ background: 'transparent', border: 'none', color: 'var(--primary-blue)', cursor: 'pointer' }}>Mark all read</button>
                                        </div>
                                        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                                            {notifications.length === 0 && <div style={{ padding: 12, color: 'var(--text-secondary)' }}>No notifications</div>}
                                            {notifications.map((n) => (
                                                <div key={n._id} className="notif-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ padding: 10 }}>
                                                        <div style={{ fontWeight: 600 }}>{n.type.replace('_', ' ')}</div>
                                                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{n.text}</div>
                                                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{new Date(n.createdAt).toLocaleString()}</div>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 8 }}>
                                                        {!n.read && <button type="button" onClick={() => markRead(n._id)} style={{ padding: '6px 8px', borderRadius: 8, background: 'var(--primary-blue)', color: '#fff', border: 'none' }}>Mark read</button>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="nav-link"
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                            >
                                <LogOut size={16} />
                                Sign out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">
                                <MapPin size={16} />
                                Sign in
                            </Link>
                            <Link to="/signup" className="nav-link primary">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}

function HomePage() {
    const isAuthenticated = !!localStorage.getItem('token')

    return (
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '60px 24px',
            textAlign: 'center'
        }}>
            <div style={{ marginBottom: '40px' }}>
                <div style={{
                    display: 'inline-flex',
                    padding: '40px',
                    background: 'linear-gradient(135deg, #E8F0FE, #FFFFFF)',
                    borderRadius: '20px',
                    marginBottom: '24px'
                }}>
                    <Compass size={80} style={{ color: 'var(--primary-blue)' }} />
                </div>
                <h1 style={{
                    fontSize: '48px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '16px'
                }}>
                    Exam Compass
                </h1>
                <p style={{
                    fontSize: '20px',
                    color: 'var(--text-secondary)',
                    maxWidth: '600px',
                    margin: '0 auto'
                }}>
                    Navigate your exam preparation journey with precision and confidence.
                    Chart your path to success with our comprehensive study tools.
                </p>
            </div>

            {!isAuthenticated && (
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '32px' }}>
                    <Link
                        to="/signup"
                        style={{
                            padding: '14px 32px',
                            background: 'var(--primary-blue)',
                            color: 'white',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: '500',
                            fontSize: '16px',
                            boxShadow: 'var(--shadow-sm)',
                            transition: 'all 0.2s'
                        }}
                    >
                        Get Started
                    </Link>
                    <Link
                        to="/login"
                        style={{
                            padding: '14px 32px',
                            background: 'white',
                            color: 'var(--primary-blue)',
                            border: '2px solid var(--primary-blue)',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: '500',
                            fontSize: '16px',
                            transition: 'all 0.2s'
                        }}
                    >
                        Sign In
                    </Link>
                </div>
            )}
        </div>
    )
}

export default function App() {
    return (
        <BrowserRouter>
            <div className="app">
                <Navigation />

                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>
        </BrowserRouter>
    )
}