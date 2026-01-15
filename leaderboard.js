/**
 * Focus Forge - Leaderboard Page
 * Display user rankings based on focus hours
 */

// ==========================================
// AUTHENTICATION FUNCTIONS
// ==========================================

function getCurrentSession() {
    return JSON.parse(localStorage.getItem('focusForgeSession')) || 
           JSON.parse(sessionStorage.getItem('focusForgeSession'));
}

function isLoggedIn() {
    return getCurrentSession() !== null;
}

function getCurrentUserId() {
    const session = getCurrentSession();
    return session ? session.userId : null;
}

function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
    }
}

function logoutUser() {
    localStorage.removeItem('focusForgeSession');
    sessionStorage.removeItem('focusForgeSession');
    window.location.href = 'login.html';
}

// ==========================================
// USER DATA FUNCTIONS
// ==========================================

function getUserData(userId) {
    const key = `focusForgeData_${userId}`;
    return JSON.parse(localStorage.getItem(key)) || {
        tasks: [],
        sessions: [],
        scheduledTasks: {},
        settings: {}
    };
}

function getUserAccount(userId) {
    const users = JSON.parse(localStorage.getItem('focusForgeUsers')) || {};
    return users[userId] || null;
}

// ==========================================
// LEADERBOARD FUNCTIONS
// ==========================================

function updateLeaderboard(userId, totalMinutes) {
    const leaderboard = JSON.parse(localStorage.getItem('focusForgeLeaderboard')) || {};
    
    leaderboard[userId] = {
        totalMinutes: totalMinutes,
        updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('focusForgeLeaderboard', JSON.stringify(leaderboard));
}

function getAllUserData() {
    const users = JSON.parse(localStorage.getItem('focusForgeUsers')) || {};
    const leaderboard = JSON.parse(localStorage.getItem('focusForgeLeaderboard')) || {};
    
    const entries = Object.keys(leaderboard).map(userId => {
        const user = users[userId];
        const data = getUserData(userId);
        const sessions = data.sessions || [];
        
        // Calculate total minutes from all sessions
        const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        const totalHours = totalMinutes / 60;
        
        return {
            userId,
            username: user ? (user.displayName || user.username) : 'Unknown',
            totalMinutes,
            totalHours: totalHours.toFixed(1),
            sessionCount: sessions.length
        };
    });
    
    // Sort by total minutes descending
    entries.sort((a, b) => b.totalMinutes - a.totalMinutes);
    
    return entries;
}

function getUserRank(userId) {
    const entries = getAllUserData();
    const index = entries.findIndex(e => e.userId === userId);
    return index >= 0 ? index + 1 : null;
}

function getCurrentUserStats(userId) {
    const data = getUserData(userId);
    const sessions = data.sessions || [];
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    return {
        totalMinutes,
        totalHours: (totalMinutes / 60).toFixed(1)
    };
}

// ==========================================
// UI FUNCTIONS
// ==========================================

function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
}

function renderLeaderboard(entries, currentUserId) {
    const listEl = document.getElementById('leaderboardList');
    const emptyEl = document.getElementById('emptyState');
    
    if (entries.length === 0) {
        listEl.innerHTML = '';
        emptyEl.style.display = 'block';
        return;
    }
    
    emptyEl.style.display = 'none';
    
    // Find current user's position
    const userIndex = entries.findIndex(e => e.userId === currentUserId);
    
    // Get top 10 entries
    const topEntries = entries.slice(0, 10);
    
    // Check if user is in top 10
    const userInTop10 = userIndex >= 0 && userIndex < 10;
    if (!userInTop10 && userIndex >= 0) {
        topEntries[9] = entries[userIndex];
    }
    
    listEl.innerHTML = topEntries.map((entry, index) => {
        const isCurrentUser = entry.userId === currentUserId;
        const rank = index + 1;
        
        // Special styling for top 3
        let rankClass = '';
        let rankIcon = '';
        
        if (rank === 1) {
            rankClass = 'rank-gold';
            rankIcon = '🥇';
        } else if (rank === 2) {
            rankClass = 'rank-silver';
            rankIcon = '🥈';
        } else if (rank === 3) {
            rankClass = 'rank-bronze';
            rankIcon = '🥉';
        }
        
        return `
            <div class="leaderboard-item ${rankClass} ${isCurrentUser ? 'current-user' : ''}">
                <div class="rank-badge ${rankClass}">
                    ${rankIcon || `#${rank}`}
                </div>
                <div class="user-avatar-small">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                </div>
                <div class="user-details">
                    <span class="username">${escapeHtml(entry.username)}${isCurrentUser ? ' (You)' : ''}</span>
                    <span class="session-count">${entry.sessionCount} sessions</span>
                </div>
                <div class="time-badge">
                    ${entry.totalHours}h
                </div>
            </div>
        `;
    }).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function loadLeaderboard(period = 'all') {
    const entries = getAllUserData();
    const currentUserId = getCurrentUserId();
    
    // Filter by period if needed
    let filteredEntries = entries;
    
    if (period !== 'all') {
        const now = new Date();
        let startDate;
        
        if (period === 'week') {
            startDate = new Date(now.setDate(now.getDate() - 7));
        } else if (period === 'month') {
            startDate = new Date(now.setMonth(now.getMonth() - 1));
        }
        
        // Re-calculate based on session dates
        filteredEntries = entries.map(entry => {
            const data = getUserData(entry.userId);
            const sessions = data.sessions || [];
            
            const periodMinutes = sessions
                .filter(s => new Date(s.date) >= startDate)
                .reduce((sum, s) => sum + (s.duration || 0), 0);
            
            return {
                ...entry,
                totalMinutes: periodMinutes,
                totalHours: (periodMinutes / 60).toFixed(1)
            };
        }).filter(e => e.totalMinutes > 0);
        
        filteredEntries.sort((a, b) => b.totalMinutes - a.totalMinutes);
    }
    
    renderLeaderboard(filteredEntries, currentUserId);
}

function loadUserInfo() {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;
    
    const account = getUserAccount(currentUserId);
    const stats = getCurrentUserStats(currentUserId);
    const rank = getUserRank(currentUserId);
    
    document.getElementById('currentUsername').textContent = account ? (account.displayName || account.username) : 'User';
    document.getElementById('currentRank').textContent = rank || '-';
    document.getElementById('userTotalHours').textContent = stats.totalHours;
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function initEventListeners() {
    // Period filter buttons
    const filterBtns = document.querySelectorAll('.leaderboard-filters .filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadLeaderboard(btn.dataset.period);
        });
    });
    
    // Logout
    document.getElementById('sidebarLogout').addEventListener('click', logoutUser);
    
    // Donation Modal
    document.getElementById('sidebarDonation').addEventListener('click', () => {
        document.getElementById('donationModal').classList.add('active');
    });
    
    document.getElementById('donationClose').addEventListener('click', () => {
        document.getElementById('donationModal').classList.remove('active');
    });
    
    document.getElementById('donationModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('donationModal')) {
            document.getElementById('donationModal').classList.remove('active');
        }
    });
}

// ==========================================
// INITIALIZATION
// ==========================================

function init() {
    requireAuth();
    loadUserInfo();
    loadLeaderboard();
    initEventListeners();
}

document.addEventListener('DOMContentLoaded', init);

