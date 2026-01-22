// localStorage utility functions for data persistence

export const storage = {
    // Generic get function
    get: <T>(key: string, defaultValue: T): T => {
        if (typeof window === 'undefined') return defaultValue;
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error reading ${key} from localStorage:`, error);
            return defaultValue;
        }
    },

    // Generic set function
    set: <T>(key: string, value: T): void => {
        if (typeof window === 'undefined') return;
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error writing ${key} to localStorage:`, error);
        }
    },

    // Remove function
    remove: (key: string): void => {
        if (typeof window === 'undefined') return;
        try {
            window.localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing ${key} from localStorage:`, error);
        }
    },

    // Clear all
    clear: (): void => {
        if (typeof window === 'undefined') return;
        try {
            window.localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }
};

// Storage keys
export const STORAGE_KEYS = {
    MEMBERS: 'church-cms-members',
    DEPARTMENTS: 'church-cms-departments',
    EVENTS: 'church-cms-events',
    TRANSACTIONS: 'church-cms-transactions',
    DOCUMENTS: 'church-cms-documents',
    TASKS: 'church-cms-tasks'
};
