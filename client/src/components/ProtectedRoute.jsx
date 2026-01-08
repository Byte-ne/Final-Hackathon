import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import LoadingScreen from './LoadingScreen'

export default function ProtectedRoute({ children }) {
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        // Simulate auth check with loading
        const checkAuth = async () => {
            const token = localStorage.getItem('token')
            
            // Minimum loading time for better UX
            await new Promise(resolve => setTimeout(resolve, 1500))
            
            setIsAuthenticated(!!token)
            setIsLoading(false)
        }

        checkAuth()
    }, [])

    if (isLoading) {
        return <LoadingScreen />
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return children
}