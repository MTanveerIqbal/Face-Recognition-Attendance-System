import { motion } from 'framer-motion'

const SuccessAnimation = ({ message, onComplete }) => {
    return (
        <motion.div
            className="loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onComplete}
            style={{ cursor: 'pointer' }}
        >
            {/* Success Circle */}
            <motion.div
                style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 60px rgba(16, 185, 129, 0.5)',
                }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                }}
            >
                {/* Checkmark */}
                <motion.svg
                    width="60"
                    height="60"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <motion.path
                        d="M20 6L9 17L4 12"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
                    />
                </motion.svg>
            </motion.div>

            {/* Success Message */}
            <motion.h2
                style={{ color: 'white', marginTop: '24px', textAlign: 'center' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                {message || 'Success!'}
            </motion.h2>

            {/* Confetti-like particles */}
            {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                    key={i}
                    style={{
                        position: 'absolute',
                        width: '10px',
                        height: '10px',
                        borderRadius: i % 2 === 0 ? '50%' : '2px',
                        background: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'][i % 4],
                    }}
                    initial={{
                        x: 0,
                        y: 0,
                        scale: 0,
                    }}
                    animate={{
                        x: (Math.random() - 0.5) * 400,
                        y: (Math.random() - 0.5) * 400,
                        scale: [0, 1, 0],
                        rotate: Math.random() * 360,
                    }}
                    transition={{
                        duration: 1.5,
                        delay: 0.3 + Math.random() * 0.3,
                        ease: 'easeOut',
                    }}
                />
            ))}

            <motion.p
                style={{ color: 'rgba(255,255,255,0.7)', marginTop: '16px' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
            >
                Click anywhere to continue
            </motion.p>
        </motion.div>
    )
}

export default SuccessAnimation
