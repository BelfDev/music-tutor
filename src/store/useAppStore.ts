import { create } from 'zustand'

export interface Note {
  name: string
  frequency: number
  octave: number
  midi: number
}

export interface SongMetadata {
  title: string
  composer: string
  tempo: number
  timeSignature: string
  key: string
}

export interface AppState {
  // PDF and sheet music
  currentPDF: File | null
  sheetMusicPages: string[]
  currentPage: number
  
  // Playback
  isPlaying: boolean
  currentTempo: number
  currentBar: number
  currentBeat: number
  loopStart: number | null
  loopEnd: number | null
  
  // Piano and notes
  activeNotes: Note[]
  detectedNotes: Note[]
  showLetterNotation: boolean
  
  // Song information
  songMetadata: SongMetadata | null
  
  // Microphone
  microphoneEnabled: boolean
  microphonePermission: boolean
  
  // Learning aids
  showTips: boolean
  currentTips: string[]
  
  // UI state
  isLoading: boolean
  error: string | null
}

export interface AppActions {
  // PDF actions
  setPDF: (file: File) => void
  setSheetMusicPages: (pages: string[]) => void
  setCurrentPage: (page: number) => void
  
  // Playback actions
  setIsPlaying: (playing: boolean) => void
  setCurrentTempo: (tempo: number) => void
  setCurrentBar: (bar: number) => void
  setCurrentBeat: (beat: number) => void
  setLoopStart: (bar: number | null) => void
  setLoopEnd: (bar: number | null) => void
  
  // Piano actions
  setActiveNotes: (notes: Note[]) => void
  addActiveNote: (note: Note) => void
  removeActiveNote: (note: Note) => void
  setDetectedNotes: (notes: Note[]) => void
  setShowLetterNotation: (show: boolean) => void
  
  // Song metadata
  setSongMetadata: (metadata: SongMetadata) => void
  
  // Microphone actions
  setMicrophoneEnabled: (enabled: boolean) => void
  setMicrophonePermission: (permission: boolean) => void
  
  // Learning aids
  setShowTips: (show: boolean) => void
  setCurrentTips: (tips: string[]) => void
  
  // UI actions
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Reset
  reset: () => void
}

const initialState: AppState = {
  currentPDF: null,
  sheetMusicPages: [],
  currentPage: 0,
  isPlaying: false,
  currentTempo: 120,
  currentBar: 1,
  currentBeat: 1,
  loopStart: null,
  loopEnd: null,
  activeNotes: [],
  detectedNotes: [],
  showLetterNotation: true,
  songMetadata: null,
  microphoneEnabled: false,
  microphonePermission: false,
  showTips: true,
  currentTips: [],
  isLoading: false,
  error: null
}

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  ...initialState,
  
  // PDF actions
  setPDF: (file: File) => set({ currentPDF: file }),
  setSheetMusicPages: (pages: string[]) => set({ sheetMusicPages: pages }),
  setCurrentPage: (page: number) => set({ currentPage: page }),
  
  // Playback actions
  setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),
  setCurrentTempo: (tempo: number) => set({ currentTempo: tempo }),
  setCurrentBar: (bar: number) => set({ currentBar: bar }),
  setCurrentBeat: (beat: number) => set({ currentBeat: beat }),
  setLoopStart: (bar: number | null) => set({ loopStart: bar }),
  setLoopEnd: (bar: number | null) => set({ loopEnd: bar }),
  
  // Piano actions
  setActiveNotes: (notes: Note[]) => set({ activeNotes: notes }),
  addActiveNote: (note: Note) => {
    const { activeNotes } = get()
    if (!activeNotes.find(n => n.midi === note.midi)) {
      set({ activeNotes: [...activeNotes, note] })
    }
  },
  removeActiveNote: (note: Note) => {
    const { activeNotes } = get()
    set({ activeNotes: activeNotes.filter(n => n.midi !== note.midi) })
  },
  setDetectedNotes: (notes: Note[]) => set({ detectedNotes: notes }),
  setShowLetterNotation: (show: boolean) => set({ showLetterNotation: show }),
  
  // Song metadata
  setSongMetadata: (metadata: SongMetadata) => set({ songMetadata: metadata }),
  
  // Microphone actions
  setMicrophoneEnabled: (enabled: boolean) => set({ microphoneEnabled: enabled }),
  setMicrophonePermission: (permission: boolean) => set({ microphonePermission: permission }),
  
  // Learning aids
  setShowTips: (show: boolean) => set({ showTips: show }),
  setCurrentTips: (tips: string[]) => set({ currentTips: tips }),
  
  // UI actions
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  
  // Reset
  reset: () => set(initialState)
}))