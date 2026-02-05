import { motion } from 'framer-motion'

const LoadingSpinner = ({ message = 'Processing...' }) => {
    return (
        <motion.div
            className="loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                style={{
                    width: '60px',
                    height: '60px',
                    border: '4px solid rgba(255, 255, 255, 0.1)',
                    borderTopColor: '#8b5cf6',
                    borderRadius: '50%',
                }}
                animate={{ rotate: 360 }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            />
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                {message}
            </motion.p>

            {/* Pulsing dots */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: 'white',
                        }}
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.2,
                        }}
                    />
                ))}
            </div>
        </motion.div>
    )
}

export default LoadingSpinner
