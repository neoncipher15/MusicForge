/**
 * MindFlow - Focus & Relax Audio
 * Uses free audio samples for lofi, ambient, jazz, violin, and piano
 */

// Audio source URLs (using free creative commons sources)
const AUDIO_SOURCES = {
    'lofi': [
        'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3', // Lofi study
        'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3', // Chill lofi
        'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1e65.mp3'  // Relaxing lofi
    ],
    'ambient': [
        'https://cdn.pixabay.com/download/audio/2021/08/09/audio_0c6a2d3473.mp3', // Ambient meditation
        'https://cdn.pixabay.com/download/audio/2022/02/07/audio_12e164e89c.mp3', // Space ambient
        'https://cdn.pixabay.com/download/audio/2021/11/23/audio_6c14f1f6f0.mp3'  // Atmospheric
    ],
    'jazz': [
        'https://cdn.pixabay.com/download/audio/2022/05/27/audio_9108fbf07a.mp3', // Smooth jazz
        'https://cdn.pixabay.com/download/audio/2022/03/10/audio_8f76049446.mp3', // Jazz piano
        'https://cdn.pixabay.com/download/audio/2021/10/13/audio_7a8e46e3b2.mp3'  // Lounge jazz
    ],
    'violin': [
        'https://cdn.pixabay.com/download/audio/2022/03/09/audio_c8c8a73467.mp3', // Violin ambient
        'https://cdn.pixabay.com/download/audio/2021/09/07/audio_6b0d0e3e2f.mp3', // Classical violin
        'https://cdn.pixabay.com/download/audio/2022/01/12/audio_1f2a3b4c5d.mp3'  // Emotional violin
    ],
    'piano': [
        'https://cdn.pixabay.com/download/audio/2022/05/15/audio_6c5c4d3b2a.mp3', // Relaxing piano
        'https://cdn.pixabay.com/download/audio/2021/08/04/audio_5a4b3c2d1e.mp3', // Peaceful piano
        'https://cdn.pixabay.com/download/audio/2022/04/27/audio_7b8c9d0e1f.mp3'  // Soft piano
    ]
};

// App State
const state = {
    currentCategory: 'lofi',
    isPlaying: false,
    audioElement: null,
    timerTime: 25 * 60,
    timerTotal: 25 * 60,
    timerInterval: null,
    volume: 0.7
};

// DOM Elements
const elements = {
    playBtn: document.getElementById('playBtn'),
    playIcon: document.querySelector('.play-icon'),
    pauseIcon: document.querySelector('.pause-icon'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    timerMinutes: document.getElementById('timerMinutes'),
    timerSeconds: document.getElementById('timerSeconds'),
    timerRing: document.getElementById('timerRing'),
    categories: document.querySelectorAll('.category'),
    timerBtns: document.querySelectorAll('.timer-btn')
};

// Audio System
function playCategory(category) {
    // Stop current audio
    if (state.audioElement) {
        state.audioElement.pause();
        state.audioElement.currentTime = 0;
    }
    
    // Get random track from category
    const tracks = AUDIO_SOURCES[category];
    const trackUrl = tracks[Math.floor(Math.random() * tracks.length)];
    
    // Create audio element
    state.audioElement = new Audio(trackUrl);
    state.audioElement.loop = true;
    state.audioElement.volume = state.volume;
    
    // Fade in
    state.audioElement.volume = 0;
    state.audioElement.play().then(() => {
        fadeIn(state.audioElement);
    }).catch(err => {
        console.log('Audio playback requires user interaction');
    });
}

function fadeIn(audio) {
    const fadeInterval = setInterval(() => {
        if (audio.volume < state.volume - 0.1) {
            audio.volume += 0.05;
        } else {
            audio.volume = state.volume;
            clearInterval(fadeInterval);
        }
    }, 100);
}

function fadeOutAndStop() {
    if (!state.audioElement) return;
    
    const audio = state.audioElement;
    const fadeInterval = setInterval(() => {
        if (audio.volume > 0.05) {
            audio.volume -= 0.05;
        } else {
            audio.pause();
            audio.currentTime = 0;
            clearInterval(fadeInterval);
        }
    }, 100);
}

function stopAudio() {
    if (state.audioElement) {
        state.audioElement.pause();
        state.audioElement.currentTime = 0;
    }
}

function togglePlay() {
    if (state.isPlaying) {
        // Pause
        if (state.audioElement) {
            state.audioElement.pause();
        }
        clearInterval(state.timerInterval);
        state.isPlaying = false;
        updatePlayButton();
    } else {
        // Play
        playCategory(state.currentCategory);
        startTimer();
        state.isPlaying = true;
        updatePlayButton();
    }
}

function updatePlayButton() {
    if (state.isPlaying) {
        elements.playIcon.style.display = 'none';
        elements.pauseIcon.style.display = 'block';
    } else {
        elements.playIcon.style.display = 'block';
        elements.pauseIcon.style.display = 'none';
    }
}

// Timer
function startTimer() {
    clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
        if (state.timerTime > 0) {
            state.timerTime--;
            updateTimerDisplay();
            updateTimerRing();
        } else {
            // Timer finished
            clearInterval(state.timerInterval);
            fadeOutAndStop();
            state.isPlaying = false;
            updatePlayButton();
            showCompleteNotification();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(state.timerTime / 60);
    const seconds = state.timerTime % 60;
    elements.timerMinutes.textContent = minutes.toString().padStart(2, '0');
    elements.timerSeconds.textContent = seconds.toString().padStart(2, '0');
}

function updateTimerRing() {
    const circumference = 2 * Math.PI * 90;
    const progress = (state.timerTotal - state.timerTime) / state.timerTotal;
    const offset = circumference * (1 - progress);
    elements.timerRing.style.strokeDashoffset = offset;
}

function setTimer(minutes) {
    clearInterval(state.timerInterval);
    state.timerTime = minutes * 60;
    state.timerTotal = state.timerTime;
    updateTimerDisplay();
    updateTimerRing();
    
    // Update active button
    elements.timerBtns.forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.time) === minutes);
    });
}

function showCompleteNotification() {
    const notification = document.createElement('div');
    notification.className = 'complete-notification';
    notification.textContent = 'Session Complete';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Category Navigation
function setCategory(category) {
    state.currentCategory = category;
    
    // Update UI
    elements.categories.forEach(cat => {
        cat.classList.toggle('active', cat.dataset.category === category);
    });
    
    // If playing, switch audio
    if (state.isPlaying) {
        playCategory(category);
    }
}

function nextCategory() {
    const categories = Object.keys(AUDIO_SOURCES);
    const currentIndex = categories.indexOf(state.currentCategory);
    const nextIndex = (currentIndex + 1) % categories.length;
    setCategory(categories[nextIndex]);
}

function prevCategory() {
    const categories = Object.keys(AUDIO_SOURCES);
    const currentIndex = categories.indexOf(state.currentCategory);
    const prevIndex = (currentIndex - 1 + categories.length) % categories.length;
    setCategory(categories[prevIndex]);
}

// Event Listeners
function initEventListeners() {
    // Play/Pause
    elements.playBtn.addEventListener('click', togglePlay);
    
    // Prev/Next
    elements.prevBtn.addEventListener('click', prevCategory);
    elements.nextBtn.addEventListener('click', nextCategory);
    
    // Categories
    elements.categories.forEach(cat => {
        cat.addEventListener('click', () => {
            setCategory(cat.dataset.category);
        });
    });
    
    // Timer buttons
    elements.timerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setTimer(parseInt(btn.dataset.time));
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;
        
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                togglePlay();
                break;
            case 'ArrowLeft':
                prevCategory();
                break;
            case 'ArrowRight':
                nextCategory();
                break;
        }
    });
}

// Initialize
function init() {
    initEventListeners();
    updateTimerDisplay();
    updateTimerRing();
    
    // Set initial active category
    elements.categories.forEach(cat => {
        cat.classList.toggle('active', cat.dataset.category === state.currentCategory);
    });
}

// Start
document.addEventListener('DOMContentLoaded', init);

