import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, MapPin } from 'lucide-react'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [show, setShow] = useState(false)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const getDetailedError = (message) => {
        const errorMap = {
            'User not found': 'No account found with this email address. Please check your email or sign up.',
            'Invalid credentials': 'Incorrect password. Please try again or reset your password.',
            'Invalid email or password': 'The email or password you entered is incorrect. Please try again.',
            'Login failed': 'Unable to sign in. Please check your credentials and try again.',
            'Network error': 'Connection failed. Please check your internet connection and try again.'
        }
        return errorMap[message] || message
    }

    async function handle(e) {
        e.preventDefault()
        setError('')
        setLoading(true)
        
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            const data = await res.json()
            
            if (!res.ok) {
                setError(getDetailedError(data.message || 'Login failed'))
                setLoading(false)
                return
            }
            
            localStorage.setItem('token', data.token)
            
            // Slight delay for better UX
            setTimeout(() => {
                navigate('/profile')
            }, 500)
        } catch (err) {
            setError(getDetailedError('Network error'))
            setLoading(false)
        }
    }

    return (
        <div className="auth-shell">
            <form className="auth-card" onSubmit={handle}>
                <MapPin className="auth-card-icon" size={40} />
                
                <h2 className="title">Sign in to Continue</h2>
                <p className="subtitle">Navigate back to your exam preparation journey</p>
                
                {error && <div className="error">{error}</div>}

                <div className="field">
                    <label htmlFor="email" className="field-label">Email</label>
                    <div className="field-input-wrapper">
                        <Mail size={18} className="field-icon" />
                        <input 
                            id="email" 
                            type="email" 
                            placeholder="Enter your email"
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            required 
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="field">
                    <label htmlFor="password" className="field-label">Password</label>
                    <div className="field-input-wrapper">
                        <Lock size={18} className="field-icon" />
                        <input 
                            id="password" 
                            type={show ? 'text' : 'password'} 
                            placeholder="Enter your password"
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            required 
                            disabled={loading}
                        />
                        <button 
                            type="button" 
                            className="show-btn" 
                            onClick={() => setShow(s => !s)} 
                            aria-label="Toggle password visibility"
                            disabled={loading}
                        >
                            {show ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <button className="submit" type="submit" disabled={loading}>
                    {loading ? (
                        <>
                            <span className="spinner"></span>
                            Signing in...
                        </>
                    ) : (
                        'Sign in'
                    )}
                </button>

                <div className="auth-footer">
                    Don't have an account? <Link to="/signup" className="auth-link">Create one</Link>
                </div>
            </form>
        </div>
    )
}