// API base URL - taken from .env via Vite's import.meta.env (the VITE_ prefix is required)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default API_BASE_URL
