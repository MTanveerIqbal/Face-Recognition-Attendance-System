import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatedBackground from '../components/AnimatedBackground'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import RealTimeScanner from '../components/RealTimeScanner'

const HomePage = () => {
    const [studentId, setStudentId] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [showScanner, setShowScanner] = useState(true) // Default to True
    const navigate = useNavigate()

    const handleStudentIdSubmit = async (e) => {
        e.preventDefault()
        if (!studentId.trim()) return

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/student/${studentId}/`)
            const data = await response.json()

            if (response.ok) {
                navigate('/attendance', { state: { student: data } })
            } else {
                setError(data.error || 'Student not found')
            }
        } catch (err) {
            setError('Unable to connect to server')
        } finally {
            setIsLoading(false)
        }
    }

    const handleScannerMatch = (student) => {
        console.log('Matched:', student)
    }

    return (
        <div className="app-container">
            <AnimatedBackground />

            {isLoading && <LoadingSpinner message="Verifying Student ID..." />}
            {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

            <AnimatePresence mode='wait'>
                {showScanner ? (
                    <motion.div
                        key="scanner"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        style={{ width: '100%', maxWidth: '800px', margin: '0 auto', zIndex: 10 }}
                    >
                        {/* Back to Manual Entry Button */}
                        <motion.button
                            onClick={() => setShowScanner(false)}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                left: '20px',
                                zIndex: 20,
                                background: 'rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(5px)',
                                border: 'none',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '0.9rem'
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                            Manual Entry
                        </motion.button>

                        <RealTimeScanner
                            onMatch={handleScannerMatch}
                            onCancel={() => setShowScanner(false)}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="home-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="glass-card"
                        style={{ maxWidth: '450px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 10 }}
                    >
                        <div className="icon-container" style={{ margin: '0 auto 2rem' }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </div>

                        <h1 className="title-gradient" style={{ marginBottom: '0.5rem' }}>Face Recognition</h1>
                        <p style={{ color: 'var(--neutral-500)', marginBottom: '2rem' }}>
                            Attendance Management System
                        </p>

                        <form onSubmit={handleStudentIdSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Enter Student ID"
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn btn-primary"
                                type="submit"
                            >
                                Scan with ID
                            </motion.button>
                        </form>

                        <div className="divider" style={{ margin: '2rem 0', color: 'var(--neutral-400)', fontSize: '0.9rem' }}>
                            <span>OR</span>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn btn-secondary"
                            onClick={() => setShowScanner(true)}
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: 'var(--primary-600)',
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px'
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                <circle cx="12" cy="13" r="4"></circle>
                            </svg>
                            Real-Time Auto Scan
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default HomePage
