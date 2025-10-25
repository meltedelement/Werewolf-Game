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

// For testing on physical device, use your computer's IP:
const API_BASE_URL = 'http://192.168.188.200:8080/api';

// Uncomment below to use automatic detection (emulator/simulator only):
// const API_BASE_URL = getBaseURL();

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
     * @param {Array|null} roleListOrItems - Optional role list (old format) or roleListItems (new format)
     * @param {boolean} useNewFormat - If true, use roleListItems format instead of roleList
     * @returns {Promise<{gameId: string, players: Array}>}
     */
    createGame: async (playerNames, roleListOrItems = null, useNewFormat = false) => {
        const requestBody = {
            playerNames,
        };

        if (roleListOrItems) {
            if (useNewFormat) {
                requestBody.roleListItems = roleListOrItems;
            } else {
                requestBody.roleList = roleListOrItems;
            }
        }

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
 * Role List API functions
 */
export const roleListAPI = {
    /**
     * Get all saved role lists
     * @returns {Promise<Array<{id: string, name: string, description: string, roles: Array}>>}
     */
    getAllRoleLists: async () => {
        return await apiCall('/role-lists', 'GET');
    },

    /**
     * Get a specific role list by ID
     * @param {string} id - Role list ID
     * @returns {Promise<{id: string, name: string, description: string, roles: Array}>}
     */
    getRoleList: async (id) => {
        return await apiCall(`/role-lists/${id}`, 'GET');
    },

    /**
     * Create a new role list
     * @param {string} name - Name of the role list
     * @param {string} description - Description
     * @param {Array} roles - Array of RoleListItem objects: {type: "SPECIFIC"|"CATEGORY", value: string, count: number}
     * @returns {Promise<{id: string, name: string, description: string, roles: Array}>}
     */
    createRoleList: async (name, description, roles) => {
        return await apiCall('/role-lists', 'POST', { name, description, roles });
    },

    /**
     * Update an existing role list
     * @param {string} id - Role list ID
     * @param {string} name - Name of the role list
     * @param {string} description - Description
     * @param {Array} roles - Array of RoleListItem objects
     * @returns {Promise<{id: string, name: string, description: string, roles: Array}>}
     */
    updateRoleList: async (id, name, description, roles) => {
        return await apiCall(`/role-lists/${id}`, 'PUT', { name, description, roles });
    },

    /**
     * Delete a role list
     * @param {string} id - Role list ID
     * @returns {Promise<{deleted: boolean}>}
     */
    deleteRoleList: async (id) => {
        return await apiCall(`/role-lists/${id}`, 'DELETE');
    },

    /**
     * Get available role categories
     * @returns {Promise<{categories: Array<string>}>}
     */
    getCategories: async () => {
        return await apiCall('/role-lists/categories', 'GET');
    },

    /**
     * Get all available roles
     * @returns {Promise<{roles: Array<string>}>}
     */
    getRoles: async () => {
        return await apiCall('/role-lists/roles', 'GET');
    },
};

/**
 * Get the current API base URL (useful for debugging)
 */
export const getAPIBaseURL = () => API_BASE_URL;
