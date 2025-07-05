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

## How to Run the Project

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 16.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** package manager
- **Git** for cloning the repository
- **Modern web browser** (Chrome, Firefox, Safari, or Edge)

### Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd note-pilot
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```
   *This will install all required packages including React, TypeScript, Vite, and audio processing libraries*

3. **Start Development Server**
   
   **Quick Option (using Make):**
   ```bash
   make quick
   ```
   *This automatically installs dependencies if needed and starts the server*
   
   **Manual Option (using npm):**
   ```bash
   npm run dev
   ```
   
4. **Open in Browser**
   - Navigate to **http://localhost:3000**
   - The application should load with the Note Pilot interface

### Available Scripts

**Option 1: Using Make (Recommended)**
```bash
# Quick start - installs and starts development server
make quick

# Complete setup with checks
make setup

# Start development server
make dev

# Build for production
make build

# Run all quality checks
make deploy-check

# See all available commands
make help
```

**Option 2: Using npm directly**
```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run type checking
npm run type-check

# Run linter
npm run lint

# Run linter with auto-fix
npm run lint:fix
```

### Development Workflow

1. **Start the dev server**: `make dev` or `npm run dev`
2. **Make changes** to the code - hot reload will update the browser automatically
3. **Test features**:
   - Upload a PDF file (try the included `sheet-music/concerning_hobbits.pdf`)
   - Click piano keys to hear audio
   - Enable microphone for pitch detection
   - Explore learning aids and controls
4. **Check code quality**: `make deploy-check` (runs build, lint, and type-check)
5. **Get project status**: `make status` to see system info and project health

### Production Build

To create an optimized production build:

**Using Make (Recommended):**
```bash
# Build and verify everything is ready for deployment
make deploy-check

# Or just build
make build

# Preview the production build
make preview
```

**Using npm directly:**
```bash
# Build the application
npm run build

# Serve the built files locally for testing
npm run preview
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

### Troubleshooting

**If you encounter issues:**

1. **Node.js version**: Ensure you're using Node.js 16+ (`node --version`)
2. **Clear cache**: Delete `node_modules/` and run `npm install` again
3. **Port conflicts**: If port 3000 is busy, Vite will automatically use the next available port
4. **Audio issues**: Some browsers require user interaction before playing audio - click anywhere on the page first
5. **Microphone permissions**: Grant microphone access when prompted for pitch detection features

**Browser-specific notes:**
- **Chrome/Edge**: Full functionality (recommended)
- **Firefox**: Full functionality 
- **Safari**: Some Web Audio limitations, but core features work
- **Mobile browsers**: Touch interface supported, microphone features may vary

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
