# Note Pilot 🎹

A comprehensive web-based piano sheet music learning application that accelerates the process of learning new piano pieces through interactive features, real-time feedback, and comprehensive learning aids.

## Features

### 🎼 Sheet Music Display
- Upload and display PDF sheet music with clear, responsive rendering
- Auto-scroll functionality synchronized with playback
- Zoom controls and page navigation
- Local processing - no data leaves your browser

### 🎹 Interactive Piano Keyboard
- Full 88-key virtual piano with realistic visual feedback
- Real-time note highlighting as you play
- Support for both mouse/touch and keyboard input
- Dual notation display (standard notation + letter names A-G)

### 🎵 Audio Playback & Synthesis
- High-quality audio synthesis using Web Audio API
- Adjustable tempo control (60-200 BPM)
- Loop sections for focused practice
- Play along with the sheet music

### 🎤 Real-time Microphone Input
- **Privacy-first**: All audio processing happens locally in your browser
- Real-time pitch detection and note recognition
- Visual feedback showing detected notes
- Error detection and practice guidance

### 🧠 Learning Aids
- Context-specific tips based on your sheet music
- Pattern recognition for common musical structures
- General piano technique guidance
- Interactive learning suggestions

### 📱 Modern UX
- Responsive design works on desktop, tablet, and mobile
- Dark theme optimized for long practice sessions
- Accessibility features including keyboard navigation
- Progressive Web App capabilities

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Audio**: Tone.js + Web Audio API
- **PDF Processing**: PDF.js
- **Pitch Detection**: PitchFinder
- **Styling**: Sass/SCSS
- **State Management**: Zustand

## Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd note-pilot
   npm install
   ```

2. **Development**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

3. **Production Build**
   ```bash
   npm run build
   npm run preview
   ```

## Usage

1. **Upload Sheet Music**: Drag & drop or click to upload a PDF file
2. **Interactive Piano**: Click keys to play notes, toggle letter notation
3. **Playback Controls**: Use play/pause, adjust tempo, set loop points
4. **Microphone**: Enable microphone for real-time feedback as you play
5. **Learning Aids**: Access context-specific tips and pattern recognition

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| PDF Display | ✅ | ✅ | ✅ | ✅ |
| Audio Synthesis | ✅ | ✅ | ✅ | ✅ |
| Microphone Input | ✅ | ✅ | ✅ | ✅ |
| Pitch Detection | ✅ | ✅ | ⚠️ | ✅ |

## Privacy & Security

- **100% Local Processing**: No data is sent to external servers
- **No Account Required**: Use immediately without signup
- **Microphone Privacy**: Audio is processed in real-time, never stored
- **Open Source**: Full transparency in code and data handling

## Documentation

- [Technical Architecture](./docs/TECH_STACK.md)
- [User Guide](./docs/README.md)
- [API Documentation](./docs/API.md)

## Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Examples

### Try with the included sample
The repository includes a sample sheet music file in `sheet-music/concerning_hobbits.pdf` to test the application.

### Supported PDF Types
- Standard piano sheet music
- Lead sheets with chord symbols
- Classical scores
- Popular music arrangements

## Support

For issues, questions, or feature requests, please [open an issue](https://github.com/your-repo/note-pilot/issues).

---

**Note Pilot** - Learn piano faster with interactive technology 🚀
