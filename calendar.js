/**
 * Focus Forge - Calendar Page
 * Schedule tasks and view them by date with user authentication
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
        scheduledTasks: {},
        sessions: [],
        settings: {}
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
 * Get user's scheduled tasks
 */
function getUserScheduledTasks(userId) {
    const data = getUserData(userId);
    return data.scheduledTasks || {};
}

/**
 * Save user's scheduled tasks
 */
function saveUserScheduledTasks(userId, scheduledTasks) {
    const data = getUserData(userId);
    data.scheduledTasks = scheduledTasks;
    saveUserData(userId, data);
}

// ==========================================
// CALENDAR FUNCTIONS
// ==========================================

// Get data from user-specific storage
let scheduledTasks = {};
let allTasks = {};

let currentDate = new Date();
let selectedDate = null;

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Save to user-specific localStorage
function saveScheduledTasks() {
    const userId = getCurrentUserId();
    if (userId) {
        saveUserScheduledTasks(userId, scheduledTasks);
    }
}

// Format date as YYYY-MM-DD
function formatDateKey(date) {
    return date.toISOString().split('T')[0];
}

// Format date for display
function formatDateDisplay(date) {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

// Get calendar data for a month
function getCalendarData(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    return {
        year,
        month,
        firstDay,
        lastDay,
        startDay,
        daysInMonth
    };
}

// Render calendar
function renderCalendar() {
    const data = getCalendarData(currentDate.getFullYear(), currentDate.getMonth());
    
    // Update header
    document.getElementById('currentMonth').textContent = `${monthNames[data.month]} ${data.year}`;
    
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';
    
    // Add day headers
    dayNames.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.textContent = day;
        grid.appendChild(header);
    });
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < data.startDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day empty';
        grid.appendChild(emptyCell);
    }
    
    // Add days of the month
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let day = 1; day <= data.daysInMonth; day++) {
        const date = new Date(data.year, data.month, day);
        const dateKey = formatDateKey(date);
        const tasks = scheduledTasks[dateKey] || [];
        const isToday = date.getTime() === today.getTime();
        const isPast = date < today;
        const isSelected = selectedDate && dateKey === formatDateKey(selectedDate);
        
        const dayCell = document.createElement('div');
        dayCell.className = `calendar-day${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}${isPast ? ' past' : ''}`;
        dayCell.innerHTML = `
            <span class="day-number">${day}</span>
            ${tasks.length > 0 ? `<span class="task-indicator">${tasks.length}</span>` : ''}
        `;
        
        dayCell.addEventListener('click', () => selectDate(date));
        grid.appendChild(dayCell);
    }
}

// Select a date
function selectDate(date) {
    selectedDate = date;
    renderCalendar();
    renderSelectedDateTasks();
}

// Render tasks for selected date
function renderSelectedDateTasks() {
    const title = document.getElementById('selectedDateTitle');
    const tasksContainer = document.getElementById('selectedDateTasks');
    
    if (!selectedDate) {
        title.textContent = 'Select a date';
        tasksContainer.innerHTML = '<p class="no-tasks">Click on a date to view tasks</p>';
        return;
    }
    
    title.textContent = formatDateDisplay(selectedDate);
    const dateKey = formatDateKey(selectedDate);
    const tasks = scheduledTasks[dateKey] || [];
    
    if (tasks.length === 0) {
        tasksContainer.innerHTML = '<p class="no-tasks">No tasks scheduled for this date</p>';
    } else {
        tasksContainer.innerHTML = tasks.map((task, index) => `
            <div class="scheduled-task">
                <div class="task-checkbox" data-index="${index}">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <polyline points="20 6 9 17 4 12" fill="none" stroke="currentColor" stroke-width="3"/>
                    </svg>
                </div>
                <span class="task-text">${escapeHtml(task.text)}</span>
                <button class="task-delete" data-index="${index}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `).join('');
    }
}

// Add task to selected date
function addTaskToDate(text) {
    if (!selectedDate || !text.trim()) return;
    
    const dateKey = formatDateKey(selectedDate);
    if (!scheduledTasks[dateKey]) {
        scheduledTasks[dateKey] = [];
    }
    
    scheduledTasks[dateKey].push({
        text: text.trim(),
        completed: false,
        createdAt: new Date().toISOString()
    });
    
    saveScheduledTasks();
    renderCalendar();
    renderSelectedDateTasks();
}

// Toggle scheduled task
function toggleScheduledTask(index) {
    if (!selectedDate) return;
    
    const dateKey = formatDateKey(selectedDate);
    if (scheduledTasks[dateKey] && scheduledTasks[dateKey][index]) {
        scheduledTasks[dateKey][index].completed = !scheduledTasks[dateKey][index].completed;
        saveScheduledTasks();
        renderSelectedDateTasks();
    }
}

// Delete scheduled task
function deleteScheduledTask(index) {
    if (!selectedDate) return;
    
    const dateKey = formatDateKey(selectedDate);
    if (scheduledTasks[dateKey]) {
        scheduledTasks[dateKey].splice(index, 1);
        if (scheduledTasks[dateKey].length === 0) {
            delete scheduledTasks[dateKey];
        }
        saveScheduledTasks();
        renderCalendar();
        renderSelectedDateTasks();
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Navigation
function navigateMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    renderCalendar();
}

// DOM Elements
const elements = {
    prevMonth: document.getElementById('prevMonth'),
    nextMonth: document.getElementById('nextMonth'),
    calendarGrid: document.getElementById('calendarGrid'),
    selectedDateTasks: document.getElementById('selectedDateTasks'),
    dateTaskInput: document.getElementById('dateTaskInput'),
    addDateTaskBtn: document.getElementById('addDateTaskBtn'),
    donationModal: document.getElementById('donationModal'),
    donationClose: document.getElementById('donationClose'),
    sidebarDonation: document.getElementById('sidebarDonation'),
    sidebarLogout: document.getElementById('sidebarLogout')
};

// Initialize
function init() {
    // Check authentication
    requireAuth();
    
    // Load user data
    const userId = getCurrentUserId();
    if (userId) {
        scheduledTasks = getUserScheduledTasks(userId);
    }
    
    // Render calendar
    renderCalendar();
    
    // Navigation
    elements.prevMonth.addEventListener('click', () => navigateMonth(-1));
    elements.nextMonth.addEventListener('click', () => navigateMonth(1));
    
    // Add task to date
    elements.addDateTaskBtn.addEventListener('click', () => {
        addTaskToDate(elements.dateTaskInput.value);
        elements.dateTaskInput.value = '';
    });
    
    elements.dateTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTaskToDate(elements.dateTaskInput.value);
            elements.dateTaskInput.value = '';
        }
    });
    
    // Task delegation in sidebar
    elements.selectedDateTasks.addEventListener('click', (e) => {
        const checkbox = e.target.closest('.task-checkbox');
        const deleteBtn = e.target.closest('.task-delete');
        
        if (checkbox) {
            toggleScheduledTask(parseInt(checkbox.dataset.index));
        } else if (deleteBtn) {
            deleteScheduledTask(parseInt(deleteBtn.dataset.index));
        }
    });
    
    // Donation modal
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

