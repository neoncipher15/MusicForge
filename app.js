/**
 * Focus Forge - Master Your Focus
 * Timer + Task Management with User Authentication
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
 * Get user's tasks
 */
function getUserTasks(userId) {
    const data = getUserData(userId);
    return data.tasks || [];
}

/**
 * Save user's tasks
 */
function saveUserTasks(userId, tasks) {
    const data = getUserData(userId);
    data.tasks = tasks;
    saveUserData(userId, data);
}

/**
 * Get user's sessions
 */
function getUserSessions(userId) {
    const data = getUserData(userId);
    return data.sessions || [];
}

/**
 * Save user's session
 */
function saveUserSessionData(userId, session) {
    const data = getUserData(userId);
    data.sessions.push(session);
    saveUserData(userId, data);
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

// ==========================================
// INTRO SCREEN FUNCTIONS
// ==========================================

/**
 * Check if this is the first visit today
 */
function isFirstVisitToday() {
    const userId = getCurrentUserId();
    if (!userId) return true;
    
    const today = new Date().toISOString().split('T')[0];
    const lastVisitKey = `focusForgeLastVisit_${userId}`;
    const lastVisit = localStorage.getItem(lastVisitKey);
    return lastVisit !== today;
}

/**
 * Get today's date string
 */
function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Store today's date as the last visit date
 */
function storeLastVisitDate() {
    const userId = getCurrentUserId();
    if (userId) {
        const lastVisitKey = `focusForgeLastVisit_${userId}`;
        localStorage.setItem(lastVisitKey, getTodayDate());
    }
}

/**
 * Type text character by character with cursor
 */
function typeText(text, element, duration = 1800) {
    return new Promise((resolve) => {
        const charCount = text.length;
        let currentIndex = 0;
        
        // Add cursor
        element.innerHTML = '<span class="typing-cursor"></span>';
        const cursor = element.querySelector('.typing-cursor');
        
        const typeChar = () => {
            if (currentIndex < charCount) {
                const span = document.createElement('span');
                span.textContent = text[currentIndex];
                cursor.before(span);
                currentIndex++;
                setTimeout(typeChar, duration / charCount);
            } else {
                resolve();
            }
        };
        
        typeChar();
    });
}

/**
 * Show the intro screen with typing animation
 */
async function showIntroScreen() {
    const overlay = document.getElementById('introOverlay');
    const textElement = document.getElementById('introText');
    const btnElement = document.getElementById('introBtn');
    
    if (!overlay || !textElement || !btnElement) {
        console.error('Intro screen elements not found');
        return;
    }
    
    // Show overlay
    overlay.classList.add('active');
    
    // Typing message with proper word spacing
    const message = "Lock in. One session at a time.";
    
    // Start typing animation
    await typeText(message, textElement, 1800);
    
    // Small pause after typing
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Fade in button
    btnElement.classList.add('visible');
}

/**
 * Hide the intro screen and store visit date
 */
function hideIntroScreen() {
    const overlay = document.getElementById('introOverlay');
    const btnElement = document.getElementById('introBtn');
    
    if (overlay) {
        // Fade out button first
        if (btnElement) {
            btnElement.classList.remove('visible');
        }
        
        // Fade out overlay
        overlay.classList.remove('active');
        
        // Remove overlay from DOM after animation
        setTimeout(() => {
            overlay.remove();
        }, 400);
    }
    
    // Store today's date
    storeLastVisitDate();
}

/**
 * Initialize intro screen logic
 */
async function initIntroScreen() {
    if (isFirstVisitToday()) {
        // Show intro screen
        await showIntroScreen();
        
        // Add click handler for the button
        const btnElement = document.getElementById('introBtn');
        if (btnElement) {
            btnElement.addEventListener('click', hideIntroScreen);
        }
    } else {
        // Already visited today, remove overlay from DOM if it exists
        const overlay = document.getElementById('introOverlay');
        if (overlay) {
            overlay.remove();
        }
    }
}

// ==========================================
// APP STATE & DATA
// ==========================================

// Task storage - per user
let tasks = [];

// App State
const state = {
    soundEnabled: true,
    updateInterval: null
};

// ==========================================
// DOM ELEMENTS
// ==========================================

const elements = {
    timerMinutes: document.getElementById('timerMinutes'),
    timerSeconds: document.getElementById('timerSeconds'),
    timerRing: document.getElementById('timerRing'),
    timerRingContainer: document.querySelector('.timer-ring-container'),
    playBtn: document.getElementById('playBtn'),
    playIcon: document.querySelector('.play-icon'),
    pauseIcon: document.querySelector('.pause-icon'),
    resetBtn: document.getElementById('resetBtn'),
    soundBtn: document.getElementById('soundBtn'),
    soundOn: document.querySelector('.sound-on'),
    soundOff: document.querySelector('.sound-off'),
    presetBtns: document.querySelectorAll('.preset-btn'),
    taskInput: document.getElementById('taskInput'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    taskList: document.getElementById('taskList'),
    completedCount: document.getElementById('completedCount'),
    totalCount: document.getElementById('totalCount'),
    modal: document.getElementById('customTimerModal'),
    customHours: document.getElementById('customHours'),
    customMinutes: document.getElementById('customMinutes'),
    customSeconds: document.getElementById('customSeconds'),
    cancelTimer: document.getElementById('cancelTimer'),
    setTimer: document.getElementById('setTimer'),
    donationBtn: document.getElementById('donationBtn'),
    donationModal: document.getElementById('donationModal'),
    donationClose: document.getElementById('donationClose'),
    sidebarDonation: document.getElementById('sidebarDonation'),
    sidebarLogout: document.getElementById('sidebarLogout')
};

// ==========================================
// TIMER FUNCTIONS (using shared Timer module)
// ==========================================

function updateTimerDisplay() {
    const timerState = Timer.getState();
    const formatted = Timer.formatTime(timerState.timeRemaining);
    elements.timerMinutes.textContent = formatted.minutes;
    elements.timerSeconds.textContent = formatted.seconds;
}

function updateTimerRing() {
    const progress = Timer.getProgress();
    const circumference = 2 * Math.PI * 90;
    const offset = circumference * (1 - Math.min(progress, 1));
    elements.timerRing.style.strokeDashoffset = offset;
}

function updatePlayButton() {
    const isRunning = Timer.isRunning();
    if (isRunning) {
        elements.playIcon.style.display = 'none';
        elements.pauseIcon.style.display = 'block';
    } else {
        elements.playIcon.style.display = 'block';
        elements.pauseIcon.style.display = 'none';
    }
}

function toggleTimer() {
    const timerState = Timer.getState();
    
    if (timerState.isRunning) {
        Timer.stop();
    } else {
        // Check if timer is at start (not completed yet)
        if (timerState.timeRemaining <= 0) {
            // Timer completed, reset and start fresh
            const userId = getCurrentUserId();
            const settings = userId ? getUserSettings(userId) : { timerDuration: 25 };
            const duration = (settings.timerDuration || 25) * 60;
            Timer.setDuration(duration);
        }
        Timer.start();
    }
    updateTimerDisplay();
    updatePlayButton();
}

function resetTimer() {
    const userId = getCurrentUserId();
    const settings = userId ? getUserSettings(userId) : { timerDuration: 25 };
    const duration = (settings.timerDuration || 25) * 60;
    Timer.reset();
    Timer.setDuration(duration);
    updateTimerDisplay();
    updateTimerRing();
    updatePlayButton();
}

function setTimer(minutes, seconds = 0) {
    const totalSeconds = minutes * 60 + seconds;
    Timer.setDuration(totalSeconds);
    updateTimerDisplay();
    updateTimerRing();
    
    // Update preset buttons
    elements.presetBtns.forEach(btn => {
        const btnMinutes = parseInt(btn.dataset.time);
        btn.classList.toggle('active', btnMinutes === minutes && seconds === 0);
    });
}

function showTimerComplete() {
    // Play completion sound
    playSessionCompleteSound();
    
    // Save session data for analytics
    saveSessionData();
    
    const notification = document.createElement('div');
    notification.className = 'complete-notification';
    notification.textContent = '⏱️ Session Complete!';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
    
    // Update play button
    updatePlayButton();
}

// Save session data to user-specific storage
function saveSessionData() {
    const userId = getCurrentUserId();
    if (!userId) return;
    
    const timerState = Timer.getState();
    const session = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        duration: Math.floor(timerState.totalTime / 60), // in minutes
        completedAt: new Date().toISOString()
    };
    
    saveUserSessionData(userId, session);
}

// ==========================================
// SOUND FUNCTIONS
// ==========================================

function playSessionCompleteSound() {
    const userId = getCurrentUserId();
    const settings = userId ? getUserSettings(userId) : { soundEnabled: true };
    
    if (!settings.soundEnabled) return;
    
    // Create audio context
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const audioCtx = new AudioContext();
    
    // Create a pleasant chime with multiple harmonics
    const now = audioCtx.currentTime;
    
    // Main tone - C5 note
    const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    frequencies.forEach((freq, index) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, now);
        
        // Staggered envelope for each note
        const startTime = now + index * 0.15;
        const attackTime = 0.05;
        const decayTime = 1.5;
        const sustainLevel = 0.1;
        const releaseTime = 1.0;
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + attackTime);
        gainNode.gain.linearRampToValueAtTime(sustainLevel, startTime + attackTime + decayTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + attackTime + decayTime + releaseTime);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + attackTime + decayTime + releaseTime + 0.1);
    });
}

function toggleSound() {
    const userId = getCurrentUserId();
    const settings = getUserSettings(userId);
    const newSoundEnabled = !settings.soundEnabled;
    saveUserSettings(userId, { soundEnabled: newSoundEnabled });
    state.soundEnabled = newSoundEnabled;
    updateSoundButton();
}

function updateSoundButton() {
    if (elements.soundBtn) {
        const userId = getCurrentUserId();
        const settings = userId ? getUserSettings(userId) : { soundEnabled: true };
        
        if (settings.soundEnabled !== false) {
            elements.soundBtn.classList.remove('muted');
            elements.soundOn.style.display = 'block';
            elements.soundOff.style.display = 'none';
        } else {
            elements.soundBtn.classList.add('muted');
            elements.soundOn.style.display = 'none';
            elements.soundOff.style.display = 'block';
        }
    }
}

// ==========================================
// TASK FUNCTIONS
// ==========================================

function saveTasks() {
    const userId = getCurrentUserId();
    if (userId) {
        saveUserTasks(userId, tasks);
    }
}

function renderTasks() {
    elements.taskList.innerHTML = '';
    
    tasks.forEach((task, index) => {
        const taskEl = document.createElement('div');
        taskEl.className = `task-item${task.completed ? ' completed' : ''}`;
        taskEl.innerHTML = `
            <div class="task-checkbox${task.completed ? ' checked' : ''}" data-index="${index}">
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
        `;
        elements.taskList.appendChild(taskEl);
    });
    
    updateTaskStats();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateTaskStats() {
    const completed = tasks.filter(t => t.completed).length;
    elements.completedCount.textContent = completed;
    elements.totalCount.textContent = tasks.length;
}

function addTask(text) {
    if (text.trim()) {
        tasks.push({ text: text.trim(), completed: false });
        saveTasks();
        renderTasks();
    }
}

function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function initEventListeners() {
    // Play/Pause
    elements.playBtn.addEventListener('click', toggleTimer);
    
    // Reset timer
    if (elements.resetBtn) {
        elements.resetBtn.addEventListener('click', resetTimer);
    }
    
    // Sound toggle
    if (elements.soundBtn) {
        elements.soundBtn.addEventListener('click', toggleSound);
    }
    
    // Preset buttons
    elements.presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setTimer(parseInt(btn.dataset.time));
        });
    });
    
    // Custom timer modal
    elements.timerRingContainer.addEventListener('click', () => {
        const timerState = Timer.getState();
        const totalSeconds = timerState.totalTime;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        elements.customHours.value = hours;
        elements.customMinutes.value = minutes;
        elements.customSeconds.value = seconds;
        
        elements.modal.classList.add('active');
    });
    
    elements.cancelTimer.addEventListener('click', () => {
        elements.modal.classList.remove('active');
    });
    
    elements.setTimer.addEventListener('click', () => {
        const hours = parseInt(elements.customHours.value) || 0;
        const minutes = parseInt(elements.customMinutes.value) || 0;
        const seconds = parseInt(elements.customSeconds.value) || 0;
        
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        if (totalSeconds > 0) {
            Timer.setDuration(totalSeconds);
            updateTimerDisplay();
            updateTimerRing();
            
            // Update presets
            elements.presetBtns.forEach(btn => btn.classList.remove('active'));
        }
        
        elements.modal.classList.remove('active');
    });
    
    // Close modal on backdrop click
    elements.modal.addEventListener('click', (e) => {
        if (e.target === elements.modal) {
            elements.modal.classList.remove('active');
        }
    });
    
    // Task input
    elements.addTaskBtn.addEventListener('click', () => {
        addTask(elements.taskInput.value);
        elements.taskInput.value = '';
    });
    
    elements.taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask(elements.taskInput.value);
            elements.taskInput.value = '';
        }
    });
    
    // Task delegation
    elements.taskList.addEventListener('click', (e) => {
        const checkbox = e.target.closest('.task-checkbox');
        const deleteBtn = e.target.closest('.task-delete');
        
        if (checkbox) {
            toggleTask(parseInt(checkbox.dataset.index));
        } else if (deleteBtn) {
            deleteTask(parseInt(deleteBtn.dataset.index));
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;
        
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                toggleTimer();
                break;
        }
    });
    
    // Donation modal
    if (elements.donationBtn) {
        elements.donationBtn.addEventListener('click', () => {
            elements.donationModal.classList.add('active');
        });
    }
    
    // Sidebar donation trigger
    if (elements.sidebarDonation) {
        elements.sidebarDonation.addEventListener('click', () => {
            elements.donationModal.classList.add('active');
        });
    }
    
    // Logout button
    if (elements.sidebarLogout) {
        elements.sidebarLogout.addEventListener('click', logoutUser);
    }
    
    elements.donationClose.addEventListener('click', () => {
        elements.donationModal.classList.remove('active');
    });
    
    elements.donationModal.addEventListener('click', (e) => {
        if (e.target === elements.donationModal) {
            elements.donationModal.classList.remove('active');
        }
    });
}

// ==========================================
// INITIALIZATION
// ==========================================

async function init() {
    // Check authentication - redirect to login if not logged in
    requireAuth();
    
    // Load user data
    const userId = getCurrentUserId();
    if (userId) {
        tasks = getUserTasks(userId);
        
        // Load user settings
        const settings = getUserSettings(userId);
        if (settings) {
            state.soundEnabled = settings.soundEnabled !== false;
        }
    }
    
    // Initialize intro screen first (waits for completion if first visit today)
    await initIntroScreen();
    
    // Initialize timer display
    updateTimerDisplay();
    updateTimerRing();
    updatePlayButton();
    
    // Update timer display every second
    state.updateInterval = setInterval(() => {
        const timerState = Timer.getState();
        
        // Check if timer completed
        if (timerState.timeRemaining <= 0 && timerState.isRunning) {
            Timer.stop();
            showTimerComplete();
        }
        
        updateTimerDisplay();
        updatePlayButton();
    }, 1000);
    
    initEventListeners();
    renderTasks();
    updateSoundButton();
}

// Start
document.addEventListener('DOMContentLoaded', init);

