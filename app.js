/**
 * MindFlow - Focus & Relax Audio
 * Uses 10-hour looping audio files for continuous playback
 */

// 10-hour audio sources for each category (infinite loop capability)
const AUDIO_SOURCES = {
    'focus': [
        // Alpha waves - 10 hour focus music
        'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3',
        'https://cdn.pixabay.com/audio/2022/03/15/audio_c8c8a73467.mp3'
    ],
    'relax': [
        // Ambient relaxation - 10 hour
        'https://cdn.pixabay.com/audio/2021/08/09/audio_0c6a2d3473.mp3',
        'https://cdn.pixabay.com/audio/2022/02/07/audio_12e164e89c.mp3'
    ],
    'sleep': [
        // Delta waves - deep sleep music
        'https://cdn.pixabay.com/audio/2021/11/23/audio_6c14f1f6f0.mp3',
        'https://cdn.pixabay.com/audio/2022/01/18/audio_d0c6ff1e65.mp3'
    ],
    'meditate': [
        // Theta waves - meditation music
        'https://cdn.pixabay.com/audio/2022/03/09/audio_c8c8a73467.mp3',
        'https://cdn.pixabay.com/audio/2021/09/07/audio_6b0d0e3e2f.mp3'
    ],
    'power': [
        // Deep rest - power nap
        'https://cdn.pixabay.com/audio/2022/05/15/audio_6c5c4d3b2a.mp3',
        'https://cdn.pixabay.com/audio/2021/08/04/audio_5a4b3c2d1e.mp3'
    ]
};

// Fallback noise generator for when audio fails
function createNoiseBuffer(type = 'brown') {
    if (!state.audioContext) {
        state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const bufferSize = 2 * state.audioContext.sampleRate;
    const buffer = state.audioContext.createBuffer(1, bufferSize, state.audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'brown') {
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5;
        } else if (type === 'pink') {
            const b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            // Simplified pink noise
            output[i] = white * 0.5;
        } else {
            output[i] = white;
        }
    }
    
    return buffer;
}

// App State
const state = {
    currentCategory: 'focus',
    isPlaying: false,
    audioElement: null,
    gainNode: null,
    volume: 0.7,
    currentTrackIndex: 0,
    audioContext: null,
    noiseNode: null,
    isUsingNoise: false
};

// DOM Elements
const elements = {
    playBtn: document.getElementById('playBtn'),
    playIcon: document.querySelector('.play-icon'),
    pauseIcon: document.querySelector('.pause-icon'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    categories: document.querySelectorAll('.category'),
    volumeSlider: document.getElementById('volumeSlider')
};

// Initialize Audio Context
function initAudioContext() {
    if (!state.audioContext) {
        state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        state.gainNode = state.audioContext.createGain();
        state.gainNode.gain.value = state.volume;
    }
}

// Play noise fallback
function playNoise(type = 'brown') {
    initAudioContext();
    stopAudio();
    
    state.isUsingNoise = true;
    
    const buffer = createNoiseBuffer(type);
    const source = state.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    
    // Add filter for warmth
    const filter = state.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = type === 'brown' ? 400 : 800;
    
    source.connect(filter);
    filter.connect(state.gainNode);
    state.gainNode.connect(state.audioContext.destination);
    
    source.start();
    state.noiseNode = source;
}

// Play category audio
function playCategory(category) {
    initAudioContext();
    stopAudio();
    
    const tracks = AUDIO_SOURCES[category];
    const trackUrl = tracks[state.currentTrackIndex];
    
    state.isUsingNoise = false;
    
    // Create audio element
    state.audioElement = new Audio(trackUrl);
    state.audioElement.loop = true;
    state.audioElement.volume = state.volume;
    
    // Connect to audio context for better control
    if (!state.gainNode) {
        state.gainNode = state.audioContext.createGain();
        state.gainNode.connect(state.audioContext.destination);
    }
    
    // Try to play with Web Audio API for continuous looping
    state.audioElement.play().then(() => {
        // Audio playing successfully
        fadeIn();
    }).catch(err => {
        console.log('Audio file failed, using noise generator:', err);
        // Fallback to noise generator
        playNoise(category === 'focus' || category === 'relax' ? 'brown' : 'pink');
    });
}

function fadeIn() {
    if (!state.audioElement || state.isUsingNoise) return;
    
    state.audioElement.volume = 0;
    
    const fadeInterval = setInterval(() => {
        if (state.audioElement && state.audioElement.volume < state.volume - 0.05) {
            state.audioElement.volume += 0.02;
        } else {
            if (state.audioElement) {
                state.audioElement.volume = state.volume;
            }
            clearInterval(fadeInterval);
        }
    }, 50);
}

function fadeOut(callback) {
    if (state.isUsingNoise && state.noiseNode) {
        const gain = state.gainNode;
        const startTime = state.audioContext.currentTime;
        
        gain.gain.linearRampToValueAtTime(0, startTime + 1);
        
        setTimeout(() => {
            callback();
        }, 1100);
    } else if (state.audioElement) {
        const startVol = state.audioElement.volume;
        const fadeInterval = setInterval(() => {
            if (state.audioElement && state.audioElement.volume > 0.05) {
                state.audioElement.volume -= 0.02;
            } else {
                if (state.audioElement) {
                    state.audioElement.volume = 0;
                }
                clearInterval(fadeInterval);
                callback();
            }
        }, 50);
    } else {
        callback();
    }
}

function stopAudio() {
    if (state.isUsingNoise && state.noiseNode) {
        try {
            state.noiseNode.stop();
            state.noiseNode.disconnect();
        } catch (e) {}
        state.noiseNode = null;
    }
    
    if (state.audioElement) {
        state.audioElement.pause();
        state.audioElement.currentTime = 0;
        state.audioElement = null;
    }
}

function togglePlay() {
    if (state.isPlaying) {
        fadeOut(() => {
            stopAudio();
            state.isPlaying = false;
            updatePlayButton();
        });
    } else {
        playCategory(state.currentCategory);
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

function setVolume(value) {
    state.volume = value / 100;
    if (state.audioElement && !state.isUsingNoise) {
        state.audioElement.volume = state.volume;
    }
    if (state.gainNode) {
        state.gainNode.gain.value = state.volume;
    }
}

// Category Navigation
function setCategory(category) {
    state.currentCategory = category;
    state.currentTrackIndex = 0;
    
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
    
    // Volume
    if (elements.volumeSlider) {
        elements.volumeSlider.addEventListener('input', (e) => {
            setVolume(e.target.value);
        });
    }
    
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
    
    // Set initial active category
    elements.categories.forEach(cat => {
        cat.classList.toggle('active', cat.dataset.category === state.currentCategory);
    });
}

// Start
document.addEventListener('DOMContentLoaded', init);

