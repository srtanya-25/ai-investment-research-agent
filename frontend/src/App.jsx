import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import AuthProvider from "./AuthProvider"
import PrivateRoute from "./PrivateRoute"
import PublicRoute from "./PublicRoute"

import Header from "./components/Header"
import Footer from "./components/Footer"
import MainContent from "./components/MainContent"
import Login from "./components/Login"
import Register from "./components/Register"
import Dashboard from "./components/protected/Dashboard"
import ResearchPage from "./components/protected/ResearchPage"
import ReportView from "./components/protected/ReportView"

// Single global stylesheet - imported once at the root
import "./assets/css/styles.css"

// React Query handles caching/loading state for the report history list
const queryClient = new QueryClient()

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <BrowserRouter>
                    <Header />
                    <Routes>
                        {/* Public landing page */}
                        <Route path="/" element={<MainContent />} />

                        {/* Public-only routes - bounce to /dashboard if already logged in */}
                        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
                        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

                        {/* Protected routes - require login */}
                        <Route path="/dashboard"      element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                        <Route path="/research"       element={<PrivateRoute><ResearchPage /></PrivateRoute>} />
                        <Route path="/reports/:id"    element={<PrivateRoute><ReportView /></PrivateRoute>} />
                    </Routes>
                    <Footer />
                </BrowserRouter>
            </AuthProvider>
        </QueryClientProvider>
    )
}

export default App
