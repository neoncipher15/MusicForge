/**
 * Focus Forge - Leaderboard
 * Shows user rankings based on focus session hours
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
// LEADERBOARD FUNCTIONS
// ==========================================

/**
 * Get all registered users
 */
function getAllUsers() {
    return JSON.parse(localStorage.getItem('focusForgeUsers')) || {};
}

/**
 * Get leaderboard data sorted by total minutes
 */
function getLeaderboardData(period = 'all') {
    const users = getAllUsers();
    const leaderboard = JSON.parse(localStorage.getItem('focusForgeLeaderboard')) || {};
    
    const entries = [];
    const now = new Date();
    
    Object.entries(leaderboard).forEach(([userId, data]) => {
        const user = users[userId];
        if (!user) return;
        
        // Get user data for filtering by period
        const userDataKey = `focusForgeData_${userId}`;
        const userData = JSON.parse(localStorage.getItem(userDataKey)) || { sessions: [] };
        
        let totalMinutes = data.totalMinutes || 0;
        
        // Filter by period if needed
        if (period !== 'all') {
            const sessions = userData.sessions || [];
            let filteredSessions = [];
            
            switch(period) {
                case 'today':
                    const today = now.toISOString().split('T')[0];
                    filteredSessions = sessions.filter(s => s.date === today);
                    break;
                case 'week':
                    const weekAgo = new Date(now);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    filteredSessions = sessions.filter(s => new Date(s.date) >= weekAgo);
                    break;
                case 'month':
                    const monthAgo = new Date(now);
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    filteredSessions = sessions.filter(s => new Date(s.date) >= monthAgo);
                    break;
                default:
                    filteredSessions = sessions;
            }
            
            totalMinutes = filteredSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        }
        
        entries.push({
            userId,
            username: user.displayName || user.username || 'Unknown',
            totalMinutes,
            totalHours: (totalMinutes / 60).toFixed(1),
            rank: 0 // Will be calculated after sorting
        });
    });
    
    // Sort by total minutes (descending)
    entries.sort((a, b) => b.totalMinutes - a.totalMinutes);
    
    // Assign ranks
    entries.forEach((entry, index) => {
        entry.rank = index + 1;
    });
    
    return entries;
}

/**
 * Get current user's leaderboard entry
 */
function getCurrentUserEntry(period = 'all') {
    const userId = getCurrentUserId();
    if (!userId) return null;
    
    const users = getAllUsers();
    const user = users[userId];
    const leaderboard = JSON.parse(localStorage.getItem('focusForgeLeaderboard')) || {};
    const data = leaderboard[userId];
    
    if (!data) return null;
    
    const entries = getLeaderboardData(period);
    return entries.find(e => e.userId === userId);
}

/**
 * Get time period filter value
 */
function getCurrentPeriod() {
    const activeFilter = document.querySelector('.leaderboard-filter.active');
    return activeFilter ? activeFilter.dataset.period : 'all';
}

// ==========================================
// UI FUNCTIONS
// ==========================================

/**
 * Render leaderboard entries
 */
function renderLeaderboard() {
    const period = getCurrentPeriod();
    const entries = getLeaderboardData(period);
    const container = document.getElementById('leaderboardList');
    const emptyState = document.getElementById('leaderboardEmpty');
    const currentRank = document.getElementById('currentRank');
    const userTotalHours = document.getElementById('userTotalHours');
    const currentUsername = document.getElementById('currentUsername');
    
    if (!container) return;
    
    // Get current user info
    const session = getCurrentSession();
    const users = getAllUsers();
    const user = session ? users[session.userId] : null;
    
    // Update username display
    if (currentUsername && user) {
        currentUsername.textContent = user.displayName || user.username || 'User';
    }
    
    if (entries.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        if (currentRank) currentRank.textContent = '-';
        if (userTotalHours) userTotalHours.textContent = '0';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    // Show current user stats
    const currentUserEntry = entries.find(e => e.userId === getCurrentUserId());
    if (currentRank && currentUserEntry) {
        currentRank.textContent = currentUserEntry.rank;
    }
    if (userTotalHours && currentUserEntry) {
        userTotalHours.textContent = currentUserEntry.totalHours;
    }
    
    // Render entries
    container.innerHTML = entries.map((entry, index) => {
        const isCurrentUser = entry.userId === getCurrentUserId();
        const isTop3 = index < 3;
        
        let rankClass = '';
        let rankEmoji = '';
        
        if (isTop3) {
            rankClass = 'rank-top';
            if (index === 0) {
                rankEmoji = '🥇';
            } else if (index === 1) {
                rankEmoji = '🥈';
            } else {
                rankEmoji = '🥉';
            }
        }
        
        return `
            <div class="leaderboard-item ${isCurrentUser ? 'current-user' : ''} ${index === 0 ? 'rank-gold' : ''} ${index === 1 ? 'rank-silver' : ''} ${index === 2 ? 'rank-bronze' : ''}">
                <div class="rank-badge ${index === 0 ? 'rank-gold' : ''} ${index === 1 ? 'rank-silver' : ''} ${index === 2 ? 'rank-bronze' : ''}">
                    ${rankEmoji || `#${entry.rank}`}
                </div>
                <div class="user-avatar-small">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                </div>
                <div class="user-details">
                    <span class="username">
                        ${escapeHtml(entry.username)}
                        ${isCurrentUser ? '(You)' : ''}
                    </span>
                    <span class="session-count">Focus sessions completed</span>
                </div>
                <div class="time-badge">${entry.totalHours}h</div>
            </div>
        `;
    }).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Handle period filter click
 */
function handleFilterClick(e) {
    const filter = e.target.closest('.leaderboard-filter');
    if (!filter) return;
    
    // Update active state
    document.querySelectorAll('.leaderboard-filter').forEach(btn => {
        btn.classList.remove('active');
    });
    filter.classList.add('active');
    
    // Re-render leaderboard
    renderLeaderboard();
}

// ==========================================
// INITIALIZATION
// ==========================================

function init() {
    // Check authentication
    requireAuth();
    
    // Get DOM elements
    const filterButtons = document.querySelectorAll('.leaderboard-filter');
    const sidebarLogout = document.getElementById('sidebarLogout');
    const sidebarDonation = document.getElementById('sidebarDonation');
    const donationModal = document.getElementById('donationModal');
    const donationClose = document.getElementById('donationClose');
    
    // Add filter click handlers
    filterButtons.forEach(btn => {
        btn.addEventListener('click', handleFilterClick);
    });
    
    // Logout button
    if (sidebarLogout) {
        sidebarLogout.addEventListener('click', logoutUser);
    }
    
    // Donation modal
    if (sidebarDonation) {
        sidebarDonation.addEventListener('click', () => {
            if (donationModal) donationModal.classList.add('active');
        });
    }
    
    if (donationClose) {
        donationClose.addEventListener('click', () => {
            if (donationModal) donationModal.classList.remove('active');
        });
    }
    
    if (donationModal) {
        donationModal.addEventListener('click', (e) => {
            if (e.target === donationModal) {
                donationModal.classList.remove('active');
            }
        });
    }
    
    // Initial render
    renderLeaderboard();
}

// Start
document.addEventListener('DOMContentLoaded', init);

