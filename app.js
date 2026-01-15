/**
 * Focus Forge - Master Your Focus
 * Timer + Task Management (No login required)
 */

// ==========================================
// INTRO SCREEN FUNCTIONS
// ==========================================

/**
 * Check if this is the first visit today
 */
function isFirstVisitToday() {
    const today = new Date().toISOString().split('T')[0];
    const lastVisit = localStorage.getItem('focusForgeLastVisit');
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
    localStorage.setItem('focusForgeLastVisit', getTodayDate());
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
// TASK FUNCTIONS
// ==========================================

// Task storage
let tasks = JSON.parse(localStorage.getItem('focusForgeTasks')) || [];

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('focusForgeTasks', JSON.stringify(tasks));
}

// Add a new task
function addTask(text) {
    if (text.trim()) {
        tasks.push({ 
            text: text.trim(), 
            completed: false,
            createdAt: new Date().toISOString()
        });
        saveTasks();
        renderTasks();
    }
}

// Toggle task completion
function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
}

// Delete a task
function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
}

// Render tasks in the DOM
function renderTasks() {
    const taskList = document.getElementById('taskList');
    if (!taskList) return;
    
    taskList.innerHTML = '';
    
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
        taskList.appendChild(taskEl);
    });
    
    updateTaskStats();
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Update task stats
function updateTaskStats() {
    const completed = tasks.filter(t => t.completed).length;
    const completedEl = document.getElementById('completedCount');
    const totalEl = document.getElementById('totalCount');
    
    if (completedEl) completedEl.textContent = completed;
    if (totalEl) totalEl.textContent = tasks.length;
}

// ==========================================
// AUDIO CATEGORIES SYSTEM
// ==========================================

// Audio categories configuration
const AUDIO_CATEGORIES = {
    focus: {
        name: 'Focus',
        description: 'Enhance concentration and mental clarity',
        waveType: 'Gamma Waves - 40Hz',
        baseFreq: 200,
        beatFreq: 40,
        color: '#667eea',
        hasNoise: false
    },
    relax: {
        name: 'Relax',
        description: 'Reduce stress and promote calm',
        waveType: 'Alpha Waves - 7Hz',
        baseFreq: 180,
        beatFreq: 7,
        color: '#43e97b',
        hasNoise: false
    },
    sleep: {
        name: 'Sleep',
        description: 'Deep sleep and restoration',
        waveType: 'Delta Waves - 2Hz',
        baseFreq: 160,
        beatFreq: 2,
        color: '#1a1a2e',
        hasNoise: true,
        noiseType: 'pink'
    },
    meditate: {
        name: 'Meditate',
        description: 'Deep meditation and mindfulness',
        waveType: 'Theta Waves - 6Hz',
        baseFreq: 170,
        beatFreq: 6,
        color: '#f77f00',
        hasNoise: false
    },
    'power-nap': {
        name: 'Power Nap',
        description: 'Quick rest and rejuvenation',
        waveType: 'Theta/Delta - 4Hz',
        baseFreq: 165,
        beatFreq: 4,
        color: '#e1306c',
        hasNoise: true,
        noiseType: 'brown'
    }
};

// Audio state
const audioState = {
    context: null,
    masterGain: null,
    analyser: null,
    isPlaying: false,
    currentCategory: 'focus',
    volume: 0.5,
    oscillators: [],
    noiseNode: null,
    noiseGain: null,
    leftPanner: null,
    rightPanner: null
};

// Initialize audio context
function initAudio() {
    if (audioState.context) return;
    
    try {
        audioState.context = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create master gain node
        audioState.masterGain = audioState.context.createGain();
        audioState.masterGain.connect(audioState.context.destination);
        
        // Create analyser for visualizer
        audioState.analyser = audioState.context.createAnalyser();
        audioState.analyser.fftSize = 2048;
        audioState.masterGain.connect(audioState.analyser);
        
        // Load saved preferences
        const savedCategory = localStorage.getItem('focusForgeAudioCategory');
        const savedVolume = localStorage.getItem('focusForgeAudioVolume');
        
        if (savedCategory && AUDIO_CATEGORIES[savedCategory]) {
            audioState.currentCategory = savedCategory;
        }
        
        if (savedVolume !== null) {
            audioState.volume = parseFloat(savedVolume);
        }
        
        // Update UI
        updateCategorySelection();
        updateVolumeUI();
        
    } catch (error) {
        console.error('Failed to initialize audio:', error);
    }
}

// Create binaural beat oscillators
function createBinauralBeat(category) {
    const config = AUDIO_CATEGORIES[category];
    const ctx = audioState.context;
    
    // Create left oscillator (base frequency)
    const leftOsc = ctx.createOscillator();
    leftOsc.type = 'sine';
    leftOsc.frequency.setValueAtTime(config.baseFreq, ctx.currentTime);
    
    // Create right oscillator (base + beat frequency for binaural effect)
    const rightOsc = ctx.createOscillator();
    rightOsc.type = 'sine';
    rightOsc.frequency.setValueAtTime(config.baseFreq + config.beatFreq, ctx.currentTime);
    
    // Create stereo panners
    const leftPanner = ctx.createStereoPanner();
    leftPanner.pan.setValueAtTime(-1, ctx.currentTime); // Full left
    
    const rightPanner = ctx.createStereoPanner();
    rightPanner.pan.setValueAtTime(1, ctx.currentTime); // Full right
    
    // Create gain nodes for fade control
    const leftGain = ctx.createGain();
    const rightGain = ctx.createGain();
    
    // Initial gain (will be faded in)
    leftGain.gain.setValueAtTime(0, ctx.currentTime);
    rightGain.gain.setValueAtTime(0, ctx.currentTime);
    
    // Connect nodes
    leftOsc.connect(leftGain);
    leftGain.connect(leftPanner);
    leftPanner.connect(audioState.masterGain);
    
    rightOsc.connect(rightGain);
    rightGain.connect(rightPanner);
    rightPanner.connect(audioState.masterGain);
    
    // Start oscillators
    leftOsc.start();
    rightOsc.start();
    
    // Store references
    audioState.oscillators = [leftOsc, rightOsc];
    audioState.leftGain = leftGain;
    audioState.rightGain = rightGain;
    audioState.leftPanner = leftPanner;
    audioState.rightPanner = rightPanner;
    
    // Fade in
    fadeInAudio();
}

// Create noise layer for sleep/power nap
function createNoiseLayer(noiseType) {
    const ctx = audioState.context;
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    if (noiseType === 'pink') {
        // Pink noise approximation
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            output[i] *= 0.11;
            b6 = white * 0.115926;
        }
    } else {
        // Brown noise
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5;
        }
    }
    
    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, ctx.currentTime);
    
    noiseNode.connect(noiseGain);
    noiseGain.connect(audioState.masterGain);
    
    noiseNode.start();
    
    audioState.noiseNode = noiseNode;
    audioState.noiseGain = noiseGain;
}

// Start audio playback
function playAudio() {
    if (!audioState.context) {
        initAudio();
    }
    
    if (audioState.context.state === 'suspended') {
        audioState.context.resume();
    }
    
    // Stop any existing audio
    stopAudio();
    
    const category = audioState.currentCategory;
    const config = AUDIO_CATEGORIES[category];
    
    // Create binaural beats
    createBinauralBeat(category);
    
    // Add noise if needed
    if (config.hasNoise) {
        createNoiseLayer(config.noiseType || 'pink');
        // Fade in noise after a short delay
        setTimeout(() => {
            if (audioState.noiseGain) {
                audioState.noiseGain.gain.linearRampToValueAtTime(0.15, audioState.context.currentTime + 2);
            }
        }, 1000);
    }
    
    audioState.isPlaying = true;
    updateAudioPlayButton();
    
    // Start visualizer
    startVisualizer();
}

// Stop audio playback
function stopAudio() {
    if (!audioState.context) return;
    
    // Fade out
    fadeOutAudio();
    
    // Stop visualizer
    stopVisualizer();
    
    // Stop oscillators after fade
    setTimeout(() => {
        audioState.oscillators.forEach(osc => {
            try {
                osc.stop();
                osc.disconnect();
            } catch (e) {}
        });
        audioState.oscillators = [];
        
        if (audioState.noiseNode) {
            try {
                audioState.noiseNode.stop();
                audioState.noiseNode.disconnect();
            } catch (e) {}
            audioState.noiseNode = null;
            audioState.noiseGain = null;
        }
    }, 2500);
    
    audioState.isPlaying = false;
    updateAudioPlayButton();
}

// Fade in audio
function fadeInAudio() {
    const ctx = audioState.context;
    const now = ctx.currentTime;
    const duration = 2;
    
    if (audioState.leftGain) {
        audioState.leftGain.gain.linearRampToValueAtTime(0.3, now + duration);
        audioState.rightGain.gain.linearRampToValueAtTime(0.3, now + duration);
    }
}

// Fade out audio
function fadeOutAudio() {
    const ctx = audioState.context;
    const now = ctx.currentTime;
    const duration = 2;
    
    if (audioState.leftGain) {
        audioState.leftGain.gain.linearRampToValueAtTime(0, now + duration);
        audioState.rightGain.gain.linearRampToValueAtTime(0, now + duration);
    }
    
    if (audioState.noiseGain) {
        audioState.noiseGain.gain.linearRampToValueAtTime(0, now + duration);
    }
}

// Toggle audio playback
function toggleAudio() {
    if (audioState.isPlaying) {
        stopAudio();
    } else {
        playAudio();
    }
}

// Set audio volume
function setAudioVolume(value) {
    audioState.volume = value;
    
    if (audioState.masterGain) {
        audioState.masterGain.gain.setValueAtTime(value, audioState.context.currentTime);
    }
    
    // Save preference
    localStorage.setItem('focusForgeAudioVolume', value.toString());
    
    updateVolumeUI();
}

// Select audio category
function selectCategory(category) {
    if (!AUDIO_CATEGORIES[category]) return;
    
    audioState.currentCategory = category;
    
    // Save preference
    localStorage.setItem('focusForgeAudioCategory', category);
    
    // Update UI
    updateCategorySelection();
    updateCategoryInfo();
    
    // If playing, restart with new category
    if (audioState.isPlaying) {
        playAudio();
    }
}

// Update category selection UI
function updateCategorySelection() {
    document.querySelectorAll('.category-card').forEach(card => {
        card.classList.remove('active');
        if (card.dataset.category === audioState.currentCategory) {
            card.classList.add('active');
        }
    });
}

// Update category info display
function updateCategoryInfo() {
    const config = AUDIO_CATEGORIES[audioState.currentCategory];
    const titleEl = document.getElementById('categoryTitle');
    const descEl = document.getElementById('categoryDesc');
    const waveEl = document.getElementById('waveType');
    
    if (titleEl) titleEl.textContent = config.name;
    if (descEl) descEl.textContent = config.description;
    if (waveEl) waveEl.textContent = config.waveType;
}

// Update audio play button
function updateAudioPlayButton() {
    const btn = document.getElementById('audioPlayBtn');
    const playIcon = btn?.querySelector('.audio-play-icon');
    const pauseIcon = btn?.querySelector('.audio-pause-icon');
    
    if (btn && playIcon && pauseIcon) {
        if (audioState.isPlaying) {
            btn.classList.add('playing');
        } else {
            btn.classList.remove('playing');
        }
    }
}

// Update volume UI
function updateVolumeUI() {
    const slider = document.getElementById('volumeSlider');
    const btn = document.getElementById('volumeBtn');
    
    if (slider) {
        slider.value = audioState.volume * 100;
    }
    
    if (btn) {
        if (audioState.volume === 0) {
            btn.classList.add('muted');
        } else {
            btn.classList.remove('muted');
        }
    }
}

// Toggle mute
function toggleMute() {
    if (audioState.volume > 0) {
        audioState.previousVolume = audioState.volume;
        setAudioVolume(0);
    } else {
        setAudioVolume(audioState.previousVolume || 0.5);
    }
}

// ==========================================
// AUDIO VISUALIZER
// ==========================================

let visualizerAnimationId = null;
let visualizerCanvas = null;
let visualizerCtx = null;

// ==========================================
// TIMER STATE
// ==========================================

const state = {
    timerTime: 25 * 60,
    timerTotal: 25 * 60,
    timerInterval: null,
    isTimerRunning: false,
    soundEnabled: JSON.parse(localStorage.getItem('focusForgeSound')) !== false
};

function initVisualizer() {
    visualizerCanvas = document.getElementById('audioVisualizer');
    if (!visualizerCanvas) return;
    
    visualizerCtx = visualizerCanvas.getContext('2d');
    resizeVisualizer();
    
    window.addEventListener('resize', resizeVisualizer);
}

function resizeVisualizer() {
    if (!visualizerCanvas) return;
    
    const container = visualizerCanvas.parentElement;
    visualizerCanvas.width = container.offsetWidth || 800;
    visualizerCanvas.height = container.offsetHeight || 400;
}

function startVisualizer() {
    if (!audioState.analyser || visualizerAnimationId) return;
    
    drawVisualizer();
}

function stopVisualizer() {
    if (visualizerAnimationId) {
        cancelAnimationFrame(visualizerAnimationId);
        visualizerAnimationId = null;
    }
    
    // Clear canvas
    if (visualizerCtx && visualizerCanvas) {
        visualizerCtx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
    }
}

function drawVisualizer() {
    if (!visualizerCtx || !visualizerCanvas || !audioState.analyser) return;
    
    const width = visualizerCanvas.width;
    const height = visualizerCanvas.height;
    
    // Get audio data
    const bufferLength = audioState.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    if (audioState.isPlaying) {
        audioState.analyser.getByteTimeDomainData(dataArray);
    } else {
        // Generate idle waveform
        for (let i = 0; i < bufferLength; i++) {
            dataArray[i] = 128 + Math.sin(i * 0.01) * 10;
        }
    }
    
    // Clear canvas
    visualizerCtx.clearRect(0, 0, width, height);
    
    // Get category color
    const config = AUDIO_CATEGORIES[audioState.currentCategory];
    const baseColor = config ? config.color : '#667eea';
    
    // Draw waveform
    visualizerCtx.lineWidth = 2;
    visualizerCtx.strokeStyle = baseColor;
    visualizerCtx.beginPath();
    
    const sliceWidth = width / bufferLength;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;
        
        if (i === 0) {
            visualizerCtx.moveTo(x, y);
        } else {
            visualizerCtx.lineTo(x, y);
        }
        
        x += sliceWidth;
    }
    
    visualizerCtx.lineTo(width, height / 2);
    visualizerCtx.stroke();
    
    // Draw glow effect
    visualizerCtx.shadowBlur = 10;
    visualizerCtx.shadowColor = baseColor;
    visualizerCtx.stroke();
    visualizerCtx.shadowBlur = 0;
    
    // Continue animation
    visualizerAnimationId = requestAnimationFrame(drawVisualizer);
}

// Initialize audio event listeners
function initAudioEventListeners() {
    // Category card clicks
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            selectCategory(card.dataset.category);
        });
    });
    
    // Audio play button
    const audioPlayBtn = document.getElementById('audioPlayBtn');
    if (audioPlayBtn) {
        audioPlayBtn.addEventListener('click', toggleAudio);
    }
    
    // Volume slider
    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            setAudioVolume(e.target.value / 100);
        });
    }
    
    // Volume button (mute toggle)
    const volumeBtn = document.getElementById('volumeBtn');
    if (volumeBtn) {
        volumeBtn.addEventListener('click', toggleMute);
    }
}

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
    sidebarDonation: document.getElementById('sidebarDonation')
};

// ==========================================
// TIMER FUNCTIONS
// ==========================================

function updateTimerDisplay() {
    const minutes = Math.floor(state.timerTime / 60);
    const seconds = state.timerTime % 60;
    if (elements.timerMinutes) elements.timerMinutes.textContent = minutes.toString().padStart(2, '0');
    if (elements.timerSeconds) elements.timerSeconds.textContent = seconds.toString().padStart(2, '0');
}

function updateTimerRing() {
    const circumference = 2 * Math.PI * 90;
    const progress = state.timerTotal > 0 ? (state.timerTotal - state.timerTime) / state.timerTotal : 0;
    const offset = circumference * (1 - Math.min(progress, 1));
    if (elements.timerRing) elements.timerRing.style.strokeDashoffset = offset;
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
    if (elements.presetBtns) {
        elements.presetBtns.forEach(btn => {
            const btnMinutes = parseInt(btn.dataset.time);
            btn.classList.toggle('active', btnMinutes === minutes && seconds === 0);
        });
    }
}

function toggleTimer() {
    if (state.isTimerRunning) {
        stopTimer();
        state.isTimerRunning = false;
    } else {
        if (state.timerTime <= 0) {
            state.timerTime = state.timerTotal;
        }
        startTimer();
        state.isTimerRunning = true;
    }
    updatePlayButton();
}

function updatePlayButton() {
    if (elements.playIcon && elements.pauseIcon) {
        if (state.isTimerRunning) {
            elements.playIcon.style.display = 'none';
            elements.pauseIcon.style.display = 'block';
        } else {
            elements.playIcon.style.display = 'block';
            elements.pauseIcon.style.display = 'none';
        }
    }
}

function resetTimer() {
    stopTimer();
    state.isTimerRunning = false;
    state.timerTime = state.timerTotal;
    updateTimerDisplay();
    updateTimerRing();
    updatePlayButton();
}

function showTimerComplete() {
    playSessionCompleteSound();
    saveSessionData();
    
    const notification = document.createElement('div');
    notification.className = 'complete-notification';
    notification.textContent = '⏱️ Session Complete!';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Save session data for analytics
function saveSessionData() {
    const sessions = JSON.parse(localStorage.getItem('focusForgeSessions')) || [];
    const session = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        duration: Math.floor(state.timerTotal / 60),
        completedAt: new Date().toISOString()
    };
    sessions.push(session);
    localStorage.setItem('focusForgeSessions', JSON.stringify(sessions));
    
    // Update leaderboard
    updateLeaderboard();
}

// ==========================================
// LEADERBOARD FUNCTIONS
// ==========================================

function getLeaderboardData() {
    const sessions = JSON.parse(localStorage.getItem('focusForgeSessions')) || [];
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    return totalMinutes;
}

function updateLeaderboard() {
    const sessions = JSON.parse(localStorage.getItem('focusForgeSessions')) || [];
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);
    
    // Store for leaderboard page
    localStorage.setItem('focusForgeTotalMinutes', totalMinutes.toString());
    localStorage.setItem('focusForgeTotalHours', totalHours);
}

// ==========================================
// SOUND FUNCTIONS
// ==========================================

function playSessionCompleteSound() {
    if (!state.soundEnabled) return;
    
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const audioCtx = new AudioContext();
    const now = audioCtx.currentTime;
    const frequencies = [523.25, 659.25, 783.99, 1046.50];
    
    frequencies.forEach((freq, index) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, now);
        
        const startTime = now + index * 0.15;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
        gainNode.gain.linearRampToValueAtTime(0.1, startTime + 1.5);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 2.5);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 2.6);
    });
}

function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    localStorage.setItem('focusForgeSound', state.soundEnabled);
    updateSoundButton();
}

function updateSoundButton() {
    if (elements.soundBtn && elements.soundOn && elements.soundOff) {
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

// ==========================================
// EVENT LISTENERS
// ==========================================

function initEventListeners() {
    // Play/Pause
    if (elements.playBtn) {
        elements.playBtn.addEventListener('click', toggleTimer);
    }
    
    // Reset timer
    if (elements.resetBtn) {
        elements.resetBtn.addEventListener('click', resetTimer);
    }
    
    // Sound toggle
    if (elements.soundBtn) {
        elements.soundBtn.addEventListener('click', toggleSound);
    }
    
    // Preset buttons
    if (elements.presetBtns) {
        elements.presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                setTimer(parseInt(btn.dataset.time));
            });
        });
    }
    
    // Custom timer modal
    if (elements.timerRingContainer) {
        elements.timerRingContainer.addEventListener('click', () => {
            const hours = Math.floor(state.timerTotal / 3600);
            const minutes = Math.floor((state.timerTotal % 3600) / 60);
            const seconds = state.timerTotal % 60;
            
            if (elements.customHours) elements.customHours.value = hours;
            if (elements.customMinutes) elements.customMinutes.value = minutes;
            if (elements.customSeconds) elements.customSeconds.value = seconds;
            
            if (elements.modal) elements.modal.classList.add('active');
        });
    }
    
    if (elements.cancelTimer) {
        elements.cancelTimer.addEventListener('click', () => {
            if (elements.modal) elements.modal.classList.remove('active');
        });
    }
    
    if (elements.setTimer) {
        elements.setTimer.addEventListener('click', () => {
            const hours = parseInt(elements.customHours?.value) || 0;
            const minutes = parseInt(elements.customMinutes?.value) || 0;
            const seconds = parseInt(elements.customSeconds?.value) || 0;
            
            const totalSeconds = hours * 3600 + minutes * 60 + seconds;
            if (totalSeconds > 0) {
                stopTimer();
                state.timerTime = totalSeconds;
                state.timerTotal = totalSeconds;
                updateTimerDisplay();
                updateTimerRing();
                
                if (elements.presetBtns) {
                    elements.presetBtns.forEach(btn => btn.classList.remove('active'));
                }
            }
            
            if (elements.modal) elements.modal.classList.remove('active');
        });
    }
    
    // Close modal on backdrop click
    if (elements.modal) {
        elements.modal.addEventListener('click', (e) => {
            if (e.target === elements.modal) {
                elements.modal.classList.remove('active');
            }
        });
    }
    
    // Task input
    if (elements.addTaskBtn && elements.taskInput) {
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
    }
    
    // Task delegation
    if (elements.taskList) {
        elements.taskList.addEventListener('click', (e) => {
            const checkbox = e.target.closest('.task-checkbox');
            const deleteBtn = e.target.closest('.task-delete');
            
            if (checkbox) {
                toggleTask(parseInt(checkbox.dataset.index));
            } else if (deleteBtn) {
                deleteTask(parseInt(deleteBtn.dataset.index));
            }
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;
        
        if (e.code === 'Space') {
            e.preventDefault();
            toggleTimer();
        }
    });
    
    // Donation modal
    if (elements.donationBtn) {
        elements.donationBtn.addEventListener('click', () => {
            if (elements.donationModal) elements.donationModal.classList.add('active');
        });
    }
    
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

// ==========================================
// INITIALIZATION
// ==========================================

async function init() {
    // Initialize intro screen first
    await initIntroScreen();
    
    // Initialize audio system
    initAudio();
    initAudioEventListeners();
    updateCategoryInfo();
    
    // Initialize visualizer
    initVisualizer();
    
    // Initialize timer display
    updateTimerDisplay();
    updateTimerRing();
    updatePlayButton();
    
    // Initialize tasks
    renderTasks();
    updateSoundButton();
    
    // Initialize event listeners
    initEventListeners();
}

// Start
document.addEventListener('DOMContentLoaded', init);

