import { API_BASE_URL } from "../config/api"

export const useApi = () => {
    const makeRequest = async (endpoint, options = {}) => {
        const token = localStorage.getItem('access_token')
        const tokenType = localStorage.getItem('token_type') || 'bearer'
        
        const defaultOptions = {
            headers: {
                "Content-Type": "application/json"
            },
        }

        if (token) {
            defaultOptions.headers["Authorization"] = `${tokenType} ${token}`
        }

        const response = await fetch(API_BASE_URL + endpoint, {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...(options.headers || {})
            }
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => null)
            throw new Error(errorData?.detail || "Request failed")
        }

        return response.json()
    }

    return { makeRequest }
}