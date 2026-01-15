/**
 * MindFlow - Focus & Relax Audio
 * Uses Web Audio API to generate neuroacoustic soundscapes
 */

// Audio frequencies for different categories (binaural beats)
const CATEGORY_FREQUENCIES = {
    'focus': { base: 40, beat: 7 },      // Gamma waves for focus
    'relax': { base: 200, beat: 10 },    // Alpha waves for relaxation
    'sleep': { base: 150, beat: 2 },     // Delta waves for sleep
    'meditate': { base: 180, beat: 6 },  // Theta waves for meditation
    'power': { base: 220, beat: 4 }      // Deep rest
};

// App State
const state = {
    currentCategory: 'focus',
    isPlaying: false,
    audioContext: null,
    oscillators: [],
    gainNode: null,
    volume: 0.7
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

// Initialize Audio Context on user interaction
function initAudioContext() {
    if (!state.audioContext) {
        state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        state.gainNode = state.audioContext.createGain();
        state.gainNode.connect(state.audioContext.destination);
        state.gainNode.gain.value = state.volume;
    }
    if (state.audioContext.state === 'suspended') {
        state.audioContext.resume();
    }
}

// Generate binaural beat sound
function playCategory(category) {
    initAudioContext();
    
    // Stop any existing audio
    stopAudio();
    
    const freq = CATEGORY_FREQUENCIES[category];
    
    // Create two oscillators for binaural beat effect
    // Left ear
    const osc1 = state.audioContext.createOscillator();
    const gain1 = state.audioContext.createGain();
    
    // Right ear
    const osc2 = state.audioContext.createOscillator();
    const gain2 = state.audioContext.createGain();
    
    // Create stereo panner nodes
    const panner1 = state.audioContext.createStereoPanner();
    const panner2 = state.audioContext.createStereoPanner();
    
    // Set frequencies for binaural beat
    osc1.frequency.value = freq.base;
    osc2.frequency.value = freq.base + freq.beat;
    
    // Pan left and right
    panner1.pan.value = -1;
    panner2.pan.value = 1;
    
    // Use sine waves for smooth sound
    osc1.type = 'sine';
    osc2.type = 'sine';
    
    // Set volume
    gain1.gain.value = 0.3;
    gain2.gain.value = 0.3;
    
    // Add slight detuning for richness
    osc1.detune.value = 0;
    osc2.detune.value = 0;
    
    // Connect nodes
    osc1.connect(gain1);
    gain1.connect(panner1);
    panner1.connect(state.gainNode);
    
    osc2.connect(gain2);
    gain2.connect(panner2);
    panner2.connect(state.gainNode);
    
    // Start with fade in
    gain1.gain.setValueAtTime(0, state.audioContext.currentTime);
    gain2.gain.setValueAtTime(0, state.audioContext.currentTime);
    
    gain1.gain.linearRampToValueAtTime(0.3, state.audioContext.currentTime + 2);
    gain2.gain.linearRampToValueAtTime(0.3, state.audioContext.currentTime + 2);
    
    osc1.start();
    osc2.start();
    
    // Store references
    state.oscillators = [osc1, osc2, gain1, gain2];
}

// Add subtle modulation for richness
function addModulation() {
    if (!state.isPlaying || state.oscillators.length < 4) return;
    
    const osc1 = state.oscillators[0];
    
    // Slowly modulate frequency for organic feel
    const lfo = state.audioContext.createOscillator();
    const lfoGain = state.audioContext.createGain();
    
    lfo.frequency.value = 0.1; // Very slow modulation
    lfoGain.gain.value = 2;    // Subtle frequency variation
    
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    
    lfo.start();
    
    state.oscillators.push(lfo, lfoGain);
}

function stopAudio() {
    // Fade out
    if (state.oscillators.length >= 4) {
        const gain1 = state.oscillators[2];
        const gain2 = state.oscillators[3];
        
        gain1.gain.linearRampToValueAtTime(0, state.audioContext.currentTime + 1);
        gain2.gain.linearRampToValueAtTime(0, state.audioContext.currentTime + 1);
    }
    
    // Stop after fade
    setTimeout(() => {
        state.oscillators.forEach(osc => {
            try {
                if (osc.stop) osc.stop();
                if (osc.disconnect) osc.disconnect();
            } catch (e) {}
        });
        state.oscillators = [];
    }, 1100);
}

function togglePlay() {
    if (state.isPlaying) {
        // Pause
        stopAudio();
        state.isPlaying = false;
        updatePlayButton();
    } else {
        // Play
        playCategory(state.currentCategory);
        addModulation();
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
    if (state.gainNode) {
        state.gainNode.gain.value = state.volume;
    }
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
        addModulation();
    }
}

function nextCategory() {
    const categories = Object.keys(CATEGORY_FREQUENCIES);
    const currentIndex = categories.indexOf(state.currentCategory);
    const nextIndex = (currentIndex + 1) % categories.length;
    setCategory(categories[nextIndex]);
}

function prevCategory() {
    const categories = Object.keys(CATEGORY_FREQUENCIES);
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

