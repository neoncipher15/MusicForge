# Audio Categories Implementation Plan

## Overview
Add audio categories (Focus, Relax, Sleep, Meditate, Power Nap) using Web Audio API to generate neuroacoustic soundscapes. This creates a brain.fm alternative experience.

## Features to Implement

### Phase 1: Audio Categories
- **Focus** - Binaural beats at 40Hz (gamma waves) + ambient drone
- **Relax** - Binaural beats at 7-8Hz (alpha waves) + gentle pad
- **Sleep** - Binaural beats at 1-4Hz (delta waves) + deep bass
- **Meditate** - Binaural beats at 5-7Hz (theta waves) + singing bowls
- **Power Nap** - Pink noise + soft theta waves for quick rest

### Phase 2: UI Components
- Category selector with icons and descriptions
- Audio player controls (play/pause, volume, progress)
- Visualizer showing audio waves
- Smooth transitions between categories

### Phase 3: Technical Implementation
- Web Audio API for sound generation
- Oscillators for binaural beats
- Noise generators (pink/white/brown)
- Gain nodes for volume control
- Fade in/out transitions
- Local storage for preferences

## Files to Modify
1. **index.html** - Add category selector UI, audio player, visualizer
2. **app.js** - Add Web Audio API implementation, category logic
3. **styles.css** - Add audio player styles, visualizer animations

## Audio Specifications

### Binaural Beat Frequencies
| Category | Base Freq | Beat Freq | Wave Type |
|----------|-----------|-----------|-----------|
| Focus | 200Hz | 40Hz | Gamma |
| Relax | 180Hz | 7Hz | Alpha |
| Sleep | 160Hz | 2Hz | Delta |
| Meditate | 170Hz | 6Hz | Theta |
| Power Nap | 165Hz | 4Hz | Theta/Delta |

### Additional Layers
- Pink noise for sleep/power nap
- Ambient drone for all categories
- Soft attack/release envelopes
- Stereo panning for binaural effect

## Implementation Steps
1. Create audio context and category system
2. Implement binaural beat generators
3. Add noise layers for relaxation
4. Build category selector UI
5. Add player controls
6. Implement visualizer
7. Add fade transitions
8. Persist preferences

## Estimated Time
- Implementation: 3-4 hours
- Testing & refinement: 1-2 hours

