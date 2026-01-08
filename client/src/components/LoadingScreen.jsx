import React, { useState, useEffect } from 'react'
import { Compass } from 'lucide-react'

export default function LoadingScreen() {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval)
                    return 100
                }
                return prev + 2
            })
        }, 30)

        return () => clearInterval(interval)
    }, [])

    // Waypoint positions (x, y, label)
    const waypoints = [
        { x: 40, y: 40, label: '1', progress: 0 },
        { x: 200, y: 60, label: '2', progress: 25 },
        { x: 320, y: 120, label: '3', progress: 50 },
        { x: 240, y: 200, label: '4', progress: 75 },
        { x: 80, y: 240, label: '5', progress: 100 }
    ]

    // Calculate route lines between waypoints
    const getLineStyle = (from, to, segmentProgress) => {
        const dx = to.x - from.x
        const dy = to.y - from.y
        const length = Math.sqrt(dx * dx + dy * dy)
        const angle = Math.atan2(dy, dx) * (180 / Math.PI)

        return {
            width: `${length}px`,
            height: '4px',
            left: `${from.x + 20}px`,
            top: `${from.y + 20}px`,
            transform: `rotate(${angle}deg)`,
            fillWidth: segmentProgress
        }
    }

    const getWaypointStatus = (wpProgress) => {
        if (progress >= wpProgress) return 'completed'
        if (progress >= wpProgress - 15) return 'active'
        return 'inactive'
    }

    const getSegmentProgress = (fromProgress, toProgress) => {
        if (progress <= fromProgress) return 0
        if (progress >= toProgress) return 100
        return ((progress - fromProgress) / (toProgress - fromProgress)) * 100
    }

    return (
        <div className="loading-screen">
            <div className="loading-content">
                <h1 className="loading-title">
                    <Compass size={32} />
                    EduWay
                </h1>

                <div className="route-container">
                    {/* Route Lines */}
                    {waypoints.slice(0, -1).map((from, i) => {
                        const to = waypoints[i + 1]
                        const lineStyle = getLineStyle(from, to)
                        const segmentProgress = getSegmentProgress(from.progress, to.progress)

                        return (
                            <div
                                key={`line-${i}`}
                                className="route-line"
                                style={{
                                    width: lineStyle.width,
                                    height: lineStyle.height,
                                    left: lineStyle.left,
                                    top: lineStyle.top,
                                    transform: lineStyle.transform
                                }}
                            >
                                <div
                                    className="route-line-fill"
                                    style={{ width: `${segmentProgress}%` }}
                                />
                            </div>
                        )
                    })}

                    {/* Waypoints */}
                    {waypoints.map((wp, i) => (
                        <div
                            key={`wp-${i}`}
                            className={`waypoint ${getWaypointStatus(wp.progress)}`}
                            style={{
                                left: `${wp.x}px`,
                                top: `${wp.y}px`
                            }}
                        >
                            <div className="waypoint-inner">
                                {getWaypointStatus(wp.progress) === 'completed' ? '✓' : wp.label}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="loading-percentage">{progress}%</div>
                <p className="loading-message">Preparing your learning journey...</p>
            </div>
        </div>
    )
}