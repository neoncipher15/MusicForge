
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
    volume: 0.5
};

// DOM Elements
const elements = {
    timerMinutes: document.getElementById('timerMinutes'),
    timerSeconds: document.getElementById('timerSeconds'),
    timerRing: document.getElementById('timerRing'),
    timerRingContainer: document.querySelector('.timer-ring-container'),
    playBtn: document.getElementById('playBtn'),
    playIcon: document.querySelector('.play-icon'),
    pauseIcon: document.querySelector('.pause-icon'),
    presetBtns: document.querySelectorAll('.preset-btn'),
    taskInput: document.getElementById('taskInput'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    taskList: document.getElementById('taskList'),
    completedCount: document.getElementById('completedCount'),
    totalCount: document.getElementById('totalCount'),
    volumeSlider: document.getElementById('volumeSlider'),
    modal: document.getElementById('customTimerModal'),
    customHours: document.getElementById('customHours'),
    customMinutes: document.getElementById('customMinutes'),
    customSeconds: document.getElementById('customSeconds'),
    cancelTimer: document.getElementById('cancelTimer'),
    setTimer: document.getElementById('setTimer')
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
    const notification = document.createElement('div');
    notification.className = 'complete-notification';
    notification.textContent = '⏱️ Session Complete!';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
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
    
    // Volume (placeholder - can be used for future features)
    elements.volumeSlider.addEventListener('input', (e) => {
        state.volume = e.target.value / 100;
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
}

// Initialize
function init() {
    initEventListeners();
    updateTimerDisplay();
    updateTimerRing();
    renderTasks();
}

// Start
document.addEventListener('DOMContentLoaded', init);

