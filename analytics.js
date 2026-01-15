/**
 * Focus Forge - Analytics Page
 * Track focus sessions and productivity with user authentication
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
        settings: {}
    };
}

// ==========================================
// ANALYTICS FUNCTIONS
// ==========================================

// Get analytics data from user-specific localStorage
function getAnalyticsData() {
    const userId = getCurrentUserId();
    if (!userId) return { sessions: [], tasks: [] };
    
    const data = getUserData(userId);
    return { 
        sessions: data.sessions || [], 
        tasks: data.tasks || [] 
    };
}

// Calculate total focus time in minutes
function calculateTotalTime(sessions) {
    return sessions.reduce((total, session) => total + (session.duration || 0), 0);
}

// Format time as hours and minutes
function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
}

// Get sessions by day for the past week
function getWeeklyData(sessions) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = {};
    
    // Initialize all days with 0
    days.forEach(day => weeklyData[day] = 0);
    
    // Get past 7 days
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = days[date.getDay()];
        
        // Sum sessions for this day
        sessions.forEach(session => {
            if (session.date === dateStr) {
                weeklyData[dayName] += session.duration || 0;
            }
        });
    }
    
    return weeklyData;
}

// Get recent activity
function getRecentActivity(sessions, tasks) {
    const activities = [];
    
    // Add completed sessions
    sessions.forEach(session => {
        activities.push({
            type: 'session',
            text: `Completed ${formatTime(session.duration)} focus session`,
            date: session.date,
            time: session.completedAt || session.date
        });
    });
    
    // Add completed tasks
    tasks.forEach(task => {
        if (task.completed && task.completedAt) {
            activities.push({
                type: 'task',
                text: `Completed task: "${task.text}"`,
                date: task.completedAt.split('T')[0],
                time: task.completedAt
            });
        }
    });
    
    // Sort by time (most recent first)
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    return activities.slice(0, 10);
}

// Update the weekly chart
function updateWeeklyChart(weeklyData) {
    const maxValue = Math.max(...Object.values(weeklyData), 60); // At least 1 hour for scale
    
    Object.keys(weeklyData).forEach(day => {
        const bar = document.querySelector(`.chart-bar[data-day="${day}"]`);
        if (bar) {
            const fill = bar.querySelector('.bar-fill');
            const percentage = (weeklyData[day] / maxValue) * 100;
            fill.style.height = `${Math.max(percentage, 2)}%`;
            fill.title = formatTime(weeklyData[day]);
        }
    });
}

// Render history list
function renderHistory(activities) {
    const historyList = document.getElementById('historyList');
    
    if (activities.length === 0) {
        historyList.innerHTML = '<div class="history-empty">No activity yet. Start a focus session!</div>';
        return;
    }
    
    historyList.innerHTML = activities.map(activity => {
        const date = new Date(activity.time);
        const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        return `
            <div class="history-item">
                <div class="history-icon ${activity.type}">
                    ${activity.type === 'session' 
                        ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>'
                        : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'
                    }
                </div>
                <div class="history-content">
                    <p class="history-text">${activity.text}</p>
                    <span class="history-time">${dateStr} at ${timeStr}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Update stats display
function updateStats(sessions, tasks) {
    const totalMinutes = calculateTotalTime(sessions);
    const totalSessions = sessions.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    
    // Calculate unique days with sessions
    const uniqueDays = new Set(sessions.map(s => s.date)).size || 1;
    const avgPerDay = Math.round(totalMinutes / uniqueDays);
    
    // Update DOM
    document.getElementById('totalHours').textContent = formatTime(totalMinutes);
    document.getElementById('totalSessions').textContent = totalSessions;
    document.getElementById('avgPerDay').textContent = formatTime(avgPerDay);
    document.getElementById('tasksCompleted').textContent = completedTasks;
}

// DOM Elements
const elements = {
    donationModal: document.getElementById('donationModal'),
    donationClose: document.getElementById('donationClose'),
    sidebarDonation: document.getElementById('sidebarDonation'),
    sidebarLogout: document.getElementById('sidebarLogout')
};

// Initialize
function init() {
    // Check authentication
    requireAuth();
    
    // Load data from user-specific storage
    const { sessions, tasks } = getAnalyticsData();
    
    // Calculate and display stats
    updateStats(sessions, tasks);
    
    // Update weekly chart
    const weeklyData = getWeeklyData(sessions);
    updateWeeklyChart(weeklyData);
    
    // Render history
    const activities = getRecentActivity(sessions, tasks);
    renderHistory(activities);
    
    // Setup donation modal
    if (elements.sidebarDonation) {
        elements.sidebarDonation.addEventListener('click', () => {
            elements.donationModal.classList.add('active');
        });
    }
    
    // Logout button
    if (elements.sidebarLogout) {
        elements.sidebarLogout.addEventListener('click', logoutUser);
    }
    
    if (elements.donationClose) {
        elements.donationClose.addEventListener('click', () => {
            elements.donationModal.classList.remove('active');
        });
    }
    
    if (elements.donationModal) {
        elements.donationModal.addEventListener('click', (e) => {
            if (e.target === elements.donationModal) {
                elements.donationModal.classList.remove('active');
            }
        });
    }
}

// Start
document.addEventListener('DOMContentLoaded', init);

