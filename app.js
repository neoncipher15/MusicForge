
/**
 * Focus Forge - Master Your Focus
 * Timer + Task Management with Ambient Audio
 */

// Task storage
let tasks = JSON.parse(localStorage.getItem('focusForgeTasks')) || [];

// App State
const state = {
    timerTime: 25 * 60,
    timerTotal: 25 * 60,
    timerInterval: null,
    isTimerRunning: false,
    currentCategory: 'focus',
    volume: 0.5,
    audioContext: null,
    audioNodes: []
};

// Category sound configurations
const CATEGORY_CONFIGS = {
    'focus': { baseFreq: 110, beatFreq: 7, noiseType: null },
    'relax': { baseFreq: 130.81, beatFreq: 6, noiseType: 'pink' },
    'sleep': { baseFreq: 98, beatFreq: 2, noiseType: 'brown' },
    'meditate': { baseFreq: 146.83, beatFreq: 5, noiseType: 'pink' },
    'power': { baseFreq: 87.31, beatFreq: 3, noiseType: 'brown' }
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
    categories: document.querySelectorAll('.category'),
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

// Initialize Audio Context
function initAudioContext() {
    if (!state.audioContext) {
        state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        state.masterGain = state.audioContext.createGain();
        state.masterGain.gain.value = state.volume;
        state.masterGain.connect(state.audioContext.destination);
    }
    if (state.audioContext.state === 'suspended') {
        state.audioContext.resume();
    }
}

// Generate noise buffers
function createPinkNoise() {
    const bufferSize = 4 * state.audioContext.sampleRate;
    const buffer = state.audioContext.createBuffer(1, bufferSize, state.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.11;
        b6 = white * 0.115926;
    }
    
    return buffer;
}

function createBrownNoise() {
    const bufferSize = 4 * state.audioContext.sampleRate;
    const buffer = state.audioContext.createBuffer(1, bufferSize, state.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    let lastOut = 0;
    
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
    }
    
    return buffer;
}

// Create ambient audio
function createAmbientAudio(category) {
    initAudioContext();
    
    const config = CATEGORY_CONFIGS[category];
    const nodes = [];
    
    // Binaural beat oscillators
    const osc1 = state.audioContext.createOscillator();
    const osc2 = state.audioContext.createOscillator();
    const gain1 = state.audioContext.createGain();
    const gain2 = state.audioContext.createGain();
    const panner1 = state.audioContext.createStereoPanner();
    const panner2 = state.audioContext.createStereoPanner();
    
    osc1.frequency.value = config.baseFreq;
    osc2.frequency.value = config.baseFreq + config.beatFreq;
    osc1.type = 'sine';
    osc2.type = 'sine';
    
    panner1.pan.value = -1;
    panner2.pan.value = 1;
    gain1.gain.value = 0.15;
    gain2.gain.value = 0.15;
    
    osc1.connect(gain1);
    gain1.connect(panner1);
    panner1.connect(state.masterGain);
    
    osc2.connect(gain2);
    gain2.connect(panner2);
    panner2.connect(state.masterGain);
    
    osc1.start();
    osc2.start();
    
    nodes.push(osc1, osc2, gain1, gain2, panner1, panner2);
    
    // Harmonic
    const harmonic = state.audioContext.createOscillator();
    const harmonicGain = state.audioContext.createGain();
    
    harmonic.frequency.value = config.baseFreq * 2;
    harmonic.type = 'sine';
    harmonicGain.gain.value = 0.05;
    
    harmonic.connect(harmonicGain);
    harmonicGain.connect(state.masterGain);
    harmonic.start();
    
    nodes.push(harmonic, harmonicGain);
    
    // Noise if configured
    if (config.noiseType) {
        const noiseBuffer = config.noiseType === 'brown' ? createBrownNoise() : createPinkNoise();
        const noiseSource = state.audioContext.createBufferSource();
        const noiseGain = state.audioContext.createGain();
        const noiseFilter = state.audioContext.createBiquadFilter();
        
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.value = config.noiseType === 'brown' ? 400 : 600;
        noiseGain.gain.value = config.noiseType === 'brown' ? 0.1 : 0.08;
        
        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(state.masterGain);
        
        noiseSource.start();
        
        nodes.push(noiseSource, noiseFilter, noiseGain);
    }
    
    return nodes;
}

function startAudio() {
    if (state.audioNodes.length > 0) return;
    state.audioNodes = createAmbientAudio(state.currentCategory);
    
    const startTime = state.audioContext.currentTime;
    state.masterGain.gain.setValueAtTime(0, startTime);
    state.masterGain.gain.linearRampToValueAtTime(state.volume, startTime + 2);
}

function stopAudio() {
    if (state.audioNodes.length > 0) {
        const startTime = state.audioContext.currentTime;
        state.masterGain.gain.linearRampToValueAtTime(0, startTime + 1);
        
        setTimeout(() => {
            state.audioNodes.forEach(node => {
                try {
                    if (node.stop) node.stop();
                    if (node.disconnect) node.disconnect();
                } catch (e) {}
            });
            state.audioNodes = [];
        }, 1100);
    }
}

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
            stopAudio();
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
        stopAudio();
        state.isTimerRunning = false;
    } else {
        // Start
        startAudio();
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
    }, 4000);
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
    
    // Category selection
    elements.categories.forEach(cat => {
        cat.addEventListener('click', () => {
            const category = cat.dataset.category;
            
            // Update active state
            elements.categories.forEach(c => c.classList.remove('active'));
            cat.classList.add('active');
            
            // Update audio
            state.currentCategory = category;
            if (state.isTimerRunning) {
                stopAudio();
                startAudio();
            }
        });
    });
    
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
    
    // Volume
    elements.volumeSlider.addEventListener('input', (e) => {
        state.volume = e.target.value / 100;
        if (state.masterGain) {
            state.masterGain.gain.value = state.volume;
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

