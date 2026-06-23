import axios from 'axios'
import API_BASE_URL from './api/config'

// All requests go to <backend>/api/v1/*
const baseURL = `${API_BASE_URL}/api/v1`

const axiosInstance = axios.create({
    baseURL: baseURL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,   // include the HTTP-only cookies on cross-origin requests
})

// Response interceptor
// On a 401 (access token expired) we try once to refresh using the
// refresh-token cookie, then replay the original request. This is what
// keeps the user logged in without re-typing their password.
axiosInstance.interceptors.response.use(
    function (response) {
        return response
    },
    async function (error) {
        const originalRequest = error.config

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes("refresh/") &&
            !originalRequest.url.includes("dashboard-protected/")
        ) {
            originalRequest._retry = true
            try {
                await axiosInstance.post('refresh/')
                return axiosInstance(originalRequest)
            } catch {
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export default axiosInstance
