import { API_BASE_URL } from "../config/api"

export const useApi = () => {
    const makeRequest = async (endpoint, options = {}) => {
        const defaultOptions = {
            headers: {
                "Content-Type": "application/json"
            },
        }

        const response = await fetch(API_BASE_URL + endpoint, {
            ...defaultOptions,
            ...options,
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => null)
            throw new Error(errorData?.detail || "Request failed")
        }

        return response.json()
    }

    return { makeRequest }
}