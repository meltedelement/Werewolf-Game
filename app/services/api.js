import { Platform } from 'react-native';

// Configuration - Automatically handles different environments
const getBaseURL = () => {
    if (__DEV__) {
        // Development environment
        if (Platform.OS === 'android') {
            return 'http://10.0.2.2:8080/api';  // Android emulator
        } else if (Platform.OS === 'ios') {
            return 'http://localhost:8080/api';  // iOS simulator
        } else {
            return 'http://localhost:8080/api';  // Web
        }
    }
    // Production - update with your production URL
    return 'http://YOUR_PRODUCTION_URL/api';
};

const API_BASE_URL = getBaseURL();

// For testing on physical device, uncomment and use your computer's IP:
// const API_BASE_URL = 'http://192.168.64.94:8080/api';

/**
 * Helper function to make API calls
 * @param {string} endpoint - API endpoint (e.g., '/game/create')
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {object} body - Request body for POST/PUT requests
 * @returns {Promise} - Response data as JSON
 */
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

/**
 * Game API functions
 */
export const gameAPI = {
    /**
     * Create a new game with players
     * @param {string[]} playerNames - Array of player names
     * @param {string[]} roleList - Optional preset list of role names (e.g., ['WEREWOLF', 'SEER', 'VILLAGER'])
     * @returns {Promise<{gameId: string, players: Array}>}
     */
    createGame: async (playerNames, roleList = null) => {
        const requestBody = {
            playerNames,
            roleList
        };
        return await apiCall('/game/create', 'POST', requestBody);
    },

    /**
     * Get current game state
     * @param {string} gameId - Game ID
     * @returns {Promise<{gameId: string, players: Array}>}
     */
    getGame: async (gameId) => {
        return await apiCall(`/game/${gameId}`, 'GET');
    },

    /**
     * Perform a night action
     * @param {string} gameId - Game ID
     * @param {string} role - Role performing the action (e.g., 'WEREWOLF', 'SEER')
     * @param {string[]} targetNames - Array of target player names
     * @returns {Promise<{success: boolean, message: string, result: string}>}
     */
    performNightAction: async (gameId, role, targetNames) => {
        return await apiCall(`/game/${gameId}/night-action`, 'POST', {
            role,
            targetNames
        });
    },
};

/**
 * Get the current API base URL (useful for debugging)
 */
export const getAPIBaseURL = () => API_BASE_URL;
