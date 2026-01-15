/**
 * MindFlow - Brain.fm Alternative
 * AI-generated neuroacoustic soundscapes for focus, relaxation, and sleep
 */

// ============================================
// Application State
// ============================================
const AppState = {
    currentCategory: 'focus',
    currentSound: null,
    isPlaying: false,
    isTimerRunning: false,
    audioContext: null,
    masterGain: null,
    volume: 0.5,
    fadeDuration: 10,
    fadeOutEnabled: true,
    autoplay: false,
    visualizerType: 'bars',
    darkMode: true,
    bitrate: 320,
    
    // Timer state
    timerTime: 25 * 60, // seconds
    timerTotal: 25 * 60,
    timerInterval: null,
    
    // Audio nodes
    oscillators: [],
    noiseNodes: [],
    gainNodes: [],
    
    // Track info
    tracks: {
        'focus': {
            title: 'Focus Mode',
            description: 'Gamma wave soundscape for deep concentration',
            duration: 25 * 60,
            waveType: 'gamma',
            frequency: 40
        },
        'relax': {
            title: 'Relax Mode',
            description: 'Alpha wave soundscape for stress relief',
            duration: 15 * 60,
            waveType: 'alpha',
            frequency: 8
        },
        'sleep': {
            title: 'Sleep Mode',
            description: 'Delta wave soundscape for deep sleep',
            duration: 8 * 60 * 60,
            waveType: 'delta',
            frequency: 2
        },
        'meditate': {
            title: 'Meditate Mode',
            description: 'Theta wave soundscape for meditation',
            duration: 10 * 60,
            waveType: 'theta',
            frequency: 6
        },
        'power-nap': {
            title: 'Power Nap Mode',
            description: 'Sleep spindle soundscape for quick rest',
            duration: 20 * 60,
            waveType: 'spindle',
            frequency: 12
        },
        // Music categories
        'lofi': {
            title: 'Lofi Chill',
            description: 'Relaxing lofi beats for studying and relaxing',
            duration: 60 * 60,
            waveType: 'music',
            musicType: 'lofi'
        },
        'ambient': {
            title: 'Ambient Space',
            description: 'Atmospheric soundscapes for deep relaxation',
            duration: 60 * 60,
            waveType: 'music',
            musicType: 'ambient'
        },
        'piano': {
            title: 'Piano Relax',
            description: 'Gentle piano melodies for peace and focus',
            duration: 60 * 60,
            waveType: 'music',
            musicType: 'piano'
        },
        'violin': {
            title: 'Elegant Violin',
            description: 'Beautiful violin compositions for inspiration',
            duration: 60 * 60,
            waveType: 'music',
            musicType: 'violin'
        },
        'jazz': {
            title: 'Smooth Jazz',
            description: 'Soft jazz sounds for a sophisticated atmosphere',
            duration: 60 * 60,
            waveType: 'music',
            musicType: 'jazz'
        },
        'cafe': {
            title: 'Cafe Ambience',
            description: 'Coffee shop sounds with background music',
            duration: 60 * 60,
            waveType: 'music',
            musicType: 'cafe'
        },
        'library': {
            title: 'Library Quiet',
            description: 'Quiet study atmosphere with soft page turning',
            duration: 60 * 60,
            waveType: 'music',
            musicType: 'library'
        },
        'nature': {
            title: 'Nature Sounds',
            description: 'Peaceful forest and wildlife sounds',
            duration: 60 * 60,
            waveType: 'music',
            musicType: 'nature'
        }
    },
    
    // Background sounds
    backgroundSounds: {
        'rain': { active: false, gain: 0.15 },
        'ocean': { active: false, gain: 0.12 },
        'forest': { active: false, gain: 0.1 },
        'wind': { active: false, gain: 0.08 },
        'white-noise': { active: false, gain: 0.06 },
        'fireplace': { active: false, gain: 0.1 }
    }
};

// ============================================
// DOM Elements
// ============================================
const DOM = {
    // Header
    navBtns: document.querySelectorAll('.nav-btn'),
    settingsBtn: document.getElementById('settingsBtn'),
    settingsPanel: document.getElementById('settingsPanel'),
    closeSettings: document.getElementById('closeSettings'),
    
    // Category Cards
    categoryCards: document.querySelectorAll('.category-card'),
    
    // Player
    playBtn: document.getElementById('playBtn'),
    playIcon: document.querySelector('.play-icon'),
    pauseIcon: document.querySelector('.pause-icon'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    repeatBtn: document.getElementById('repeatBtn'),
    volumeSlider: document.getElementById('volumeSlider'),
    volumeValue: document.getElementById('volumeValue'),
    progressBar: document.getElementById('progressBar'),
    progressFill: document.getElementById('progressFill'),
    progressHandle: document.getElementById('progressHandle'),
    currentTime: document.getElementById('currentTime'),
    totalTime: document.getElementById('totalTime'),
    trackTitle: document.getElementById('trackTitle'),
    trackDescription: document.getElementById('trackDescription'),
    visualizer: document.getElementById('visualizer'),
    
    // Timer
    startTimerBtn: document.getElementById('startTimerBtn'),
    pauseTimerBtn: document.getElementById('pauseTimerBtn'),
    resetTimerBtn: document.getElementById('resetTimerBtn'),
    timerMinutes: document.getElementById('timerMinutes'),
    timerSeconds: document.getElementById('timerSeconds'),
    timerRing: document.getElementById('timerRing'),
    presetBtns: document.querySelectorAll('.preset-btn'),
    
    // Background Sounds
    soundCards: document.querySelectorAll('.sound-card'),
    
    // Settings
    bitrateSelect: document.getElementById('bitrateSelect'),
    autoplayToggle: document.getElementById('autoplayToggle'),
    fadeoutToggle: document.getElementById('fadeoutToggle'),
    fadeDurationSlider: document.getElementById('fadeDuration'),
    fadeDurationValue: document.getElementById('fadeDurationValue'),
    visualizerTypeSelect: document.getElementById('visualizerType'),
    darkModeToggle: document.getElementById('darkModeToggle')
};

// ============================================
// Audio System
// ============================================
class AudioSystem {
    constructor() {
        this.context = null;
        this.masterGain = null;
        this.analyser = null;
        this.oscillators = [];
        this.noiseNodes = [];
        this.gainNodes = [];
        this.isPlaying = false;
        this.noiseNodesByType = {}; // Track noise nodes by sound type
    }
    
    async init() {
        if (this.context) return;
        
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.context.createGain();
        this.analyser = this.context.createAnalyser();
        
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.8;
        
        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.context.destination);
        this.masterGain.gain.value = AppState.volume;
        
        // Create noise node for background sounds
        this.noiseNode = this.createNoiseGenerator();
    }
    
    createNoiseGenerator() {
        const bufferSize = 2 * this.context.sampleRate;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const output = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.context.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        
        return noise;
    }
    
    startOscillator(frequency, type = 'sine', gainValue = 0.1) {
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.context.currentTime);
        gainNode.gain.linearRampToValueAtTime(gainValue, this.context.currentTime + 2);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.start();
        
        this.oscillators.push({ oscillator, gainNode });
        this.gainNodes.push(gainNode);
        
        return { oscillator, gainNode };
    }
    
    startBinauralBeat(baseFrequency, beatFrequency, gainValue = 0.1) {
        // Create two slightly different frequencies for binaural beat
        this.startOscillator(baseFrequency - beatFrequency / 2, 'sine', gainValue);
        this.startOscillator(baseFrequency + beatFrequency / 2, 'sine', gainValue);
    }
    
    startNoise(type = 'white', gainValue = 0.05) {
        // Stop existing noise of this type first
        if (this.noiseNodesByType[type]) {
            this.stopNoise(type);
        }
        
        const noise = this.context.createBufferSource();
        const bufferSize = 2 * this.context.sampleRate;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const output = buffer.getChannelData(0);
        
        if (type === 'white') {
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
        } else if (type === 'pink') {
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
        } else if (type === 'brown') {
            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                output[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = output[i];
                output[i] *= 3.5;
            }
        }
        
        noise.buffer = buffer;
        noise.loop = true;
        
        const gainNode = this.context.createGain();
        gainNode.gain.setValueAtTime(0, this.context.currentTime);
        gainNode.gain.linearRampToValueAtTime(gainValue, this.context.currentTime + 2);
        
        // Add filter for different noise types
        const filter = this.context.createBiquadFilter();
        if (type === 'rain') {
            filter.type = 'highpass';
            filter.frequency.value = 500;
        } else if (type === 'ocean') {
            filter.type = 'lowpass';
            filter.frequency.value = 1000;
        } else if (type === 'wind') {
            filter.type = 'bandpass';
            filter.frequency.value = 500;
            filter.Q.value = 0.5;
        } else {
            filter.type = 'allpass';
            filter.frequency.value = 20000;
        }
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        noise.start();
        
        // Track by type
        this.noiseNodesByType[type] = { noise, gainNode, filter };
        this.noiseNodes.push({ noise, gainNode, filter });
        
        return { noise, gainNode, filter };
    }
    
    stopNoise(type) {
        const node = this.noiseNodesByType[type];
        if (!node) return;
        
        const { noise, gainNode, filter } = node;
        const now = this.context.currentTime;
        
        // Fade out
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
        
        setTimeout(() => {
            try {
                noise.stop();
            } catch (e) {}
        }, 600);
        
        // Remove from tracking
        delete this.noiseNodesByType[type];
        this.noiseNodes = this.noiseNodes.filter(n => n.noise !== noise);
    }
    
    stopAll() {
        // Fade out
        const now = this.context.currentTime;
        
        this.oscillators.forEach(({ oscillator, gainNode }) => {
            gainNode.gain.cancelScheduledValues(now);
            gainNode.gain.setValueAtTime(gainNode.gain.value, now);
            gainNode.gain.linearRampToValueAtTime(0, now + AppState.fadeDuration);
            setTimeout(() => {
                try {
                    oscillator.stop();
                } catch (e) {}
            }, AppState.fadeDuration * 1000);
        });
        
        // Stop noise nodes by type
        Object.keys(this.noiseNodesByType).forEach(type => {
            this.stopNoise(type);
        });
        
        this.oscillators = [];
        this.noiseNodes = [];
        this.gainNodes = [];
        this.noiseNodesByType = {};
    }
    
    setVolume(value) {
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(value, this.context.currentTime);
        }
    }
    
    getAnalyserData() {
        if (!this.analyser) return new Uint8Array(0);
        
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);
        return dataArray;
    }
}

const audioSystem = new AudioSystem();

// ============================================
// Visualizer
// ============================================
class Visualizer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.animationId = null;
        this.type = 'bars';
        this.resize();
        
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.width = rect.width;
        this.height = rect.height;
    }
    
    setType(type) {
        this.type = type;
    }
    
    start() {
        if (this.animationId) return;
        this.animate();
    }
    
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
            this.clear();
        }
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
    
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        const data = audioSystem.getAnalyserData();
        
        this.clear();
        
        switch (this.type) {
            case 'bars':
                this.drawBars(data);
                break;
            case 'wave':
                this.drawWave(data);
                break;
            case 'circular':
                this.drawCircular(data);
                break;
        }
    }
    
    drawBars(data) {
        const barCount = 64;
        const barWidth = (this.width - (barCount - 1) * 2) / barCount;
        const step = Math.floor(data.length / barCount);
        
        for (let i = 0; i < barCount; i++) {
            const value = data[i * step];
            const height = (value / 255) * (this.height * 0.8);
            const x = i * (barWidth + 2);
            const y = this.height - height;
            
            const gradient = this.ctx.createLinearGradient(0, y, 0, this.height);
            gradient.addColorStop(0, '#6366f1');
            gradient.addColorStop(1, '#8b5cf6');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, y, barWidth, height);
        }
    }
    
    drawWave(data) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height / 2);
        
        const sliceWidth = this.width / data.length;
        let x = 0;
        
        for (let i = 0; i < data.length; i++) {
            const v = data[i] / 128.0;
            const y = v * this.height / 2;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        this.ctx.strokeStyle = '#6366f1';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Fill
        this.ctx.lineTo(this.width, this.height);
        this.ctx.lineTo(0, this.height);
        this.ctx.closePath();
        
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0.1)');
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    }
    
    drawCircular(data) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = Math.min(centerX, centerY) * 0.4;
        
        this.ctx.beginPath();
        
        for (let i = 0; i < data.length; i++) {
            const angle = (i / data.length) * Math.PI * 2;
            const value = data[i] / 255;
            const r = radius + value * 50;
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        this.ctx.closePath();
        this.ctx.strokeStyle = '#6366f1';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Inner fill
        this.ctx.beginPath();
        for (let i = 0; i < data.length; i++) {
            const angle = (i / data.length) * Math.PI * 2;
            const value = data[i] / 255;
            const r = radius + value * 50;
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        
        const gradient = this.ctx.createRadialGradient(centerX, centerY, radius, centerX, centerY, radius + 50);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.1)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0.3)');
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    }
}

const visualizer = new Visualizer(DOM.visualizer);

// ============================================
// Timer
// ============================================
class Timer {
    constructor() {
        this.time = AppState.timerTime;
        this.total = AppState.timerTotal;
        this.interval = null;
        this.isRunning = false;
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.interval = setInterval(() => {
            this.tick();
        }, 1000);
        
        this.updateDisplay();
    }
    
    pause() {
        this.isRunning = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
    
    reset() {
        this.pause();
        this.time = this.total;
        this.updateDisplay();
        this.updateRing();
    }
    
    setTime(minutes) {
        this.pause();
        this.time = minutes * 60;
        this.total = this.time;
        this.updateDisplay();
        this.updateRing();
    }
    
    tick() {
        if (this.time > 0) {
            this.time--;
            this.updateDisplay();
            this.updateRing();
        } else {
            this.complete();
        }
    }
    
    complete() {
        this.pause();
        
        // Play completion sound
        this.playCompletionSound();
        
        // Stop audio if fade out is enabled
        if (AppState.fadeOutEnabled) {
            audioSystem.stopAll();
            AppState.isPlaying = false;
            updatePlayButton();
        }
        
        // Show completion notification
        this.showCompletionNotification();
    }
    
    playCompletionSound() {
        if (!audioSystem.context) return;
        
        const oscillator = audioSystem.context.createOscillator();
        const gainNode = audioSystem.context.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioSystem.context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(440, audioSystem.context.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.3, audioSystem.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioSystem.context.currentTime + 1);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioSystem.context.destination);
        
        oscillator.start();
        oscillator.stop(audioSystem.context.currentTime + 1);
    }
    
    showCompletionNotification() {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'timer-notification';
        notification.textContent = 'Session Complete!';
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            padding: 2rem 3rem;
            border-radius: 1rem;
            font-size: 1.5rem;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.5s ease, fadeOut 0.5s ease 2s forwards;
            box-shadow: 0 20px 40px rgba(99, 102, 241, 0.4);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2500);
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.time / 60);
        const seconds = this.time % 60;
        
        DOM.timerMinutes.textContent = minutes.toString().padStart(2, '0');
        DOM.timerSeconds.textContent = seconds.toString().padStart(2, '0');
        
        // Update player time display
        const totalMinutes = Math.floor(this.total / 60);
        const totalSeconds = this.total % 60;
        DOM.totalTime.textContent = `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
        
        const elapsedMinutes = Math.floor((this.total - this.time) / 60);
        const elapsedSeconds = (this.total - this.time) % 60;
        DOM.currentTime.textContent = `${elapsedMinutes}:${elapsedSeconds.toString().padStart(2, '0')}`;
        
        // Update progress bar
        const progress = ((this.total - this.time) / this.total) * 100;
        DOM.progressFill.style.width = `${progress}%`;
        DOM.progressHandle.style.left = `${progress}%`;
    }
    
    updateRing() {
        const circumference = 2 * Math.PI * 45;
        const progress = 1 - (this.time / this.total);
        const offset = circumference * progress;
        DOM.timerRing.style.strokeDashoffset = offset;
    }
}

const timer = new Timer();

// ============================================
// Settings Manager
// ============================================
class SettingsManager {
    constructor() {
        this.settings = {
            bitrate: 320,
            autoplay: false,
            fadeOutEnabled: true,
            fadeDuration: 10,
            visualizerType: 'bars',
            darkMode: true
        };
        
        this.load();
    }
    
    load() {
        const saved = localStorage.getItem('mindflow_settings');
        if (saved) {
            try {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            } catch (e) {
                console.error('Failed to load settings:', e);
            }
        }
        
        this.apply();
    }
    
    save() {
        localStorage.setItem('mindflow_settings', JSON.stringify(this.settings));
    }
    
    apply() {
        DOM.bitrateSelect.value = this.settings.bitrate;
        DOM.autoplayToggle.checked = this.settings.autoplay;
        DOM.fadeoutToggle.checked = this.settings.fadeOutEnabled;
        DOM.fadeDurationSlider.value = this.settings.fadeDuration;
        DOM.fadeDurationValue.textContent = `${this.settings.fadeDuration}s`;
        DOM.visualizerTypeSelect.value = this.settings.visualizerType;
        DOM.darkModeToggle.checked = this.settings.darkMode;
        
        // Apply dark mode
        if (this.settings.darkMode) {
            document.body.removeAttribute('data-theme');
        } else {
            document.body.setAttribute('data-theme', 'light');
        }
        
        // Apply visualizer type
        visualizer.setType(this.settings.visualizerType);
        
        // Update app state
        AppState.bitrate = this.settings.bitrate;
        AppState.autoplay = this.settings.autoplay;
        AppState.fadeOutEnabled = this.settings.fadeOutEnabled;
        AppState.fadeDuration = this.settings.fadeDuration;
        AppState.visualizerType = this.settings.visualizerType;
        AppState.darkMode = this.settings.darkMode;
    }
    
    update(setting, value) {
        this.settings[setting] = value;
        this.save();
        this.apply();
    }
}

const settingsManager = new SettingsManager();

// ============================================
// Player Controls
// ============================================
function updatePlayButton() {
    if (AppState.isPlaying) {
        DOM.playIcon.style.display = 'none';
        DOM.pauseIcon.style.display = 'block';
        DOM.playBtn.classList.add('playing');
        document.querySelector('.visualizer-container').classList.add('active');
    } else {
        DOM.playIcon.style.display = 'block';
        DOM.pauseIcon.style.display = 'none';
        DOM.playBtn.classList.remove('playing');
        document.querySelector('.visualizer-container').classList.remove('active');
    }
}

async function playAudio() {
    await audioSystem.init();
    
    if (AppState.isPlaying) {
        audioSystem.stopAll();
        timer.pause();
        AppState.isPlaying = false;
        visualizer.stop();
        updatePlayButton();
        return;
    }
    
    const track = AppState.tracks[AppState.currentCategory];
    
    // Start audio based on category
    // Handle music types differently
    if (track.waveType === 'music') {
        playMusic(track.musicType);
    } else {
        // Original brainwave categories
        switch (AppState.currentCategory) {
            case 'focus':
                // Gamma waves at 40Hz
                audioSystem.startBinauralBeat(200, 40, 0.08);
                audioSystem.startOscillator(100, 'sine', 0.05);
                break;
                
            case 'relax':
                // Alpha waves at 7-8Hz
                audioSystem.startBinauralBeat(200, 8, 0.1);
                audioSystem.startOscillator(150, 'sine', 0.05);
                break;
                
            case 'sleep':
                // Delta waves at 1-4Hz
                audioSystem.startBinauralBeat(150, 2, 0.12);
                audioSystem.startOscillator(80, 'sine', 0.05);
                break;
                
            case 'meditate':
                // Theta waves at 6Hz
                audioSystem.startBinauralBeat(180, 6, 0.1);
                audioSystem.startOscillator(100, 'sine', 0.05);
                break;
                
            case 'power-nap':
                // Sleep spindles
                audioSystem.startBinauralBeat(160, 12, 0.1);
                audioSystem.startOscillator(90, 'sine', 0.05);
                break;
        }
    }
    
    // Start background sounds that are active
    Object.entries(AppState.backgroundSounds).forEach(([sound, state]) => {
        if (state.active) {
            audioSystem.startNoise(sound, state.gain);
        }
    });
    
    AppState.isPlaying = true;
    visualizer.start();
    updatePlayButton();
    
    // Start timer if not already running
    if (!timer.isRunning) {
        timer.start();
    }
}

function playMusic(musicType) {
    switch (musicType) {
        case 'lofi':
            // Lofi - gentle filtered noise with soft beat feel
            audioSystem.startOscillator(80, 'sine', 0.03);
            audioSystem.startOscillator(120, 'sine', 0.02);
            audioSystem.startNoise('pink', 0.04);
            break;
            
        case 'ambient':
            // Ambient - atmospheric pads
            audioSystem.startOscillator(150, 'sine', 0.04);
            audioSystem.startOscillator(155, 'sine', 0.04);
            audioSystem.startOscillator(160, 'sine', 0.03);
            audioSystem.startNoise('pink', 0.02);
            break;
            
        case 'piano':
            // Piano - gentle melodic tones
            audioSystem.startOscillator(261.63, 'sine', 0.05); // C4
            audioSystem.startOscillator(329.63, 'sine', 0.04); // E4
            audioSystem.startOscillator(392, 'sine', 0.03); // G4
            audioSystem.startNoise('brown', 0.02);
            break;
            
        case 'violin':
            // Violin - warm string tones
            audioSystem.startOscillator(196, 'sawtooth', 0.03); // G3
            audioSystem.startOscillator(293.66, 'sine', 0.03); // D4
            audioSystem.startOscillator(392, 'sine', 0.025); // G4
            audioSystem.startNoise('pink', 0.03);
            break;
            
        case 'jazz':
            // Jazz - smooth chord tones
            audioSystem.startOscillator(220, 'sine', 0.03); // A3
            audioSystem.startOscillator(277.18, 'sine', 0.03); // C#4
            audioSystem.startOscillator(329.63, 'sine', 0.025); // E4
            audioSystem.startNoise('brown', 0.02);
            break;
            
        case 'cafe':
            // Cafe - ambient noise with occasional sounds
            audioSystem.startNoise('pink', 0.05);
            audioSystem.startOscillator(200, 'sine', 0.02);
            break;
            
        case 'library':
            // Library - very quiet with subtle ambient
            audioSystem.startNoise('brown', 0.02);
            audioSystem.startOscillator(440, 'sine', 0.01);
            break;
            
        case 'nature':
            // Nature - forest ambience
            audioSystem.startNoise('pink', 0.06);
            audioSystem.startOscillator(300, 'sine', 0.015);
            audioSystem.startOscillator(500, 'sine', 0.01);
            break;
    }
}

function toggleBackgroundSound(soundType) {
    const sound = AppState.backgroundSounds[soundType];
    sound.active = !sound.active;
    
    // Update UI
    const soundCard = document.querySelector(`.sound-card[data-sound="${soundType}"]`);
    soundCard.classList.toggle('active', sound.active);
    
    if (AppState.isPlaying) {
        if (sound.active) {
            audioSystem.startNoise(soundType, sound.gain);
        } else {
            audioSystem.stopNoise(soundType);
        }
    }
}

// ============================================
// Event Listeners
// ============================================
function initEventListeners() {
    // Navigation buttons
    DOM.navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            DOM.navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            AppState.currentCategory = btn.dataset.category;
            updateTrackInfo();
        });
    });
    
    // Category cards
    DOM.categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            DOM.categoryCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            AppState.currentCategory = card.dataset.category;
            
            // Update nav
            DOM.navBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.category === card.dataset.category);
            });
            
            updateTrackInfo();
            
            // If playing, restart with new category
            if (AppState.isPlaying) {
                audioSystem.stopAll();
                playAudio();
            }
        });
    });
    
    // Play button
    DOM.playBtn.addEventListener('click', playAudio);
    
    // Previous/Next buttons
    DOM.prevBtn.addEventListener('click', () => {
        const allCategories = Object.keys(AppState.tracks);
        const currentIndex = allCategories.indexOf(AppState.currentCategory);
        const prevIndex = (currentIndex - 1 + allCategories.length) % allCategories.length;
        
        AppState.currentCategory = allCategories[prevIndex];
        
        // Update UI based on category type
        const isMusic = AppState.tracks[AppState.currentCategory].waveType === 'music';
        
        if (isMusic) {
            DOM.navBtns.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
            document.querySelectorAll('.music-card').forEach(c => c.classList.remove('active'));
            document.querySelector(`.music-card[data-music="${AppState.currentCategory}"]`)?.classList.add('active');
        } else {
            DOM.navBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.category === AppState.currentCategory);
            });
            document.querySelectorAll('.music-card').forEach(c => c.classList.remove('active'));
            document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
            document.querySelector(`.category-card[data-category="${AppState.currentCategory}"]`)?.classList.add('active');
        }
        
        updateTrackInfo();
        
        if (AppState.isPlaying) {
            audioSystem.stopAll();
            playAudio();
        }
    });
    
    DOM.nextBtn.addEventListener('click', () => {
        const allCategories = Object.keys(AppState.tracks);
        const currentIndex = allCategories.indexOf(AppState.currentCategory);
        const nextIndex = (currentIndex + 1) % allCategories.length;
        
        AppState.currentCategory = allCategories[nextIndex];
        
        // Update UI based on category type
        const isMusic = AppState.tracks[AppState.currentCategory].waveType === 'music';
        
        if (isMusic) {
            DOM.navBtns.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
            document.querySelectorAll('.music-card').forEach(c => c.classList.remove('active'));
            document.querySelector(`.music-card[data-music="${AppState.currentCategory}"]`)?.classList.add('active');
        } else {
            DOM.navBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.category === AppState.currentCategory);
            });
            document.querySelectorAll('.music-card').forEach(c => c.classList.remove('active'));
            document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
            document.querySelector(`.category-card[data-category="${AppState.currentCategory}"]`)?.classList.add('active');
        }
        
        updateTrackInfo();
        
        if (AppState.isPlaying) {
            audioSystem.stopAll();
            playAudio();
        }
    });
    
    // Volume control
    DOM.volumeSlider.addEventListener('input', (e) => {
        const value = e.target.value / 100;
        AppState.volume = value;
        DOM.volumeValue.textContent = `${e.target.value}%`;
        audioSystem.setVolume(value);
    });
    
    // Progress bar click
    DOM.progressBar.addEventListener('click', (e) => {
        const rect = DOM.progressBar.getBoundingClientRect();
        const percentage = (e.clientX - rect.left) / rect.width;
        const newTime = Math.floor(percentage * timer.total);
        timer.time = timer.total - newTime;
        timer.updateDisplay();
        timer.updateRing();
    });
    
    // Timer controls
    DOM.startTimerBtn.addEventListener('click', () => {
        timer.start();
        DOM.startTimerBtn.style.display = 'none';
        DOM.pauseTimerBtn.style.display = 'flex';
        
        // Auto-play audio
        if (!AppState.isPlaying) {
            playAudio();
        }
    });
    
    DOM.pauseTimerBtn.addEventListener('click', () => {
        timer.pause();
        DOM.startTimerBtn.style.display = 'flex';
        DOM.pauseTimerBtn.style.display = 'none';
    });
    
    DOM.resetTimerBtn.addEventListener('click', () => {
        timer.reset();
        DOM.startTimerBtn.style.display = 'flex';
        DOM.pauseTimerBtn.style.display = 'none';
    });
    
    // Timer presets
    DOM.presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            DOM.presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const time = parseInt(btn.dataset.time);
            timer.setTime(time);
            
            // Update track duration
            const track = AppState.tracks[AppState.currentCategory];
            track.duration = time * 60;
            updateTrackInfo();
        });
    });
    
    // Background sounds
    DOM.soundCards.forEach(card => {
        card.addEventListener('click', () => {
            toggleBackgroundSound(card.dataset.sound);
        });
    });
    
    // Music category cards
    const musicCards = document.querySelectorAll('.music-card');
    musicCards.forEach(card => {
        card.addEventListener('click', () => {
            const musicType = card.dataset.music;
            
            // Update UI
            musicCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            AppState.currentCategory = musicType;
            
            // Update nav
            DOM.navBtns.forEach(btn => {
                btn.classList.remove('active');
            });
            
            updateTrackInfo();
            
            // If playing, restart with new category
            if (AppState.isPlaying) {
                audioSystem.stopAll();
                playAudio();
            }
        });
    });
    
    // Settings panel
    DOM.settingsBtn.addEventListener('click', () => {
        DOM.settingsPanel.classList.add('open');
    });
    
    DOM.closeSettings.addEventListener('click', () => {
        DOM.settingsPanel.classList.remove('open');
    });
    
    // Settings changes
    DOM.bitrateSelect.addEventListener('change', (e) => {
        settingsManager.update('bitrate', parseInt(e.target.value));
    });
    
    DOM.autoplayToggle.addEventListener('change', (e) => {
        settingsManager.update('autoplay', e.target.checked);
    });
    
    DOM.fadeoutToggle.addEventListener('change', (e) => {
        settingsManager.update('fadeOutEnabled', e.target.checked);
    });
    
    DOM.fadeDurationSlider.addEventListener('input', (e) => {
        DOM.fadeDurationValue.textContent = `${e.target.value}s`;
        settingsManager.update('fadeDuration', parseInt(e.target.value));
    });
    
    DOM.visualizerTypeSelect.addEventListener('change', (e) => {
        settingsManager.update('visualizerType', e.target.value);
    });
    
    DOM.darkModeToggle.addEventListener('change', (e) => {
        settingsManager.update('darkMode', e.target.checked);
    });
    
    // Close settings when clicking outside
    DOM.settingsPanel.addEventListener('click', (e) => {
        if (e.target === DOM.settingsPanel) {
            DOM.settingsPanel.classList.remove('open');
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;
        
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                playAudio();
                break;
            case 'ArrowLeft':
                DOM.prevBtn.click();
                break;
            case 'ArrowRight':
                DOM.nextBtn.click();
                break;
            case 'ArrowUp':
                e.preventDefault();
                const newVolume = Math.min(100, parseInt(DOM.volumeSlider.value) + 10);
                DOM.volumeSlider.value = newVolume;
                DOM.volumeSlider.dispatchEvent(new Event('input'));
                break;
            case 'ArrowDown':
                e.preventDefault();
                const newVolume2 = Math.max(0, parseInt(DOM.volumeSlider.value) - 10);
                DOM.volumeSlider.value = newVolume2;
                DOM.volumeSlider.dispatchEvent(new Event('input'));
                break;
        }
    });
}

function updateCategoryUI() {
    DOM.categoryCards.forEach(card => {
        card.classList.toggle('active', card.dataset.category === AppState.currentCategory);
    });
    
    DOM.navBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === AppState.currentCategory);
    });
    
    updateTrackInfo();
}

function updateTrackInfo() {
    const track = AppState.tracks[AppState.currentCategory];
    DOM.trackTitle.textContent = track.title;
    DOM.trackDescription.textContent = track.description;
    
    const minutes = Math.floor(track.duration / 60);
    const seconds = track.duration % 60;
    DOM.totalTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// ============================================
// Initialization
// ============================================
function init() {
    initEventListeners();
    updateTrackInfo();
    timer.updateDisplay();
    timer.updateRing();
    
    // Add CSS animation for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.8);
            }
            to {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
        }
        
        @keyframes fadeOut {
            to {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.8);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Initial visualizer draw
    visualizer.clear();
}

// Start the application
document.addEventListener('DOMContentLoaded', init);

// Export for debugging
window.MindFlow = {
    AppState,
    audioSystem,
    visualizer,
    timer,
    settingsManager,
    playAudio,
    toggleBackgroundSound
};

