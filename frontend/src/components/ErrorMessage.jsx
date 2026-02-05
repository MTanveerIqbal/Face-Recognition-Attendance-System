import { motion } from 'framer-motion'

const ErrorMessage = ({ message, onDismiss }) => {
    return (
        <motion.div
            className="message message-error"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{ position: 'relative' }}
        >
            {/* Error Icon */}
            <motion.div
                className="message-icon"
                initial={{ rotate: -90 }}
                animate={{ rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
            >
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
            </motion.div>

            <span style={{ flex: 1 }}>{message}</span>

            {onDismiss && (
                <motion.button
                    onClick={onDismiss}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'inherit',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                </motion.button>
            )}
        </motion.div>
    )
}

export default ErrorMessage
