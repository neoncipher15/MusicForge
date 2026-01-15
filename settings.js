/**
 * Focus Forge - Settings Page
 * Simple settings with localStorage (no login required)
 */

// ==========================================
// DATA FUNCTIONS
// ==========================================

function getTasks() {
    return JSON.parse(localStorage.getItem('focusForgeTasks')) || [];
}

function getSessions() {
    return JSON.parse(localStorage.getItem('focusForgeSessions')) || [];
}

function getSettings() {
    return JSON.parse(localStorage.getItem('focusForgeSettings')) || {
        soundEnabled: true,
        timerDuration: 25
    };
}

function saveSettings(settings) {
    localStorage.setItem('focusForgeSettings', JSON.stringify(settings));
}

function clearAllData() {
    localStorage.removeItem('focusForgeTasks');
    localStorage.removeItem('focusForgeSessions');
    localStorage.removeItem('focusForgeScheduledTasks');
    localStorage.removeItem('focusForgeSettings');
    localStorage.removeItem('focusForgeLastVisit');
    localStorage.removeItem('focusForgeSound');
    localStorage.removeItem('focusForgeTimerState');
}

// ==========================================
// EXPORT/IMPORT FUNCTIONS
// ==========================================

function exportData() {
    const data = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        tasks: getTasks(),
        sessions: getSessions(),
        scheduledTasks: JSON.parse(localStorage.getItem('focusForgeScheduledTasks')) || {},
        settings: getSettings()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focus-forge-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showMessage('dataMessage', 'Data exported successfully!');
}

function importData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (!data.version || !data.tasks) {
                    reject(new Error('Invalid backup file format'));
                    return;
                }
                
                // Import tasks
                if (data.tasks && Array.isArray(data.tasks)) {
                    localStorage.setItem('focusForgeTasks', JSON.stringify(data.tasks));
                }
                
                // Import sessions
                if (data.sessions && Array.isArray(data.sessions)) {
                    localStorage.setItem('focusForgeSessions', JSON.stringify(data.sessions));
                }
                
                // Import scheduled tasks
                if (data.scheduledTasks) {
                    localStorage.setItem('focusForgeScheduledTasks', JSON.stringify(data.scheduledTasks));
                }
                
                // Import settings
                if (data.settings) {
                    localStorage.setItem('focusForgeSettings', JSON.stringify(data.settings));
                }
                
                resolve({
                    tasksImported: data.tasks?.length || 0,
                    sessionsImported: data.sessions?.length || 0
                });
            } catch (error) {
                reject(new Error('Failed to parse backup file: ' + error.message));
            }
        };
        
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

// ==========================================
// UI FUNCTIONS
// ==========================================

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

function loadSettings() {
    const settings = getSettings();
    
    const timerDuration = document.getElementById('timerDuration');
    const soundEnabled = document.getElementById('soundEnabled');
    
    if (timerDuration) {
        timerDuration.value = settings.timerDuration || 25;
    }
    
    if (soundEnabled) {
        soundEnabled.checked = settings.soundEnabled !== false;
    }
}

function loadStats() {
    const sessions = getSessions();
    const tasks = getTasks();
    
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
    // Save timer settings
    const saveTimerBtn = document.getElementById('saveTimerSettings');
    if (saveTimerBtn) {
        saveTimerBtn.addEventListener('click', () => {
            const timerDuration = parseInt(document.getElementById('timerDuration').value);
            const soundEnabled = document.getElementById('soundEnabled').checked;
            
            saveSettings({
                timerDuration,
                soundEnabled
            });
            
            showMessage('timerMessage', 'Settings saved!');
        });
    }
    
    // Export data
    const exportBtn = document.getElementById('exportData');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
    
    // Import data
    const importInput = document.getElementById('importData');
    if (importInput) {
        importInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const result = await importData(file);
                showMessage('dataMessage', 
                    `Imported ${result.tasksImported} tasks and ${result.sessionsImported} sessions!`);
                loadStats();
                e.target.value = '';
            } catch (error) {
                showMessage('dataMessage', error.message, 'error');
                e.target.value = '';
            }
        });
    }
    
    // Clear data
    const clearBtn = document.getElementById('clearData');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete ALL data? This cannot be undone!')) {
                clearAllData();
                loadStats();
                showMessage('dataMessage', 'All data cleared!', 'success');
            }
        });
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
    loadSettings();
    loadStats();
    initEventListeners();
}

// Start
document.addEventListener('DOMContentLoaded', init);
