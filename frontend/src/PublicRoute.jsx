import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "./AuthProvider"

// Routes that should only be visible when logged OUT (login/register).
// While the check is still running, show the page anyway so it loads instantly.
const PublicRoute = ({ children }) => {
    const { isLoggedIn, loading } = useContext(AuthContext)

    if (loading) {
        return children
    }
    return isLoggedIn ? <Navigate to="/dashboard" /> : children
}

export default PublicRoute
