import { useRef, useCallback, useState } from 'react'
import Webcam from 'react-webcam'
import { motion, AnimatePresence } from 'framer-motion'

const CameraCapture = ({ onCapture, disabled }) => {
    const webcamRef = useRef(null)
    const [capturedImage, setCapturedImage] = useState(null)
    const [isCameraReady, setIsCameraReady] = useState(false)
    const [cameraError, setCameraError] = useState(null)

    const videoConstraints = {
        width: 640,
        height: 480,
        facingMode: 'user',
    }

    const handleCapture = useCallback(() => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot()
            if (imageSrc) {
                setCapturedImage(imageSrc)
                onCapture(imageSrc)
            }
        }
    }, [onCapture])

    const handleRetake = () => {
        setCapturedImage(null)
        onCapture(null)
    }

    const handleUserMedia = () => {
        setIsCameraReady(true)
        setCameraError(null)
    }

    const handleUserMediaError = (error) => {
        console.error('Camera error:', error)
        setCameraError('Unable to access camera. Please ensure camera permissions are granted.')
    }

    return (
        <div className="camera-container">
            <AnimatePresence mode="wait">
                {!capturedImage ? (
                    <motion.div
                        key="camera"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ width: '100%', height: '100%', position: 'relative' }}
                    >
                        {!isCameraReady && !cameraError && (
                            <div className="camera-overlay">
                                <div className="loading-spinner" />
                            </div>
                        )}

                        {cameraError ? (
                            <div className="camera-overlay" style={{ flexDirection: 'column', padding: '20px', textAlign: 'center' }}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                                    <path d="M18 10.48V6c0-1.1-.9-2-2-2H6.83l2 2H16v4.48l2 2zM20.49 21.31L3.51 4.33l1.42-1.42L22 19.9l-1.51 1.41zM12.17 14H4V6.83L2 4.83V14c0 1.1.9 2 2 2h8.17l-2 2H4v-.17l-.17.17H4v2h6l4-4z" />
                                </svg>
                                <p style={{ color: 'white', marginTop: '16px' }}>{cameraError}</p>
                            </div>
                        ) : (
                            <>
                                <Webcam
                                    ref={webcamRef}
                                    audio={false}
                                    screenshotFormat="image/jpeg"
                                    videoConstraints={videoConstraints}
                                    onUserMedia={handleUserMedia}
                                    onUserMediaError={handleUserMediaError}
                                    className="camera-video"
                                    mirrored
                                />

                                {/* Face Guide Frame */}
                                {isCameraReady && (
                                    <motion.div
                                        className="camera-frame"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3 }}
                                    />
                                )}
                            </>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ width: '100%', height: '100%', position: 'relative' }}
                    >
                        <img
                            src={capturedImage}
                            alt="Captured"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transform: 'scaleX(-1)', // Mirror to match webcam
                            }}
                        />

                        {/* Captured overlay */}
                        <motion.div
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                background: 'rgba(16, 185, 129, 0.9)',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                fontSize: '14px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                            Photo Captured
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Camera Controls */}
            <motion.div
                style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '16px',
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                {!capturedImage ? (
                    <motion.button
                        onClick={handleCapture}
                        disabled={disabled || !isCameraReady || cameraError}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            width: '72px',
                            height: '72px',
                            borderRadius: '50%',
                            border: '4px solid white',
                            background: 'transparent',
                            cursor: disabled || !isCameraReady ? 'not-allowed' : 'pointer',
                            opacity: disabled || !isCameraReady ? 0.5 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                        }}
                    >
                        <motion.div
                            style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                background: 'white',
                            }}
                            whileHover={{ scale: 0.9 }}
                        />
                    </motion.button>
                ) : (
                    <motion.button
                        onClick={handleRetake}
                        disabled={disabled}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn btn-secondary"
                        style={{ opacity: disabled ? 0.5 : 1 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                        </svg>
                        Retake
                    </motion.button>
                )}
            </motion.div>
        </div>
    )
}

export default CameraCapture
