import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CameraCapture from '../components/CameraCapture'
import LoadingSpinner from '../components/LoadingSpinner'
import SuccessAnimation from '../components/SuccessAnimation'
import ErrorMessage from '../components/ErrorMessage'

const AttendancePage = () => {
    const { studentId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()

    const [student, setStudent] = useState(location.state?.student || null)
    const [capturedImage, setCapturedImage] = useState(null)
    const [loading, setLoading] = useState(!student)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')

    // Fetch student data if not passed via navigation
    useEffect(() => {
        if (!student && studentId) {
            fetchStudent()
        }
    }, [studentId])

    const fetchStudent = async () => {
        try {
            const response = await fetch(`/api/student/${studentId}/`)
            const data = await response.json()

            if (response.ok && data.status === 'success') {
                setStudent(data.student)
            } else {
                setError(data.error || 'Student not found')
                setTimeout(() => navigate('/'), 2000)
            }
        } catch (err) {
            setError('Unable to connect to server')
            setTimeout(() => navigate('/'), 2000)
        } finally {
            setLoading(false)
        }
    }

    const handleCapture = (imageSrc) => {
        setCapturedImage(imageSrc)
        setError(null)
    }

    const handleSubmit = async () => {
        if (!capturedImage) {
            setError('Please capture your photo first')
            return
        }

        setSubmitting(true)
        setError(null)

        try {
            const response = await fetch('/api/attendance/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    student_id: studentId,
                    image: capturedImage,
                }),
            })

            const data = await response.json()

            if (response.ok && data.status === 'success') {
                setSuccessMessage(data.message)
                setSuccess(true)
            } else {
                setError(data.error || 'Face verification failed. Please try again.')
                setCapturedImage(null)
            }
        } catch (err) {
            console.error('Error:', err)
            setError('Unable to connect to server. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleSuccessComplete = () => {
        navigate('/')
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1,
            },
        },
        exit: { opacity: 0, y: -30, transition: { duration: 0.3 } },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    }

    if (loading) {
        return <LoadingSpinner message="Loading student data..." />
    }

    return (
        <>
            <AnimatePresence>
                {submitting && <LoadingSpinner message="Verifying your face..." />}
                {success && (
                    <SuccessAnimation
                        message={successMessage}
                        onComplete={handleSuccessComplete}
                    />
                )}
            </AnimatePresence>

            <div className="app-container">
                <motion.div
                    className="glass-card"
                    style={{ maxWidth: '560px' }}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    {/* Header */}
                    <motion.div variants={itemVariants}>
                        <motion.button
                            onClick={() => navigate('/')}
                            whileHover={{ x: -5 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: 'var(--primary-500)',
                                cursor: 'pointer',
                                marginBottom: '16px',
                                padding: 0,
                                fontSize: '14px',
                                fontWeight: '600',
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                            </svg>
                            Back to Home
                        </motion.button>
                    </motion.div>

                    <motion.h2
                        variants={itemVariants}
                        style={{ marginBottom: '8px' }}
                    >
                        Mark Attendance
                    </motion.h2>

                    <motion.p
                        variants={itemVariants}
                        style={{ color: 'var(--neutral-500)', marginBottom: '24px' }}
                    >
                        Verify your identity using facial recognition
                    </motion.p>

                    {/* Student Info Card */}
                    {student && (
                        <motion.div className="student-card" variants={itemVariants}>
                            {student.face_image_url ? (
                                <img
                                    src={student.face_image_url}
                                    alt={student.name}
                                    className="student-avatar"
                                />
                            ) : (
                                <div
                                    className="student-avatar"
                                    style={{
                                        background: 'var(--gradient-primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <span style={{ color: 'white', fontSize: '24px', fontWeight: '700' }}>
                                        {student.name?.charAt(0) || '?'}
                                    </span>
                                </div>
                            )}
                            <div className="student-info">
                                <h3>{student.name}</h3>
                                <p>ID: {student.student_id}</p>
                            </div>
                        </motion.div>
                    )}

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <ErrorMessage message={error} onDismiss={() => setError(null)} />
                        )}
                    </AnimatePresence>

                    {/* Camera */}
                    <motion.div variants={itemVariants}>
                        <CameraCapture
                            onCapture={handleCapture}
                            disabled={submitting}
                        />
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div variants={itemVariants} style={{ marginTop: '24px' }}>
                        <motion.button
                            onClick={handleSubmit}
                            disabled={!capturedImage || submitting}
                            className="btn btn-success btn-full btn-lg"
                            whileHover={{ scale: capturedImage ? 1.02 : 1 }}
                            whileTap={{ scale: capturedImage ? 0.98 : 1 }}
                        >
                            {submitting ? (
                                <>
                                    <div className="loading-spinner" style={{ width: '20px', height: '20px', borderTopColor: 'white' }} />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                    </svg>
                                    Mark Attendance
                                </>
                            )}
                        </motion.button>
                    </motion.div>

                    {/* Instructions */}
                    <motion.div
                        variants={itemVariants}
                        style={{
                            marginTop: '24px',
                            padding: '16px',
                            background: 'var(--primary-50)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--primary-100)',
                        }}
                    >
                        <h4 style={{ fontSize: '14px', color: 'var(--primary-700)', marginBottom: '8px' }}>
                            📸 Tips for best results:
                        </h4>
                        <ul style={{
                            fontSize: '13px',
                            color: 'var(--primary-600)',
                            paddingLeft: '20px',
                            margin: 0,
                            lineHeight: '1.6',
                        }}>
                            <li>Ensure your face is well-lit</li>
                            <li>Look directly at the camera</li>
                            <li>Remove glasses if possible</li>
                            <li>Keep a neutral expression</li>
                        </ul>
                    </motion.div>
                </motion.div>
            </div>
        </>
    )
}

export default AttendancePage
