/**
 * Focus Forge - Settings Page
 * User settings, profile management, and data export/import
 */

// ==========================================
// AUTHENTICATION FUNCTIONS
// ==========================================

/**
 * Get current session
 */
function getCurrentSession() {
    return JSON.parse(localStorage.getItem('focusForgeSession')) || 
           JSON.parse(sessionStorage.getItem('focusForgeSession'));
}

/**
 * Check if user is logged in
 */
function isLoggedIn() {
    return getCurrentSession() !== null;
}

/**
 * Get current user ID
 */
function getCurrentUserId() {
    const session = getCurrentSession();
    return session ? session.userId : null;
}

/**
 * Redirect to login if not logged in
 */
function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
    }
}

/**
 * Logout user
 */
function logoutUser() {
    localStorage.removeItem('focusForgeSession');
    sessionStorage.removeItem('focusForgeSession');
    window.location.href = 'login.html';
}

/**
 * Get all users
 */
function getAllUsers() {
    return JSON.parse(localStorage.getItem('focusForgeUsers')) || {};
}

/**
 * Save all users
 */
function saveAllUsers(users) {
    localStorage.setItem('focusForgeUsers', JSON.stringify(users));
}

/**
 * Update user profile
 */
function updateUserProfile(userId, updates) {
    const users = getAllUsers();
    if (users[userId]) {
        users[userId] = { ...users[userId], ...updates };
        saveAllUsers(users);
        return true;
    }
    return false;
}

// ==========================================
// USER DATA FUNCTIONS
// ==========================================

/**
 * Get user data object
 */
function getUserData(userId) {
    const key = `focusForgeData_${userId}`;
    return JSON.parse(localStorage.getItem(key)) || {
        tasks: [],
        sessions: [],
        scheduledTasks: {},
        settings: {
            soundEnabled: true,
            timerDuration: 25
        }
    };
}

/**
 * Save user data object
 */
function saveUserData(userId, data) {
    const key = `focusForgeData_${userId}`;
    localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Get user's settings
 */
function getUserSettings(userId) {
    const data = getUserData(userId);
    return data.settings;
}

/**
 * Save user's settings
 */
function saveUserSettings(userId, settings) {
    const data = getUserData(userId);
    data.settings = { ...data.settings, ...settings };
    saveUserData(userId, data);
}

/**
 * Get user sessions
 */
function getUserSessions(userId) {
    const data = getUserData(userId);
    return data.sessions || [];
}

/**
 * Get user tasks
 */
function getUserTasks(userId) {
    const data = getUserData(userId);
    return data.tasks || [];
}

/**
 * Get scheduled tasks
 */
function getScheduledTasks(userId) {
    const data = getUserData(userId);
    return data.scheduledTasks || {};
}

// ==========================================
// EXPORT/IMPORT FUNCTIONS
// ==========================================

/**
 * Export all user data to a JSON file
 */
function exportUserData(userId) {
    const users = getAllUsers();
    const user = users[userId];
    const userData = getUserData(userId);
    
    const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        },
        data: userData
    };
    
    // Create blob and download
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focus-forge-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return true;
}

/**
 * Import data from a JSON file
 */
function importUserData(file, userId) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                
                // Validate import data
                if (!importData.version || !importData.data) {
                    reject(new Error('Invalid backup file format'));
                    return;
                }
                
                // Update user data
                const currentData = getUserData(userId);
                const newData = {
                    ...currentData,
                    tasks: importData.data.tasks || currentData.tasks,
                    sessions: [
                        ...(currentData.sessions || []),
                        ...(importData.data.sessions || [])
                    ],
                    scheduledTasks: {
                        ...(currentData.scheduledTasks || {}),
                        ...(importData.data.scheduledTasks || {})
                    },
                    settings: {
                        ...(currentData.settings || {}),
                        ...(importData.data.settings || {})
                    }
                };
                
                saveUserData(userId, newData);
                
                resolve({
                    tasksImported: importData.data.tasks?.length || 0,
                    sessionsImported: importData.data.sessions?.length || 0
                });
            } catch (error) {
                reject(new Error('Failed to parse backup file: ' + error.message));
            }
        };
        
        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };
        
        reader.readAsText(file);
    });
}

// ==========================================
// UI FUNCTIONS
// ==========================================

/**
 * Show message
 */
function showMessage(elementId, message, type = 'success') {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.className = 'settings-message ' + type;
        element.style.opacity = '1';
        
        setTimeout(() => {
            element.style.opacity = '0';
        }, 3000);
    }
}

/**
 * Load user profile
 */
function loadProfile() {
    const userId = getCurrentUserId();
    const users = getAllUsers();
    const user = users[userId];
    
    if (user) {
        const displayNameInput = document.getElementById('displayName');
        if (displayNameInput) {
            displayNameInput.value = user.name || '';
        }
    }
}

/**
 * Load timer settings
 */
function loadTimerSettings() {
    const userId = getCurrentUserId();
    const settings = getUserSettings(userId);
    
    const timerDuration = document.getElementById('timerDuration');
    const soundEnabled = document.getElementById('soundEnabled');
    
    if (timerDuration) {
        timerDuration.value = settings.timerDuration || 25;
    }
    
    if (soundEnabled) {
        soundEnabled.checked = settings.soundEnabled !== false;
    }
}

/**
 * Load user stats
 */
function loadUserStats() {
    const userId = getCurrentUserId();
    const sessions = getUserSessions(userId);
    const tasks = getUserTasks(userId);
    
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);
    const completedTasks = tasks.filter(t => t.completed).length;
    
    const sessionsStat = document.getElementById('totalSessionsStat');
    const hoursStat = document.getElementById('totalHoursStat');
    const tasksStat = document.getElementById('tasksCompletedStat');
    
    if (sessionsStat) sessionsStat.textContent = totalSessions;
    if (hoursStat) hoursStat.textContent = totalHours + 'h';
    if (tasksStat) tasksStat.textContent = completedTasks;
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function initEventListeners() {
    const userId = getCurrentUserId();
    
    // Save profile
    const saveProfileBtn = document.getElementById('saveProfile');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', () => {
            const displayName = document.getElementById('displayName').value.trim();
            if (displayName) {
                const success = updateUserProfile(userId, { name: displayName });
                if (success) {
                    showMessage('profileMessage', 'Profile saved successfully!');
                } else {
                    showMessage('profileMessage', 'Failed to save profile', 'error');
                }
            } else {
                showMessage('profileMessage', 'Please enter a name', 'error');
            }
        });
    }
    
    // Save timer settings
    const saveTimerBtn = document.getElementById('saveTimerSettings');
    if (saveTimerBtn) {
        saveTimerBtn.addEventListener('click', () => {
            const timerDuration = parseInt(document.getElementById('timerDuration').value);
            const soundEnabled = document.getElementById('soundEnabled').checked;
            
            saveUserSettings(userId, {
                timerDuration,
                soundEnabled
            });
            
            showMessage('timerMessage', 'Timer settings saved!');
        });
    }
    
    // Export data
    const exportBtn = document.getElementById('exportData');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            exportUserData(userId);
            showMessage('dataMessage', 'Data exported successfully!');
        });
    }
    
    // Import data
    const importInput = document.getElementById('importData');
    if (importInput) {
        importInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const result = await importUserData(file, userId);
                showMessage('dataMessage', 
                    `Imported ${result.tasksImported} tasks and ${result.sessionsImported} sessions!`);
                
                // Refresh stats
                loadUserStats();
                
                // Clear the input
                e.target.value = '';
            } catch (error) {
                showMessage('dataMessage', error.message, 'error');
                e.target.value = '';
            }
        });
    }
    
    // Logout button
    const sidebarLogout = document.getElementById('sidebarLogout');
    if (sidebarLogout) {
        sidebarLogout.addEventListener('click', logoutUser);
    }
    
    // Donation modal
    const sidebarDonation = document.getElementById('sidebarDonation');
    const donationModal = document.getElementById('donationModal');
    const donationClose = document.getElementById('donationClose');
    
    if (sidebarDonation && donationModal) {
        sidebarDonation.addEventListener('click', () => {
            donationModal.classList.add('active');
        });
    }
    
    if (donationClose && donationModal) {
        donationClose.addEventListener('click', () => {
            donationModal.classList.remove('active');
        });
        
        donationModal.addEventListener('click', (e) => {
            if (e.target === donationModal) {
                donationModal.classList.remove('active');
            }
        });
    }
}

// ==========================================
// INITIALIZATION
// ==========================================

function init() {
    // Check authentication
    requireAuth();
    
    // Load all settings
    loadProfile();
    loadTimerSettings();
    loadUserStats();
    
    // Initialize event listeners
    initEventListeners();
}

// Start
document.addEventListener('DOMContentLoaded', init);

