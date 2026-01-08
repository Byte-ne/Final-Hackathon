import React from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { Compass, Home, UserCircle, LogOut, MapPin, Newspaper } from 'lucide-react'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Feed from './pages/Feed'
import ProtectedRoute from './components/ProtectedRoute'

function Navigation() {
    const navigate = useNavigate()
    const isAuthenticated = !!localStorage.getItem('token')

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
                            <button
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