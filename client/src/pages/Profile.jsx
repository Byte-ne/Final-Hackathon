import React, { useEffect, useState } from 'react'
import { MapPin, Mail, Calendar, Award, User as UserIcon, Edit3, Camera, Lock, Target, Users, FileText, Save, X } from 'lucide-react'

export default function Profile() {
    const [user, setUser] = useState(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({ name: '', bio: '', goal: '', profilePic: '' })
    const [pwState, setPwState] = useState({ currentPassword: '', newPassword: '', message: '' })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        load()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function load() {
        setLoading(true)
        const token = localStorage.getItem('token')
        if (!token) {
            setError('Not logged in')
            setLoading(false)
            return
        }

        fetch('http://localhost:5000/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } })
            .then(r => r.json())
            .then(data => {
                if (data.message) setError(data.message)
                else {
                    setUser(data)
                    setForm({ name: data.name || '', bio: data.bio || '', goal: data.goal || '', profilePic: data.profilePic || '' })
                }
                setLoading(false)
            }).catch(() => { setError('Network error'); setLoading(false) })
    }

    async function saveProfile(e) {
        e && e.preventDefault()
        setSaving(true)
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('http://localhost:5000/api/auth/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(form)
            })
            const data = await res.json()
            if (!res.ok) setError(data.message || 'Update failed')
            else { setUser(data); setEditing(false); setError('') }
        } catch (err) { setError('Network error') }
        setSaving(false)
    }

    function onFileChange(e) {
        const file = e.target.files && e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => {
            setForm(prev => ({ ...prev, profilePic: reader.result }))
        }
        reader.readAsDataURL(file)
    }

    async function changePassword(e) {
        e.preventDefault()
        setPwState(prev => ({ ...prev, message: '' }))
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('http://localhost:5000/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ currentPassword: pwState.currentPassword, newPassword: pwState.newPassword })
            })
            const data = await res.json()
            if (!res.ok) setPwState(prev => ({ ...prev, message: data.message || 'Failed to change password' }))
            else setPwState({ currentPassword: '', newPassword: '', message: 'Password changed successfully!' })
        } catch (err) { setPwState(prev => ({ ...prev, message: 'Network error. Please try again.' })) }
    }

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: 'calc(100vh - 64px)',
                color: 'var(--text-secondary)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ 
                        margin: '0 auto 16px',
                        width: '40px',
                        height: '40px',
                        borderColor: 'var(--border-light)',
                        borderTopColor: 'var(--primary-blue)'
                    }}></div>
                    Loading your profile...
                </div>
            </div>
        )
    }

    if (error && !user) {
        return (
            <div style={{ maxWidth: '600px', margin: '60px auto', padding: '0 24px' }}>
                <div className="error">{error}</div>
            </div>
        )
    }

    if (!user) return null

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
            {/* Profile Header Card */}
            <div style={{
                background: 'var(--white)',
                borderRadius: 'var(--radius-xl)',
                padding: '32px',
                boxShadow: 'var(--shadow-md)',
                marginBottom: '24px'
            }}>
                <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {/* Avatar Section */}
                    <div style={{ textAlign: 'center' }}>
                        {form.profilePic ? (
                            <img 
                                src={form.profilePic} 
                                alt="Profile" 
                                style={{ 
                                    width: '120px', 
                                    height: '120px', 
                                    borderRadius: '50%', 
                                    objectFit: 'cover', 
                                    border: '4px solid var(--off-white)',
                                    boxShadow: 'var(--shadow-md)'
                                }} 
                            />
                        ) : (
                            <div style={{ 
                                width: '120px', 
                                height: '120px', 
                                borderRadius: '50%', 
                                background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-dark))', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                color: 'var(--white)', 
                                fontSize: '48px',
                                fontWeight: '600',
                                boxShadow: 'var(--shadow-md)'
                            }}>
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        {editing && (
                            <label style={{ 
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                marginTop: '12px',
                                padding: '6px 12px',
                                background: 'var(--off-white)',
                                color: 'var(--text-secondary)',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500',
                                transition: 'all var(--transition-fast)'
                            }}>
                                <input type="file" accept="image/*" onChange={onFileChange} style={{ display: 'none' }} />
                                <Camera size={14} />
                                Change Photo
                            </label>
                        )}
                    </div>

                    {/* Profile Info */}
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <h1 style={{ 
                                fontSize: '28px', 
                                fontWeight: '600',
                                color: 'var(--text-primary)',
                                margin: 0
                            }}>
                                {user.name}
                            </h1>
                            {!editing && (
                                <button 
                                    onClick={() => setEditing(true)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '8px 16px',
                                        background: 'var(--primary-blue)',
                                        color: 'var(--white)',
                                        border: 'none',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all var(--transition-fast)',
                                        boxShadow: 'var(--shadow-sm)'
                                    }}
                                >
                                    <Edit3 size={16} />
                                    Edit Profile
                                </button>
                            )}
                        </div>
                        
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px',
                            color: 'var(--text-secondary)',
                            fontSize: '14px',
                            marginBottom: '12px'
                        }}>
                            <Mail size={16} />
                            {user.email}
                        </div>

                        {user.goal && (
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px',
                                color: 'var(--text-secondary)',
                                fontSize: '14px',
                                marginBottom: '16px'
                            }}>
                                <Target size={16} />
                                <strong>Goal:</strong> {user.goal}
                            </div>
                        )}

                        {user.bio && (
                            <p style={{ 
                                color: 'var(--text-primary)',
                                fontSize: '15px',
                                lineHeight: '1.6',
                                marginBottom: '16px'
                            }}>
                                {user.bio}
                            </p>
                        )}

                        {/* Stats */}
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <div style={{ 
                                padding: '12px 16px', 
                                background: 'var(--off-white)', 
                                borderRadius: 'var(--radius-md)',
                                textAlign: 'center'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                    <Users size={16} style={{ color: 'var(--primary-blue)' }} />
                                    <span style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)' }}>
                                        {user.studyBuddies ? user.studyBuddies.length : 0}
                                    </span>
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Study Buddies</div>
                            </div>
                            
                            <div style={{ 
                                padding: '12px 16px', 
                                background: 'var(--off-white)', 
                                borderRadius: 'var(--radius-md)',
                                textAlign: 'center'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                    <FileText size={16} style={{ color: 'var(--accent-green)' }} />
                                    <span style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)' }}>
                                        {user.posts ? user.posts.length : 0}
                                    </span>
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Posts</div>
                            </div>
                            
                            <div style={{ 
                                padding: '12px 16px', 
                                background: 'var(--off-white)', 
                                borderRadius: 'var(--radius-md)',
                                textAlign: 'center'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                    <Target size={16} style={{ color: 'var(--warning)' }} />
                                    <span style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)' }}>
                                        {user.examTargets ? user.examTargets.length : 0}
                                    </span>
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Exam Targets</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                {editing && (
                    <form onSubmit={saveProfile} style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-light)' }}>
                        {error && <div className="error" style={{ marginBottom: '16px' }}>{error}</div>}
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500' }}>
                                    Full Name
                                </label>
                                <input 
                                    className="field"
                                    value={form.name} 
                                    onChange={e => setForm({ ...form, name: e.target.value })} 
                                    placeholder="Enter your name"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid var(--border-light)',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: '15px',
                                        outline: 'none',
                                        transition: 'all var(--transition-fast)'
                                    }}
                                />
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500' }}>
                                    Goal
                                </label>
                                <input 
                                    value={form.goal} 
                                    onChange={e => setForm({ ...form, goal: e.target.value })} 
                                    placeholder="e.g., JEE 2026, NEET 2025"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid var(--border-light)',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: '15px',
                                        outline: 'none',
                                        transition: 'all var(--transition-fast)'
                                    }}
                                />
                            </div>
                        </div>
                        
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500' }}>
                                Bio
                            </label>
                            <textarea 
                                value={form.bio} 
                                onChange={e => setForm({ ...form, bio: e.target.value })} 
                                placeholder="Tell us about yourself and your study journey"
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '15px',
                                    outline: 'none',
                                    resize: 'vertical',
                                    fontFamily: 'inherit',
                                    transition: 'all var(--transition-fast)'
                                }}
                            />
                        </div>
                        
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button 
                                type="submit" 
                                disabled={saving}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '10px 20px',
                                    background: 'var(--accent-green)',
                                    color: 'var(--white)',
                                    border: 'none',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: saving ? 'not-allowed' : 'pointer',
                                    opacity: saving ? 0.6 : 1,
                                    transition: 'all var(--transition-fast)',
                                    boxShadow: 'var(--shadow-sm)'
                                }}
                            >
                                <Save size={16} />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                            
                            <button 
                                type="button"
                                onClick={() => {
                                    setEditing(false)
                                    setForm({ name: user.name || '', bio: user.bio || '', goal: user.goal || '', profilePic: user.profilePic || '' })
                                    setError('')
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '10px 20px',
                                    background: 'var(--white)',
                                    color: 'var(--text-secondary)',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all var(--transition-fast)'
                                }}
                            >
                                <X size={16} />
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Two Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
                {/* Posts Section */}
                <div style={{ 
                    background: 'var(--white)', 
                    padding: '24px', 
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-md)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <MapPin size={24} style={{ color: 'var(--primary-blue)' }} />
                        <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                            Journey Posts & Milestones
                        </h2>
                    </div>
                    
                    {user.posts && user.posts.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {user.posts.map((p, i) => (
                                <div 
                                    key={i} 
                                    style={{
                                        padding: '16px',
                                        background: 'var(--off-white)',
                                        borderRadius: 'var(--radius-md)',
                                        borderLeft: '4px solid var(--primary-blue)'
                                    }}
                                >
                                    <h3 style={{ 
                                        fontSize: '16px', 
                                        fontWeight: '500', 
                                        color: 'var(--text-primary)',
                                        marginBottom: '8px'
                                    }}>
                                        {p.title}
                                    </h3>
                                    <p style={{ 
                                        fontSize: '14px', 
                                        color: 'var(--text-secondary)', 
                                        lineHeight: '1.5',
                                        margin: 0
                                    }}>
                                        {p.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '40px 20px',
                            color: 'var(--text-secondary)'
                        }}>
                            <FileText size={48} style={{ 
                                color: 'var(--border-medium)', 
                                marginBottom: '16px',
                                opacity: 0.5
                            }} />
                            <p style={{ fontSize: '15px', margin: 0 }}>
                                No posts yet. Share your study journey with others!
                            </p>
                        </div>
                    )}
                </div>

                {/* Account Settings Section */}
                <div style={{ 
                    background: 'var(--white)', 
                    padding: '24px', 
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-md)',
                    height: 'fit-content'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <Lock size={24} style={{ color: 'var(--error)' }} />
                        <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                            Security Settings
                        </h2>
                    </div>

                    <form onSubmit={changePassword}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500' }}>
                                Current Password
                            </label>
                            <input 
                                type="password" 
                                placeholder="Enter current password" 
                                value={pwState.currentPassword} 
                                onChange={e => setPwState({ ...pwState, currentPassword: e.target.value })} 
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '15px',
                                    outline: 'none',
                                    transition: 'all var(--transition-fast)'
                                }}
                            />
                        </div>
                        
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500' }}>
                                New Password
                            </label>
                            <input 
                                type="password" 
                                placeholder="Enter new password" 
                                value={pwState.newPassword} 
                                onChange={e => setPwState({ ...pwState, newPassword: e.target.value })} 
                                required
                                minLength={6}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '15px',
                                    outline: 'none',
                                    transition: 'all var(--transition-fast)'
                                }}
                            />
                        </div>
                        
                        <button 
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'var(--primary-blue)',
                                color: 'var(--white)',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all var(--transition-fast)',
                                boxShadow: 'var(--shadow-sm)'
                            }}
                        >
                            Change Password
                        </button>
                        
                        {pwState.message && (
                            <div style={{ 
                                marginTop: '12px',
                                padding: '12px',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '14px',
                                ...(pwState.message.includes('success') || pwState.message.includes('Changed') ? {
                                    background: 'var(--success-bg)',
                                    color: 'var(--success)',
                                    borderLeft: '4px solid var(--success)'
                                } : {
                                    background: 'var(--error-bg)',
                                    color: 'var(--error)',
                                    borderLeft: '4px solid var(--error)'
                                })
                            }}>
                                {pwState.message}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}