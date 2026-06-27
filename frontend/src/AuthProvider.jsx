import { createContext, useState, useEffect } from "react"
import axiosInstance from "./axiosInstance"

// Context so any component can read or update auth state via useContext()
const AuthContext = createContext()

const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [loading, setLoading] = useState(true)

    // Check the cookie in the background. The app renders straight away so the
    // landing page shows instantly instead of waiting on the backend to wake up.
    useEffect(() => {
        const checkAuth = async () => {
            try {
                await axiosInstance.get("/dashboard-protected/")
                setIsLoggedIn(true)
            } catch {
                setIsLoggedIn(false)
            } finally {
                setLoading(false)
            }
        }
        checkAuth()
    }, [])

    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider
export { AuthContext }
