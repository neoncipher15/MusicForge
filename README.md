# MindFlow - Brain.fm Alternative

**AI-generated neuroacoustic soundscapes for focus, relaxation, and sleep**

![MindFlow Banner](https://via.placeholder.com/1200x400/6366f1/ffffff?text=MindFlow+-+Focus+Relax+Sleep)

## 🎯 Overview

MindFlow is a full-featured alternative to brain.fm, providing AI-generated audio experiences designed to enhance cognitive performance, reduce stress, and improve sleep quality. Using the Web Audio API, we generate real-time neuroacoustic soundscapes based on scientifically-backed brainwave frequencies.

## ✨ Features

### Core Functionality
- **🎧 Multiple Audio Categories**
  - Focus (40Hz Gamma Waves)
  - Relax (7-8Hz Alpha Waves)
  - Sleep (1-4Hz Delta Waves)
  - Meditate (Theta Waves)
  - Power Nap (Sleep Spindles)

- **⏱️ Smart Timer System**
  - Adjustable session timer (5-60 minutes)
  - Preset time buttons
  - Visual countdown ring
  - Automatic session end with gentle fade-out

- **🎵 Background Sounds**
  - Rain
  - Ocean waves
  - Forest ambience
  - Wind
  - White noise
  - Fireplace

### Technical Features
- **🔊 Real-time Audio Generation**
  - Binaural beats generation
  - Multiple oscillator support
  - Noise generation with filters
  - Smooth fade transitions

- **📊 Live Visualizer**
  - Bar visualization
  - Waveform display
  - Circular frequency analysis

- **💾 User Preferences**
  - Audio quality settings
  - Auto-play configuration
  - Fade duration control
  - Visualizer type selection
  - Dark/light mode

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server required - runs entirely in the browser

### Installation

1. Clone or download the project:
```bash
git clone https://github.com/yourusername/MindFlow.git
cd MindFlow
```

2. Open `index.html` in your web browser:
```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

Or use a local development server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js (with http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## 📖 Usage Guide

### Starting a Session

1. **Select a Category**: Click on Focus, Relax, Sleep, Meditate, or Power Nap
2. **Set Timer**: Choose a preset time or adjust as needed
3. **Add Background Sound** (optional): Click on rain, ocean, etc.
4. **Press Play**: Click the play button or press Space
5. **Enjoy**: Let the soundscape work its magic

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play/Pause |
| `←` | Previous category |
| `→` | Next category |
| `↑` | Volume up |
| `↓` | Volume down |

### Settings

Access settings by clicking the gear icon:
- **Audio Quality**: 128/192/320 kbps
- **Auto-play**: Start session automatically
- **Fade Out**: Gentle audio fade at session end
- **Visualizer**: Choose visualization style
- **Dark Mode**: Toggle theme

## 🧠 Science Behind MindFlow

### Brainwave Frequencies

| Category | Frequency | Effect |
|----------|-----------|--------|
| **Gamma** | 40Hz | Enhanced focus, cognition |
| **Alpha** | 7-8Hz | Relaxation, stress reduction |
| **Theta** | 4-7Hz | Meditation, creativity |
| **Delta** | 1-4Hz | Deep sleep, healing |
| **Sleep Spindles** | 12-14Hz | Memory consolidation |

### Binaural Beats

MindFlow uses binaural beats - playing slightly different frequencies in each ear to create a perceived beat frequency that matches target brainwave states.

## 🛠️ Technical Architecture

### File Structure
```
MusicForge/
├── index.html      # Main HTML structure
├── styles.css      # Complete styling
├── app.js          # Application logic
├── README.md       # Documentation
├── PLAN.md         # Development plan
└── .git/           # Version control
```

### Technology Stack

- **HTML5**: Semantic structure and accessibility
- **CSS3**: Modern features, animations, responsive design
- **JavaScript (ES6+)**: Application logic
- **Web Audio API**: Real-time audio generation
- **localStorage**: User preferences persistence

### Audio System

The audio engine uses:
- `AudioContext` for the main audio pipeline
- `OscillatorNode` for tone generation
- `BiquadFilterNode` for sound shaping
- `GainNode` for volume control
- `AnalyserNode` for visualization

### Performance Considerations

- Efficient canvas rendering for visualizer
- Optimized audio node connections
- Smooth CSS transitions
- Lazy loading of audio resources

## 📱 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 66+ | ✅ Full Support |
| Firefox | 76+ | ✅ Full Support |
| Safari | 14.1+ | ✅ Full Support |
| Edge | 79+ | ✅ Full Support |
| Opera | 53+ | ✅ Full Support |

## 🔒 Privacy & Security

- All audio is generated locally in your browser
- No data is sent to external servers
- No tracking or analytics
- No cookies required

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Ways to Contribute

- 🐛 Report bugs
- 💡 Suggest features
- 📝 Improve documentation
- 💻 Submit pull requests

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [brain.fm](https://brain.fm) for inspiration
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) documentation
- Neuroacoustic research community
- Open source community

## 📞 Support

- 📧 Email: support@mindflow.app
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/MindFlow/issues)
- 💬 Discord: [Join our community](https://discord.gg/mindflow)

---

**Made with ❤️ for better brain function**

🌊 Flow with your mind. Sleep better. Focus deeper.

