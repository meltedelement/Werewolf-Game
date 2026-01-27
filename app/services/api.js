import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * API URL Configuration
 *
 * Priority order:
 * 1. Environment variable EXPO_PUBLIC_API_URL (configurable via .env or app.json)
 * 2. Auto-detection based on platform
 *
 * For physical devices in development:
 * - Create a .env file in the app/ directory with:
 *   EXPO_PUBLIC_API_URL=http://YOUR_IP:8080/api
 * - Or set it in app.json under expo.extra.apiUrl
 * - Or use the Expo dev server URL detection
 */

const getDevServerIP = () => {
    // Try to extract IP from Expo dev server URL
    // Expo exposes the manifest URL which contains the dev server IP
    try {
        const debuggerHost = Constants.expoConfig?.hostUri;
        if (debuggerHost) {
            const ip = debuggerHost.split(':')[0];
            return ip;
        }
    } catch (e) {
        console.warn('Could not auto-detect dev server IP:', e);
    }
    return null;
};

const API_BASE_URL = (() => {
    // 1. Check for explicit environment variable (highest priority)
    const envUrl = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;

    // Debug: Log what we're actually getting
    console.log('🔍 [API Config Debug] Constants.expoConfig?.extra?.apiUrl:', Constants.expoConfig?.extra?.apiUrl);
    console.log('🔍 [API Config Debug] process.env.EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
    console.log('🔍 [API Config Debug] typeof envUrl:', typeof envUrl, 'value:', envUrl);

    if (envUrl && typeof envUrl === 'string' && envUrl.length > 0) {
        console.log('🌐 [API Config] Using URL from .env:', envUrl);
        return envUrl;
    }

    // 2. Development mode - auto-detect or use defaults
    if (__DEV__) {
        if (Platform.OS === 'android') {
            // Try to auto-detect the dev server IP
            const devServerIP = getDevServerIP();
            if (devServerIP) {
                const url = `http://${devServerIP}:8080/api`;
                console.log('🌐 [API Config] Auto-detected from Expo dev server:', url);
                return url;
            }
            // Fallback to Android emulator default
            const fallbackUrl = 'http://10.0.2.2:8080/api';
            console.log('🌐 [API Config] Using Android emulator default:', fallbackUrl);
            return fallbackUrl;
        } else if (Platform.OS === 'ios') {
            // iOS simulator can use localhost
            const url = 'http://localhost:8080/api';
            console.log('🌐 [API Config] Using iOS default:', url);
            return url;
        } else {
            // Web
            const url = 'http://localhost:8080/api';
            console.log('🌐 [API Config] Using Web default:', url);
            return url;
        }
    }

    // 3. Production fallback
    console.warn('⚠️ [API Config] No API URL configured for production!');
    return 'http://localhost:8080/api';
})();

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

    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log(`[API] ${method} ${fullUrl}`);
    if (body) {
        console.log('[API] Request body:', JSON.stringify(body, null, 2));
    }

    try {
        const response = await fetch(fullUrl, options);
        console.log(`[API] Response status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[API] Error response:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('[API] Response data:', JSON.stringify(data).substring(0, 200) + '...');
        return data;
    } catch (error) {
        console.error('[API] Call failed:', error);
        if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
            throw new Error(`Cannot connect to server at ${API_BASE_URL}. Make sure the backend is running and your device is on the same network.`);
        }
        throw error;
    }
}

/**
 * Game API functions
 */
export const gameAPI = {
    /**
     * Create a new game with players and manually assigned roles
     * @param {Array<{name: string, role: string}>} players - Array of players with assigned roles
     * @returns {Promise<{gameId: string, players: Array}>}
     */
    createGameWithRoles: async (players) => {
        return await apiCall('/game/create-with-roles', 'POST', { players });
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
     * Get full game state (with phase info)
     * @param {string} gameId - Game ID
     * @returns {Promise<Object>} - Full game state
     */
    getGameState: async (gameId) => {
        return await apiCall(`/game/${gameId}/state`, 'GET');
    },

    /**
     * Get wakeup order for current night with intelligent role skipping
     * @param {string} gameId - Game ID
     * @returns {Promise<{wakeupOrder: Array<string>, nightNumber: number}>}
     */
    getWakeupOrder: async (gameId) => {
        return await apiCall(`/game/${gameId}/wakeup-order`, 'GET');
    },

    /**
     * Start a new night phase
     * @param {string} gameId - Game ID
     * @returns {Promise<Object>} - Updated game state
     */
    startNight: async (gameId) => {
        return await apiCall(`/game/${gameId}/start-night`, 'POST');
    },

    /**
     * Submit a night action
     * @param {string} gameId - Game ID
     * @param {Object} action - Action details
     * @returns {Promise<{actionId: string}>}
     */
    submitNightAction: async (gameId, action) => {
        return await apiCall(`/game/${gameId}/submit-action`, 'POST', action);
    },

    /**
     * Undo a night action
     * @param {string} gameId - Game ID
     * @param {string} actionId - Action ID to undo
     * @returns {Promise<Object>}
     */
    undoAction: async (gameId, actionId) => {
        return await apiCall(`/game/${gameId}/undo-action/${actionId}`, 'POST');
    },

    /**
     * Resolve night phase
     * @param {string} gameId - Game ID
     * @returns {Promise<Object>} - Resolution results
     */
    resolveNight: async (gameId) => {
        return await apiCall(`/game/${gameId}/resolve-night`, 'POST');
    },

    /**
     * Resolve day phase (lynch)
     * @param {string} gameId - Game ID
     * @param {Object} request - Lynch request
     * @returns {Promise<Object>}
     */
    resolveDay: async (gameId, request) => {
        return await apiCall(`/game/${gameId}/resolve-day`, 'POST', request);
    },

    /**
     * Deputy shoots a player during the day
     * @param {string} gameId - Game ID
     * @param {string} targetName - Name of player to shoot
     * @returns {Promise<Object>}
     */
    deputyShoot: async (gameId, targetName) => {
        return await apiCall(`/game/${gameId}/deputy-shoot`, 'POST', { targetName });
    },

    /**
     * Hunter revenge kill
     * @param {string} gameId - Game ID
     * @param {string} hunterName - Name of Hunter getting revenge
     * @param {string} targetName - Name of target to kill
     * @returns {Promise<Object>}
     */
    hunterRevenge: async (gameId, hunterName, targetName) => {
        return await apiCall(`/game/${gameId}/hunter-revenge`, 'POST', { hunterName, targetName });
    },

    /**
     * Tanner revenge kill
     * @param {string} gameId - Game ID
     * @param {string} tannerName - Name of Tanner getting revenge
     * @param {string} targetName - Name of target to kill
     * @returns {Promise<Object>}
     */
    tannerRevenge: async (gameId, tannerName, targetName) => {
        return await apiCall(`/game/${gameId}/tanner-revenge`, 'POST', { tannerName, targetName });
    },

    /**
     * Doom Sayer guesses 3 players' roles
     * @param {string} gameId - Game ID
     * @param {string} doomsayerName - Name of Doom Sayer
     * @param {Array<{playerName: string, guessedRole: string}>} guesses - 3 guesses
     * @returns {Promise<Object>}
     */
    doomsayerGuess: async (gameId, doomsayerName, guesses) => {
        return await apiCall(`/game/${gameId}/doomsayer-guess`, 'POST', { doomsayerName, guesses });
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
 * Player Name Preset API functions
 */
export const playerPresetAPI = {
    /**
     * Get all saved player name presets
     * @returns {Promise<Array<{id: string, name: string, description: string, playerNames: Array<string>}>>}
     */
    getAllPresets: async () => {
        return await apiCall('/player-presets', 'GET');
    },

    /**
     * Get a specific player name preset by ID
     * @param {string} id - Preset ID
     * @returns {Promise<{id: string, name: string, description: string, playerNames: Array<string>}>}
     */
    getPreset: async (id) => {
        return await apiCall(`/player-presets/${id}`, 'GET');
    },

    /**
     * Create a new player name preset
     * @param {string} name - Name of the preset
     * @param {string} description - Description
     * @param {Array<string>} playerNames - Array of player names
     * @returns {Promise<{id: string, name: string, description: string, playerNames: Array<string>}>}
     */
    createPreset: async (name, description, playerNames) => {
        return await apiCall('/player-presets', 'POST', { name, description, playerNames });
    },

    /**
     * Update an existing player name preset
     * @param {string} id - Preset ID
     * @param {string} name - Name of the preset
     * @param {string} description - Description
     * @param {Array<string>} playerNames - Array of player names
     * @returns {Promise<{id: string, name: string, description: string, playerNames: Array<string>}>}
     */
    updatePreset: async (id, name, description, playerNames) => {
        return await apiCall(`/player-presets/${id}`, 'PUT', { name, description, playerNames });
    },

    /**
     * Delete a player name preset
     * @param {string} id - Preset ID
     * @returns {Promise<{deleted: boolean}>}
     */
    deletePreset: async (id) => {
        return await apiCall(`/player-presets/${id}`, 'DELETE');
    },
};
