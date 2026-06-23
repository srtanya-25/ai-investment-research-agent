import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "./AuthProvider"

// Routes that should only be visible when logged OUT (login/register).
// Already logged in -> bounce to /dashboard
const PublicRoute = ({ children }) => {
    const { isLoggedIn } = useContext(AuthContext)
    return isLoggedIn ? <Navigate to="/dashboard" /> : children
}

export default PublicRoute
