# Note Pilot Documentation

Welcome to Note Pilot - a comprehensive web-based piano sheet music learning application.

## Overview

Note Pilot is designed to accelerate the process of learning new piano sheet music through interactive features, real-time feedback, and comprehensive learning aids.

## Features

### Core Functionality
- **PDF Sheet Music Display**: Upload and view sheet music PDFs with auto-scrolling
- **Interactive Piano Keyboard**: Full 88-key virtual piano with real-time note highlighting
- **Dual Notation Support**: Toggle between standard notation and letter notation (A-G)
- **Audio Playback**: Play sheet music with adjustable tempo and looping capabilities
- **Real-time Microphone Input**: Pitch detection and feedback using your device's microphone
- **Learning Aids**: Context-specific tips and pattern recognition

### Technical Features
- **Local Processing**: All audio and PDF processing happens in your browser
- **Privacy-First**: No data is sent to external servers
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Accessibility**: Screen reader compatible with keyboard navigation support

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Microphone access (optional, for pitch detection features)

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open `http://localhost:3000` in your browser

### Building for Production
```bash
npm run build
npm run preview
```

## User Guide

### Uploading Sheet Music
1. Click the upload area or drag & drop a PDF file
2. Wait for processing (happens locally in your browser)
3. The sheet music will appear with interactive controls

### Using the Piano
- Click keys to play notes
- Toggle letter notation on/off
- Keys highlight when played or detected from microphone

### Playback Controls
- **Play/Pause**: Start or stop audio playback
- **Tempo**: Adjust playback speed (60-200 BPM)
- **Loop**: Set start and end points for practice sections

### Microphone Features
1. Click "Start" to enable microphone
2. Grant browser permission when prompted
3. Play your piano/keyboard - notes will be detected and displayed
4. Visual feedback shows which keys you're playing

### Learning Aids
- **Context Tips**: Automatically generated based on your sheet music
- **General Tips**: Piano technique and practice advice
- **Pattern Recognition**: Identify common musical patterns

## Technical Architecture

### Frontend Stack
- **React 18**: User interface framework
- **TypeScript**: Type-safe JavaScript
- **Sass**: Advanced CSS preprocessing
- **Vite**: Fast build tool and development server

### Audio Processing
- **Tone.js**: Web Audio API wrapper for synthesis
- **PitchFinder**: Real-time pitch detection
- **Web Audio API**: Native browser audio processing

### PDF Processing
- **PDF.js**: Client-side PDF rendering and processing

### State Management
- **Zustand**: Lightweight state management

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| PDF Display | ✅ | ✅ | ✅ | ✅ |
| Audio Synthesis | ✅ | ✅ | ✅ | ✅ |
| Microphone Input | ✅ | ✅ | ✅ | ✅ |
| Pitch Detection | ✅ | ✅ | ⚠️ | ✅ |

*⚠️ Safari has some limitations with Web Audio API features*

## Privacy and Security

- **No Server Communication**: All processing happens locally
- **No Data Storage**: Files are processed in memory only
- **Microphone Privacy**: Audio is processed in real-time, never stored
- **Secure by Design**: No external dependencies for core functionality

## Performance Considerations

### PDF Processing
- Large PDFs may take longer to process
- Processing happens once on upload
- Rendered pages are cached in memory

### Audio Processing
- Real-time pitch detection requires modern CPU
- Recommended minimum: 2GB RAM, modern processor
- Performance scales with audio buffer size

### Memory Usage
- Sheet music pages stored as images in memory
- Large scores may use significant RAM
- Browser will manage memory automatically

## Troubleshooting

### Common Issues

**PDF not loading**
- Ensure PDF is not password protected
- Check browser console for errors
- Try a different PDF file

**Microphone not working**
- Grant microphone permission in browser
- Check browser audio settings
- Ensure microphone is not used by another application

**Audio playback issues**
- Check browser audio permissions
- Ensure speakers/headphones are connected
- Try refreshing the page

**Performance issues**
- Close other browser tabs
- Check available system memory
- Try reducing audio quality settings

### Browser-Specific Issues

**Safari**
- May require user interaction before audio playback
- Some Web Audio features have limited support

**Firefox**
- Ensure hardware acceleration is enabled
- Check privacy settings for microphone access

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

This project is licensed under the MIT License - see [LICENSE.md](./LICENSE.md) for details.