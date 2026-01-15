
/**
 * Focus Forge - Master Your Focus
 * Timer + Task Management
 */

// Task storage
let tasks = JSON.parse(localStorage.getItem('focusForgeTasks')) || [];

// App State
const state = {
    timerTime: 25 * 60,
    timerTotal: 25 * 60,
    timerInterval: null,
    isTimerRunning: false,
    volume: 0.5,
    soundEnabled: JSON.parse(localStorage.getItem('focusForgeSound')) !== false
};

// ==========================================
// INTRO SCREEN FUNCTIONS
// ==========================================

/**
 * Check if this is the first visit today
 * @returns {boolean} true if user hasn't visited today
 */
function isFirstVisitToday() {
    const today = new Date().toISOString().split('T')[0];
    const lastVisit = localStorage.getItem('focusForgeLastVisit');
    return lastVisit !== today;
}

/**
 * Get today's date string
 * @returns {string} ISO date string (YYYY-MM-DD)
 */
function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Store today's date as the last visit date
 */
function storeLastVisitDate() {
    localStorage.setItem('focusForgeLastVisit', getTodayDate());
}

/**
 * Type text character by character with cursor
 * @param {string} text - Text to type
 * @param {HTMLElement} element - Element to display text
 * @param {number} duration - Total duration in ms
 * @returns {Promise} Resolves when typing is complete
 */
function typeText(text, element, duration = 1800) {
    return new Promise((resolve) => {
        const charCount = text.length;
        const charsPerMs = charCount / duration;
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

// DOM Elements
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
    sidebarDonation: document.getElementById('sidebarDonation')
};

// Timer Functions
function updateTimerDisplay() {
    const minutes = Math.floor(state.timerTime / 60);
    const seconds = state.timerTime % 60;
    elements.timerMinutes.textContent = minutes.toString().padStart(2, '0');
    elements.timerSeconds.textContent = seconds.toString().padStart(2, '0');
}

function updateTimerRing() {
    const circumference = 2 * Math.PI * 90;
    const progress = state.timerTotal > 0 ? (state.timerTotal - state.timerTime) / state.timerTotal : 0;
    const offset = circumference * (1 - Math.min(progress, 1));
    elements.timerRing.style.strokeDashoffset = offset;
}

function startTimer() {
    clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
        if (state.timerTime > 0) {
            state.timerTime--;
            updateTimerDisplay();
            updateTimerRing();
        } else {
            // Timer complete
            clearInterval(state.timerInterval);
            state.isTimerRunning = false;
            updatePlayButton();
            showTimerComplete();
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(state.timerInterval);
}

function setTimer(minutes, seconds = 0) {
    stopTimer();
    state.timerTime = minutes * 60 + seconds;
    state.timerTotal = state.timerTime;
    updateTimerDisplay();
    updateTimerRing();
    
    // Update preset buttons
    elements.presetBtns.forEach(btn => {
        const btnMinutes = parseInt(btn.dataset.time);
        btn.classList.toggle('active', btnMinutes === minutes && seconds === 0);
    });
}

function toggleTimer() {
    if (state.isTimerRunning) {
        // Stop
        stopTimer();
        state.isTimerRunning = false;
    } else {
        // Start
        startTimer();
        state.isTimerRunning = true;
    }
    updatePlayButton();
}

function updatePlayButton() {
    if (state.isTimerRunning) {
        elements.playIcon.style.display = 'none';
        elements.pauseIcon.style.display = 'block';
    } else {
        elements.playIcon.style.display = 'block';
        elements.pauseIcon.style.display = 'none';
    }
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
}

// Save session data to localStorage for analytics
function saveSessionData() {
    const sessions = JSON.parse(localStorage.getItem('focusForgeSessions')) || [];
    const session = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        duration: Math.floor(state.timerTotal / 60), // in minutes
        completedAt: new Date().toISOString()
    };
    sessions.push(session);
    localStorage.setItem('focusForgeSessions', JSON.stringify(sessions));
}

// Sound Functions
function playSessionCompleteSound() {
    if (!state.soundEnabled) return;
    
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
    state.soundEnabled = !state.soundEnabled;
    localStorage.setItem('focusForgeSound', state.soundEnabled);
    updateSoundButton();
}

function resetTimer() {
    stopTimer();
    state.isTimerRunning = false;
    state.timerTime = state.timerTotal;
    updateTimerDisplay();
    updateTimerRing();
    updatePlayButton();
}

function updateSoundButton() {
    if (elements.soundBtn) {
        if (state.soundEnabled) {
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

// Task Functions
function saveTasks() {
    localStorage.setItem('focusForgeTasks', JSON.stringify(tasks));
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

// Event Listeners
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
        const totalSeconds = state.timerTotal;
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
            stopTimer();
            state.timerTime = totalSeconds;
            state.timerTotal = totalSeconds;
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
    
    elements.donationClose.addEventListener('click', () => {
        elements.donationModal.classList.remove('active');
    });
    
    elements.donationModal.addEventListener('click', (e) => {
        if (e.target === elements.donationModal) {
            elements.donationModal.classList.remove('active');
        }
    });
}

// Initialize
async function init() {
    // Initialize intro screen first (waits for completion if first visit today)
    await initIntroScreen();
    
    initEventListeners();
    updateTimerDisplay();
    updateTimerRing();
    renderTasks();
    updateSoundButton();
}

// Start
document.addEventListener('DOMContentLoaded', init);

