import { createContext, useState, useEffect } from "react"
import axiosInstance from "./axiosInstance"

// Context so any component can read or update auth state via useContext()
const AuthContext = createContext()

const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [loading, setLoading] = useState(true)

    // On app load, ask the backend if our HTTP-only cookie is still valid
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

    if (loading) {
        return <div className="text-light text-center p-5">Loading...</div>
    }

    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider
export { AuthContext }
