import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import HomePage from './pages/HomePage'
import AttendancePage from './pages/AttendancePage'
import AnimatedBackground from './components/AnimatedBackground'

function App() {
    const location = useLocation()

    return (
        <>
            <AnimatedBackground />
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/attendance/:studentId" element={<AttendancePage />} />
                </Routes>
            </AnimatePresence>
        </>
    )
}

export default App
