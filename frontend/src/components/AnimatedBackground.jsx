import { useMemo } from 'react'
import { motion } from 'framer-motion'

const AnimatedBackground = () => {
    // Generate random particles
    const particles = useMemo(() => {
        return Array.from({ length: 30 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 8 + 4,
            duration: Math.random() * 20 + 15,
            delay: Math.random() * 10,
        }))
    }, [])

    return (
        <div className="animated-bg">
            {/* Gradient Orbs */}
            <motion.div
                style={{
                    position: 'absolute',
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
                    top: '-200px',
                    right: '-200px',
                    filter: 'blur(60px)',
                }}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            <motion.div
                style={{
                    position: 'absolute',
                    width: '500px',
                    height: '500px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
                    bottom: '-150px',
                    left: '-150px',
                    filter: 'blur(60px)',
                }}
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 2,
                }}
            />

            <motion.div
                style={{
                    position: 'absolute',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, transparent 70%)',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    filter: 'blur(80px)',
                }}
                animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 4,
                }}
            />

            {/* Floating Particles */}
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    style={{
                        position: 'absolute',
                        left: `${particle.x}%`,
                        bottom: '-20px',
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.15)',
                    }}
                    animate={{
                        y: [0, -window.innerHeight - 100],
                        x: [0, Math.sin(particle.id) * 50],
                        opacity: [0, 1, 1, 0],
                    }}
                    transition={{
                        duration: particle.duration,
                        repeat: Infinity,
                        delay: particle.delay,
                        ease: 'linear',
                    }}
                />
            ))}

            {/* Grid Pattern Overlay */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
                    backgroundSize: '50px 50px',
                }}
            />
        </div>
    )
}

export default AnimatedBackground
