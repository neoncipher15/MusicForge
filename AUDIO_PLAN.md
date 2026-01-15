# Audio Categories Implementation - Detailed Plan

## Information Gathered

From analyzing the codebase:

### Current State:
1. **index.html** has:
   - Timer section with play/pause/reset buttons
   - Sound toggle button for session completion sounds
   - Task card on the right
   - Sidebar navigation
   - No audio category selection or player controls

2. **app.js** has:
   - Timer functionality (25 min default)
   - Task management
   - Sound toggle for completion chime
   - Session data storage
   - No audio playback system

3. **styles.css** has:
   - Timer ring styles
   - Button styles
   - No audio player or category selector styles

### What needs to be added:
1. Audio category selector (5 categories: Focus, Relax, Sleep, Meditate, Power Nap)
2. Audio player controls (play/pause, volume, progress)
3. Web Audio API implementation for generating:
   - Binaural beats at specific frequencies
   - Ambient noise layers (pink noise for sleep)
   - Smooth fade transitions
4. Audio visualizer showing real-time audio waves
5. Category info panel with descriptions

## Plan

### Step 1: Update index.html
Add to the timer section:
- Audio category selector (5 cards with icons)
- Category info display
- Audio player controls (below timer)
- Audio visualizer canvas
- Volume slider

### Step 2: Update styles.css
Add:
- Category selector styles (cards with hover effects)
- Audio player styles (controls, progress bar)
- Visualizer canvas styles
- Animations for audio states
- Responsive design for audio section

### Step 3: Update app.js
Add:
- Web Audio API context setup
- Audio category data structure
- Binaural beat generators
- Noise generators
- Audio player logic (play/pause/stop)
- Volume control
- Fade in/out transitions
- Visualizer animation loop
- Category switching logic
- Local storage for audio preferences

## Dependent Files to be edited
1. `index.html` - Add audio UI elements
2. `app.js` - Add audio engine and player logic
3. `styles.css` - Add audio component styles

## Followup steps after editing
1. Test audio playback in browser
2. Verify binaural beat frequencies
3. Test category switching
4. Check visualizer performance
5. Verify fade transitions
6. Test volume control
7. Check local storage persistence
8. Test on mobile devices
9. Verify audio doesn't overlap with timer sounds

## Audio Categories Details

### 1. Focus (Gamma Waves - 40Hz)
- Base frequency: 200Hz
- Binaural beat: 40Hz (difference between left/right ears)
- Visual: Blue/Purple gradient
- Description: "Enhance concentration and mental clarity"

### 2. Relax (Alpha Waves - 7-8Hz)
- Base frequency: 180Hz
- Binaural beat: 7Hz
- Visual: Green/Teal gradient
- Description: "Reduce stress and promote calm"

### 3. Sleep (Delta Waves - 1-4Hz)
- Base frequency: 160Hz
- Binaural beat: 2Hz
- Additional: Pink noise layer
- Visual: Dark Blue/Indigo gradient
- Description: "Deep sleep and restoration"

### 4. Meditate (Theta Waves - 5-7Hz)
- Base frequency: 170Hz
- Binaural beat: 6Hz
- Visual: Orange/Gold gradient
- Description: "Deep meditation and mindfulness"

### 5. Power Nap (Theta/Delta - 4Hz)
- Base frequency: 165Hz
- Binaural beat: 4Hz
- Additional: Soft pink noise
- Visual: Purple/Pink gradient
- Description: "Quick rest and rejuvenation"

## Technical Implementation

### Web Audio API Structure:
- AudioContext (singleton)
- Master gain node (volume)
- Per-category nodes:
  - Left oscillator (sine wave)
  - Right oscillator (sine wave with frequency offset)
  - Stereo panner nodes
  - Gain nodes for fade control
  - Analyser node for visualizer
  - Noise buffer (for sleep categories)

### Audio States:
- `audioContext` - Web Audio API context
- `isPlaying` - Is audio currently playing
- `currentCategory` - Currently selected category
- `volume` - Master volume level
- `audioGain` - Current audio gain (for fade)
- `analyser` - Analyser node for visualizer

### Functions to add:
- `initAudio()` - Initialize audio context
- `playAudio()` - Start playing current category
- `pauseAudio()` - Pause audio with fade out
- `stopAudio()` - Stop audio completely
- `setVolume()` - Set master volume
- `selectCategory()` - Switch to different category
- `updateVisualizer()` - Animation loop for visualizer
- `fadeIn()` / `fadeOut()` - Smooth transitions
- `createBinauralBeat()` - Generate binaural frequencies
- `createNoise()` - Generate noise layers

