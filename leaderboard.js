/**
 * Focus Forge - Leaderboard
 * Shows user rankings based on focus session hours (from localStorage)
 */

// Get leaderboard data from localStorage
function getLeaderboardData() {
    const sessions = JSON.parse(localStorage.getItem('focusForgeSessions')) || [];
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);
    
    return {
        totalMinutes,
        totalHours,
        sessionCount: sessions.length
    };
}

// Format time as hours and minutes
function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
}

// Render leaderboard (shows your stats since no user system)
function renderLeaderboard() {
    const yourHours = document.getElementById('yourTotalHours');
    const yourSessions = document.getElementById('yourSessionCount');
    const currentRank = document.getElementById('currentRank');
    
    const data = getLeaderboardData();
    
    // Show user's own stats (no ranking since it's local only)
    if (yourHours) yourHours.textContent = `${data.totalHours}h`;
    if (yourSessions) yourSessions.textContent = `${data.sessionCount} sessions`;
    if (currentRank) currentRank.textContent = '-';
    
    // Show the user's total as the only "leaderboard" entry
    const container = document.getElementById('leaderboardList');
    const emptyState = document.getElementById('leaderboardEmpty');
    
    if (!container) return;
    
    if (data.sessionCount === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    container.innerHTML = `
        <div class="leaderboard-item current-user">
            <div class="rank-badge">🏆</div>
            <div class="user-avatar-small">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
            </div>
            <div class="user-details">
                <span class="username">Your Focus Time</span>
                <span class="session-count">${data.sessionCount} completed sessions</span>
            </div>
            <div class="time-badge">${data.totalHours}h</div>
        </div>
    `;
}

// DOM Elements
const elements = {
    donationModal: document.getElementById('donationModal'),
    donationClose: document.getElementById('donationClose'),
    sidebarDonation: document.getElementById('sidebarDonation')
};

// Initialize
function init() {
    // Render leaderboard
    renderLeaderboard();
    
    // Setup donation modal
    if (elements.sidebarDonation) {
        elements.sidebarDonation.addEventListener('click', () => {
            if (elements.donationModal) elements.donationModal.classList.add('active');
        });
    }
    
    if (elements.donationClose) {
        elements.donationClose.addEventListener('click', () => {
            if (elements.donationModal) elements.donationModal.classList.remove('active');
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

