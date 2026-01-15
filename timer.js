/**
 * Focus Forge - Shared Timer Module
 * Provides persistent timer functionality across all pages
 */

// Timer State
let timerState = {
    timeRemaining: 25 * 60, // seconds
    totalTime: 25 * 60,     // seconds
    isRunning: false,
    lastUpdate: null,
    sessionId: null
};

// Initialize timer from localStorage
function initTimer() {
    const stored = localStorage.getItem('focusForgeTimerState');
    if (stored) {
        const parsed = JSON.parse(stored);
        
        // Check if timer was running and calculate elapsed time
        if (parsed.isRunning) {
            const elapsed = Math.floor((Date.now() - parsed.lastUpdate) / 1000);
            timerState = {
                ...parsed,
                timeRemaining: Math.max(0, parsed.timeRemaining - elapsed),
                lastUpdate: Date.now()
            };
            
            // If timer completed while away
            if (timerState.timeRemaining <= 0) {
                timerState.isRunning = false;
                timerState.timeRemaining = timerState.totalTime;
            }
        } else {
            timerState = parsed;
            timerState.lastUpdate = Date.now();
        }
    } else {
        timerState.lastUpdate = Date.now();
    }
    
    saveTimerState();
    return timerState;
}

// Save timer state to localStorage
function saveTimerState() {
    timerState.lastUpdate = Date.now();
    localStorage.setItem('focusForgeTimerState', JSON.stringify(timerState));
}

// Start the timer
function startTimer(durationSeconds = null) {
    if (durationSeconds) {
        timerState.totalTime = durationSeconds;
        timerState.timeRemaining = durationSeconds;
    }
    timerState.isRunning = true;
    timerState.lastUpdate = Date.now();
    timerState.sessionId = Date.now();
    saveTimerState();
    return timerState;
}

// Stop the timer
function stopTimer() {
    timerState.isRunning = false;
    saveTimerState();
    return timerState;
}

// Reset the timer
function resetTimer() {
    timerState.isRunning = false;
    timerState.timeRemaining = timerState.totalTime;
    saveTimerState();
    return timerState;
}

// Set timer duration
function setTimerDuration(seconds) {
    timerState.totalTime = seconds;
    timerState.timeRemaining = seconds;
    saveTimerState();
    return timerState;
}

// Get current timer state
function getTimerState() {
    // Update time remaining if running
    if (timerState.isRunning) {
        const elapsed = Math.floor((Date.now() - timerState.lastUpdate) / 1000);
        timerState.timeRemaining = Math.max(0, timerState.timeRemaining - elapsed);
        timerState.lastUpdate = Date.now();
        
        // Check if completed
        if (timerState.timeRemaining <= 0) {
            timerState.isRunning = false;
            timerState.timeRemaining = 0;
        }
        
        saveTimerState();
    }
    return { ...timerState };
}

// Check if timer is running
function isTimerRunning() {
    return getTimerState().isRunning;
}

// Get formatted time
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
        minutes: mins.toString().padStart(2, '0'),
        seconds: secs.toString().padStart(2, '0'),
        totalSeconds: seconds
    };
}

// Update progress (for progress ring)
function getProgress() {
    const state = getTimerState();
    if (state.totalTime <= 0) return 0;
    return (state.totalTime - state.timeRemaining) / state.totalTime;
}

// Get current user ID for session tracking
function getCurrentUserId() {
    const session = JSON.parse(localStorage.getItem('focusForgeSession')) || 
                   JSON.parse(sessionStorage.getItem('focusForgeSession'));
    return session ? session.userId : null;
}

// Save session when timer completes
function saveCompletedSession() {
    const userId = getCurrentUserId();
    if (!userId) return;
    
    const durationMinutes = Math.floor(timerState.totalTime / 60);
    const session = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        duration: durationMinutes,
        completedAt: new Date().toISOString()
    };
    
    // Get user data
    const userDataKey = `focusForgeData_${userId}`;
    const userData = JSON.parse(localStorage.getItem(userDataKey)) || {
        tasks: [],
        sessions: [],
        scheduledTasks: {},
        settings: {}
    };
    
    // Add session
    userData.sessions.push(session);
    
    // Save user data
    localStorage.setItem(userDataKey, JSON.stringify(userData));
    
    // Update leaderboard
    updateLeaderboard(userId, userData);
    
    return session;
}

// Update leaderboard for user
function updateLeaderboard(userId, userData) {
    const sessions = userData.sessions || [];
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    
    const leaderboard = JSON.parse(localStorage.getItem('focusForgeLeaderboard')) || {};
    leaderboard[userId] = {
        totalMinutes,
        updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('focusForgeLeaderboard', JSON.stringify(leaderboard));
}

// Get leaderboard data
function getLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('focusForgeLeaderboard')) || {};
    const users = JSON.parse(localStorage.getItem('focusForgeUsers')) || {};
    
    const entries = Object.entries(leaderboard).map(([userId, data]) => {
        const user = users[userId];
        return {
            userId,
            username: user ? (user.displayName || user.name || user.email.split('@')[0]) : 'Unknown',
            totalMinutes: data.totalMinutes,
            totalHours: (data.totalMinutes / 60).toFixed(1)
        };
    });
    
    entries.sort((a, b) => b.totalMinutes - a.totalMinutes);
    return entries;
}

// Get user rank
function getUserRank(userId) {
    const entries = getLeaderboard();
    const index = entries.findIndex(e => e.userId === userId);
    return index >= 0 ? index + 1 : null;
}

// Initialize on load
initTimer();

// Start interval to update timer state
let timerInterval = setInterval(() => {
    if (timerState.isRunning) {
        getTimerState();
    }
}, 1000);

// Export functions
window.Timer = {
    init: initTimer,
    start: startTimer,
    stop: stopTimer,
    reset: resetTimer,
    setDuration: setTimerDuration,
    getState: getTimerState,
    isRunning: isTimerRunning,
    formatTime: formatTime,
    getProgress: getProgress,
    saveSession: saveCompletedSession,
    getLeaderboard: getLeaderboard,
    getUserRank: getUserRank
};

