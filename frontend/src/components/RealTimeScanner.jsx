import { useRef, useEffect, useState, useCallback } from 'react'
import Webcam from 'react-webcam'
import { motion, AnimatePresence } from 'framer-motion'
import LoadingSpinner from './LoadingSpinner'

const RealTimeScanner = ({ onMatch, onCancel }) => {
    const webcamRef = useRef(null)
    const [isScanning, setIsScanning] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)
    const [lastMarkedTime, setLastMarkedTime] = useState(0)
    const [scanStatus, setScanStatus] = useState('Scanning...')
    const [matchedStudent, setMatchedStudent] = useState(null)

    const videoConstraints = {
        width: 640,
        height: 480,
        facingMode: 'user',
    }

    const scanFrame = useCallback(async () => {
        if (!webcamRef.current || !isScanning || isProcessing || matchedStudent) return

        const now = Date.now()
        // Don't scan if we just marked attendance (wait 5 seconds)
        if (now - lastMarkedTime < 5000) return

        const imageSrc = webcamRef.current.getScreenshot()
        if (!imageSrc) return

        setIsProcessing(true)

        try {
            const response = await fetch('/api/attendance/recognize/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: imageSrc }),
            })

            const data = await response.json()

            if (response.ok && data.status === 'success' && data.match) {
                // Success! Found a match
                setMatchedStudent(data.student)
                setLastMarkedTime(Date.now())
                setIsScanning(false)

                // Auto-resume scanning after 3 seconds
                setTimeout(() => {
                    setMatchedStudent(null)
                    setIsScanning(true)
                }, 3000)
            }
        } catch (err) {
            console.error('Scan error:', err)
        } finally {
            setIsProcessing(false)
        }
    }, [isScanning, isProcessing, lastMarkedTime, matchedStudent])

    // Continuous scanning loop
    useEffect(() => {
        const intervalId = setInterval(scanFrame, 1500) // Scan every 1.5s
        return () => clearInterval(intervalId)
    }, [scanFrame])

    return (
        <div className="camera-container" style={{ height: '80vh', marginTop: 0 }}>
            {/* Webcam Feed */}
            <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="camera-video"
                style={{ height: '100%', objectFit: 'cover' }}
                mirrored
            />

            {/* Scanning Overlay */}
            <div className="camera-overlay" style={{ background: 'transparent' }}>
                {/* Face Frame */}
                <motion.div
                    className="camera-frame"
                    animate={{
                        borderColor: matchedStudent ? 'var(--success-500)' : 'var(--primary-400)',
                        boxShadow: matchedStudent
                            ? '0 0 0 4px rgba(16, 185, 129, 0.5)'
                            : '0 0 0 0 rgba(0,0,0,0)',
                    }}
                    transition={{ duration: 0.3 }}
                />

                {/* Scan Line Animation */}
                {!matchedStudent && (
                    <motion.div
                        style={{
                            position: 'absolute',
                            top: '20%',
                            left: '10%',
                            right: '10%',
                            height: '2px',
                            background: 'linear-gradient(90deg, transparent, var(--primary-400), transparent)',
                            boxShadow: '0 0 10px var(--primary-400)',
                        }}
                        animate={{ top: ['20%', '80%', '20%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                )}

                {/* Status Indicator */}
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    padding: '8px 24px',
                    borderRadius: '30px',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}>
                    {matchedStudent ? (
                        <span style={{ color: 'var(--success-400)', fontWeight: 'bold' }}>Identified</span>
                    ) : (
                        <>
                            <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                            Scanning...
                        </>
                    )}
                </div>

                {/* Match Success Modal Overlay */}
                <AnimatePresence>
                    {matchedStudent && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 50 }}
                            style={{
                                position: 'absolute',
                                bottom: '40px',
                                left: '20px',
                                right: '20px',
                                background: 'rgba(255,255,255,0.95)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '16px',
                                padding: '20px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '20px',
                            }}
                        >
                            {/* Student Photo */}
                            <div style={{ position: 'relative' }}>
                                <img
                                    src={matchedStudent.face_image_url || 'https://via.placeholder.com/80'}
                                    alt={matchedStudent.name}
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '3px solid var(--success-500)',
                                    }}
                                />
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        background: 'var(--success-500)',
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                    }}
                                >
                                    ✓
                                </motion.div>
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: 0, color: 'var(--neutral-900)' }}>{matchedStudent.name}</h3>
                                <p style={{ margin: '4px 0 0', color: 'var(--neutral-500)', fontSize: '0.9rem' }}>
                                    ID: {matchedStudent.student_id}
                                </p>
                                <div style={{
                                    marginTop: '8px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    color: 'var(--success-600)',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    background: 'var(--success-50)',
                                    padding: '4px 10px',
                                    borderRadius: '10px'
                                }}>
                                    <span>●</span> Attendance Marked
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Close Button */}
            <button
                onClick={onCancel}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.5)',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(4px)',
                    zIndex: 10
                }}
            >
                ✕
            </button>
        </div>
    )
}

export default RealTimeScanner
