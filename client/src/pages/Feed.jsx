import React, { useEffect, useState } from 'react'
import { Home, TrendingUp, Users, BookOpen, Target, Heart, MessageSquare, Send, MapPin, Lightbulb, Image as ImageIcon } from 'lucide-react'

function Sidebar() {
    return (
        <aside style={{ 
            width: '260px', 
            position: 'sticky',
            top: '80px',
            height: 'fit-content'
        }}>
            <div style={{
                background: 'var(--white)',
                padding: '20px',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-md)'
            }}>
                <h3 style={{ 
                    margin: '0 0 16px 0', 
                    color: 'var(--text-primary)',
                    fontSize: '18px',
                    fontWeight: '600'
                }}>
                    Explore
                </h3>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <a 
                        href="#" 
                        style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 12px',
                            color: 'var(--text-primary)',
                            textDecoration: 'none',
                            borderRadius: 'var(--radius-md)',
                            background: '#E8F0FE',
                            fontWeight: '500',
                            fontSize: '14px',
                            transition: 'all var(--transition-fast)'
                        }}
                    >
                        <Home size={18} style={{ color: 'var(--primary-blue)' }} />
                        Home
                    </a>
                    <a 
                        href="#" 
                        style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 12px',
                            color: 'var(--text-secondary)',
                            textDecoration: 'none',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '14px',
                            transition: 'all var(--transition-fast)'
                        }}
                    >
                        <TrendingUp size={18} />
                        Trending Exams
                    </a>
                    <a 
                        href="#" 
                        style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 12px',
                            color: 'var(--text-secondary)',
                            textDecoration: 'none',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '14px',
                            transition: 'all var(--transition-fast)'
                        }}
                    >
                        <Users size={18} />
                        Study Groups
                    </a>
                    <a 
                        href="#" 
                        style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 12px',
                            color: 'var(--text-secondary)',
                            textDecoration: 'none',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '14px',
                            transition: 'all var(--transition-fast)'
                        }}
                    >
                        <BookOpen size={18} />
                        Resources
                    </a>
                    <a 
                        href="#" 
                        style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 12px',
                            color: 'var(--text-secondary)',
                            textDecoration: 'none',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '14px',
                            transition: 'all var(--transition-fast)'
                        }}
                    >
                        <Target size={18} />
                        My Targets
                    </a>
                </nav>
            </div>
        </aside>
    )
}

function PostCard({ p, onLike, onComment, onStudyRequest }) {
    const [commentText, setCommentText] = useState('')
    const [showComments, setShowComments] = useState(false)

    return (
        <div style={{ 
            background: 'var(--white)', 
            padding: '20px', 
            borderRadius: 'var(--radius-xl)', 
            marginBottom: '16px',
            boxShadow: 'var(--shadow-md)',
            transition: 'all var(--transition-fast)'
        }}>
            {/* Post Header */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                {p.author.profilePic ? (
                    <img 
                        src={p.author.profilePic} 
                        alt="avatar" 
                        style={{ 
                            width: '48px', 
                            height: '48px', 
                            borderRadius: '50%', 
                            objectFit: 'cover',
                            border: '2px solid var(--off-white)'
                        }} 
                    />
                ) : (
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-dark))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--white)',
                        fontWeight: '600',
                        fontSize: '18px'
                    }}>
                        {p.author.name?.charAt(0).toUpperCase()}
                    </div>
                )}
                <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '15px' }}>
                        {p.author.name}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                        {new Date(p.createdAt).toLocaleString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                </div>
            </div>

            {/* Post Content */}
            <div style={{ marginBottom: '16px' }}>
                <h4 style={{ 
                    margin: '0 0 8px 0', 
                    color: 'var(--text-primary)',
                    fontSize: '18px',
                    fontWeight: '600'
                }}>
                    {p.title}
                </h4>
                <p style={{ 
                    margin: '0 0 12px 0', 
                    color: 'var(--text-primary)',
                    fontSize: '15px',
                    lineHeight: '1.6'
                }}>
                    {p.content}
                </p>
                
                {/* Media */}
                {p.media && p.media.length > 0 && (
                    <div style={{ marginTop: '12px' }}>
                        {p.isVideo ? (
                            <video 
                                src={p.media[0]} 
                                controls 
                                style={{ 
                                    width: '100%', 
                                    borderRadius: 'var(--radius-lg)',
                                    maxHeight: '400px',
                                    objectFit: 'cover'
                                }} 
                            />
                        ) : (
                            <img 
                                src={p.media[0]} 
                                alt="media" 
                                style={{ 
                                    width: '100%', 
                                    borderRadius: 'var(--radius-lg)',
                                    maxHeight: '400px',
                                    objectFit: 'cover'
                                }} 
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div style={{ 
                display: 'flex', 
                gap: '8px', 
                paddingTop: '12px',
                borderTop: '1px solid var(--border-light)',
                marginBottom: '12px'
            }}>
                <button 
                    onClick={() => onLike(p._id)}
                    style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px', 
                        borderRadius: 'var(--radius-md)', 
                        background: 'var(--off-white)', 
                        color: 'var(--text-primary)', 
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all var(--transition-fast)'
                    }}
                >
                    <Heart size={16} style={{ color: 'var(--error)' }} />
                    {p.likes?.length || 0}
                </button>
                
                <button 
                    onClick={() => setShowComments(!showComments)}
                    style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px', 
                        borderRadius: 'var(--radius-md)', 
                        background: 'var(--off-white)', 
                        color: 'var(--text-primary)', 
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all var(--transition-fast)'
                    }}
                >
                    <MessageSquare size={16} style={{ color: 'var(--primary-blue)' }} />
                    {p.comments?.length || 0}
                </button>
                
                <button 
                    onClick={() => onStudyRequest(p._id)}
                    style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px', 
                        borderRadius: 'var(--radius-md)', 
                        background: '#E6F4EA', 
                        color: 'var(--accent-green)', 
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all var(--transition-fast)',
                        marginLeft: 'auto'
                    }}
                >
                    <Users size={16} />
                    Study Buddy
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div style={{ marginTop: '12px' }}>
                    {/* Comment Input */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <input 
                            value={commentText} 
                            onChange={e => setCommentText(e.target.value)} 
                            placeholder="Write a comment..." 
                            style={{ 
                                flex: 1,
                                padding: '10px 12px',
                                border: '1px solid var(--border-light)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all var(--transition-fast)'
                            }}
                        />
                        <button 
                            onClick={() => { 
                                if (commentText.trim()) {
                                    onComment(p._id, commentText); 
                                    setCommentText('');
                                }
                            }}
                            style={{ 
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '10px 16px', 
                                borderRadius: 'var(--radius-md)', 
                                background: 'var(--primary-blue)', 
                                color: 'var(--white)', 
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'all var(--transition-fast)',
                                boxShadow: 'var(--shadow-sm)'
                            }}
                        >
                            <Send size={16} />
                        </button>
                    </div>
                    
                    {/* Comments List */}
                    {p.comments && p.comments.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {p.comments.map((c, i) => (
                                <div 
                                    key={i} 
                                    style={{ 
                                        padding: '12px', 
                                        background: 'var(--off-white)', 
                                        borderRadius: 'var(--radius-md)'
                                    }}
                                >
                                    <div style={{ 
                                        fontSize: '14px', 
                                        color: 'var(--text-primary)',
                                        lineHeight: '1.5'
                                    }}>
                                        <strong style={{ fontWeight: '600' }}>
                                            {c.author?.name || 'User'}
                                        </strong>{' '}
                                        {c.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function RightSidebar() {
    return (
        <aside style={{ 
            width: '280px',
            position: 'sticky',
            top: '80px',
            height: 'fit-content'
        }}>
            <div style={{
                background: 'var(--white)',
                padding: '20px',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-md)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Lightbulb size={20} style={{ color: 'var(--warning)' }} />
                    <h4 style={{ 
                        margin: 0, 
                        fontSize: '16px', 
                        fontWeight: '600',
                        color: 'var(--text-primary)'
                    }}>
                        Quick Tips
                    </h4>
                </div>
                <ul style={{ 
                    paddingLeft: '20px',
                    margin: 0,
                    color: 'var(--text-secondary)',
                    fontSize: '14px',
                    lineHeight: '1.8'
                }}>
                    <li>Share photos of your study notes</li>
                    <li>Upload short video explanations</li>
                    <li>Ask questions and help others</li>
                    <li>Connect with study buddies</li>
                    <li>Be respectful and encouraging</li>
                </ul>
            </div>

            <div style={{
                background: 'var(--white)',
                padding: '20px',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-md)',
                marginTop: '16px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <MapPin size={20} style={{ color: 'var(--accent-green)' }} />
                    <h4 style={{ 
                        margin: 0, 
                        fontSize: '16px', 
                        fontWeight: '600',
                        color: 'var(--text-primary)'
                    }}>
                        Your Journey
                    </h4>
                </div>
                <p style={{ 
                    margin: 0,
                    color: 'var(--text-secondary)',
                    fontSize: '14px',
                    lineHeight: '1.6'
                }}>
                    Track your progress and share milestones with the community. Every step counts!
                </p>
            </div>
        </aside>
    )
}

export default function Feed() {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)

    function load() {
        setLoading(true)
        fetch('http://localhost:5000/api/posts')
            .then(r => r.json())
            .then(data => { 
                setPosts(data); 
                setLoading(false);
            })
            .catch(() => setLoading(false))
    }

    useEffect(() => { load() }, [])

    async function like(id) {
        await fetch(`http://localhost:5000/api/posts/${id}/like`, { 
            method: 'POST', 
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } 
        })
        load()
    }

    async function comment(id, text) {
        if (!text) return
        await fetch(`http://localhost:5000/api/posts/${id}/comment`, { 
            method: 'POST', 
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${localStorage.getItem('token')}` 
            }, 
            body: JSON.stringify({ text }) 
        })
        load()
    }

    async function studyRequest(id) {
        await fetch(`http://localhost:5000/api/posts/${id}/study-request`, { 
            method: 'POST', 
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } 
        })
        alert('Study buddy request sent! 🎯')
    }

    return (
        <div style={{ 
            display: 'flex', 
            gap: '24px', 
            padding: '24px',
            maxWidth: '1400px',
            margin: '0 auto'
        }}>
            <Sidebar />
            
            <main style={{ flex: 1, minWidth: 0 }}>
                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ 
                        color: 'var(--text-primary)',
                        fontSize: '24px',
                        fontWeight: '600',
                        margin: '0 0 8px 0'
                    }}>
                        Community Feed
                    </h2>
                    <p style={{ 
                        color: 'var(--text-secondary)',
                        fontSize: '15px',
                        margin: 0
                    }}>
                        Discover study insights, connect with peers, and share your journey
                    </p>
                </div>

                {loading ? (
                    <div style={{ 
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '60px 0',
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
                            Loading feed...
                        </div>
                    </div>
                ) : posts.length > 0 ? (
                    posts.map(p => (
                        <PostCard 
                            key={p._id} 
                            p={p} 
                            onLike={like} 
                            onComment={comment} 
                            onStudyRequest={studyRequest} 
                        />
                    ))
                ) : (
                    <div style={{
                        background: 'var(--white)',
                        padding: '60px 40px',
                        borderRadius: 'var(--radius-xl)',
                        textAlign: 'center',
                        boxShadow: 'var(--shadow-md)'
                    }}>
                        <MapPin size={64} style={{ 
                            color: 'var(--border-medium)',
                            marginBottom: '20px',
                            opacity: 0.5
                        }} />
                        <h3 style={{ 
                            color: 'var(--text-primary)',
                            fontSize: '20px',
                            fontWeight: '600',
                            marginBottom: '8px'
                        }}>
                            No posts yet
                        </h3>
                        <p style={{ 
                            color: 'var(--text-secondary)',
                            fontSize: '15px',
                            margin: 0
                        }}>
                            Be the first to share your study journey with the community!
                        </p>
                    </div>
                )}
            </main>
            
            <RightSidebar />
        </div>
    )
}