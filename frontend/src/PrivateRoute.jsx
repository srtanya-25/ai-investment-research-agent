import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "./AuthProvider"

// Wrap any route that requires login.
// While the auth check is still running, show a small loader so we don't
// bounce a logged-in user to /login before the check finishes.
const PrivateRoute = ({ children }) => {
    const { isLoggedIn, loading } = useContext(AuthContext)

    if (loading) {
        return <div className="text-light text-center p-5">Loading...</div>
    }
    return isLoggedIn ? children : <Navigate to="/login" />
}

export default PrivateRoute
