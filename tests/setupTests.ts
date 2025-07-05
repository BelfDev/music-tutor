import '@testing-library/jest-dom'

// Mock pdfjs-dist
jest.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: {
    workerSrc: ''
  },
  getDocument: jest.fn().mockImplementation(() => ({
    promise: Promise.resolve({
      numPages: 1,
      getPage: jest.fn().mockImplementation(() => Promise.resolve({
        getViewport: jest.fn().mockReturnValue({
          width: 100,
          height: 100
        }),
        render: jest.fn().mockReturnValue({
          promise: Promise.resolve()
        })
      })),
      getMetadata: jest.fn().mockResolvedValue({
        info: {
          Title: 'Test Song',
          Author: 'Test Composer'
        }
      })
    })
  }))
}))

// Mock tone.js
jest.mock('tone', () => ({
  Synth: jest.fn().mockImplementation(() => ({
    toDestination: jest.fn().mockReturnThis(),
    triggerAttackRelease: jest.fn(),
    triggerAttack: jest.fn(),
    triggerRelease: jest.fn(),
    dispose: jest.fn(),
  })),
  Transport: {
    start: jest.fn(),
    stop: jest.fn(),
    pause: jest.fn(),
    bpm: { value: 120 },
    position: 0,
    schedule: jest.fn(),
    scheduleRepeat: jest.fn(),
    cancel: jest.fn(),
    clear: jest.fn(),
  },
  start: jest.fn(),
  getDestination: jest.fn(),
  getContext: jest.fn(() => ({
    resume: jest.fn(),
    state: 'running',
  })),
  loaded: jest.fn(() => Promise.resolve()),
  PolySynth: jest.fn().mockImplementation(() => ({
    toDestination: jest.fn().mockReturnThis(),
    triggerAttackRelease: jest.fn(),
    triggerAttack: jest.fn(),
    triggerRelease: jest.fn(),
    dispose: jest.fn(),
  })),
  Part: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    dispose: jest.fn(),
  })),
  Sequence: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    dispose: jest.fn(),
  })),
}))

// Mock Web Audio API
const mockAudioContext = {
  createOscillator: jest.fn(),
  createGain: jest.fn(),
  createAnalyser: jest.fn(),
  createMediaStreamSource: jest.fn(),
  destination: {},
  currentTime: 0,
  state: 'running',
  suspend: jest.fn(),
  resume: jest.fn(),
  close: jest.fn(),
  sampleRate: 44100,
}

Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: jest.fn().mockImplementation(() => mockAudioContext),
})

Object.defineProperty(window, 'webkitAudioContext', {
  writable: true,
  value: jest.fn().mockImplementation(() => mockAudioContext),
})

// Mock getUserMedia
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: jest.fn().mockReturnValue([{
        stop: jest.fn()
      }]),
    }),
  },
})

// Mock fetch for PDF loading
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>

// Mock File API
Object.defineProperty(window, 'File', {
  writable: true,
  value: class File {
    name: string
    type: string
    size: number
    lastModified: number

    constructor(parts: BlobPart[], name: string, options?: FilePropertyBag) {
      this.name = name
      this.type = options?.type || ''
      this.size = parts.reduce((size, part) => {
        if (typeof part === 'string') return size + part.length
        if (part instanceof Blob) return size + part.size
        return size + (part as ArrayBuffer).byteLength
      }, 0)
      this.lastModified = options?.lastModified || Date.now()
    }

    arrayBuffer(): Promise<ArrayBuffer> {
      return Promise.resolve(new ArrayBuffer(0))
    }
  }
})

// Mock FileReader
Object.defineProperty(window, 'FileReader', {
  writable: true,
  value: class MockFileReader {
    result: string | ArrayBuffer | null = null
    onload: ((event: any) => void) | null = null
    onerror: ((event: any) => void) | null = null

    readAsDataURL(_file: File): void {
      setTimeout(() => {
        this.result = 'data:application/pdf;base64,mock-data'
        if (this.onload) {
          this.onload({ target: this } as any)
        }
      }, 0)
    }

    addEventListener(_type: string, _listener: any): void {}
    removeEventListener(_type: string, _listener: any): void {}
    dispatchEvent(_event: Event): boolean { return true }
  }
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock canvas for PDF rendering
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: jest.fn(() => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    putImageData: jest.fn(),
    createImageData: jest.fn(() => ({ data: new Array(4) })),
    getImageData: jest.fn(() => ({ data: new Array(4) })),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    translate: jest.fn(),
    transform: jest.fn(),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
  }))
})

// Mock canvas toDataURL
Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
  value: jest.fn(() => 'data:image/png;base64,mock-canvas-data')
})