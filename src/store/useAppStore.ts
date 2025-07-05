import { create } from 'zustand'
import { AudioEngine } from '../utils/audioEngine'
import { MusicSequence } from '../utils/musicNotationParser'

export interface Note {
  name: string
  frequency: number
  octave: number
  midi: number
}

export interface SongMetadata {
  title: string
  artist: string
  key: string
  timeSignature: string
  tempo: number
  difficulty: string
  genre: string
  duration: number
}

export interface SheetMusicItem {
  id: string
  name: string
  file: File
  metadata: SongMetadata
  pages: string[]
  createdAt: Date
  lastPlayed?: Date
}

export interface AppState {
  // Sheet music state
  sheetMusicCollection: SheetMusicItem[]
  currentSheetMusic: SheetMusicItem | null
  sheetMusicPages: string[]
  currentPage: number
  currentPDF: File | null
  currentMusicSequence: MusicSequence | null
  
  // Playback state
  isPlaying: boolean
  isPaused: boolean
  currentTime: number
  totalDuration: number
  currentBar: number
  currentMeasure: number
  playbackProgress: number
  activeNotes: Note[]
  
  // Audio engine
  audioEngine: AudioEngine
  
  // UI state
  isLoading: boolean
  error: string | null
  
  // Learning state
  currentSection: { start: number; end: number }
  practiceMode: boolean
  showHints: boolean
  
  // Actions
  setCurrentSheetMusic: (sheetMusic: SheetMusicItem | null) => void
  setSheetMusicPages: (pages: string[]) => void
  setCurrentPage: (page: number) => void
  setCurrentPDF: (file: File | null) => void
  setCurrentMusicSequence: (sequence: MusicSequence | null) => void
  loadSheetMusicCollection: (collection: SheetMusicItem[]) => void
  addSheetMusicItem: (item: SheetMusicItem) => void
  removeSheetMusicItem: (id: string) => void
  
  // Playback actions
  play: () => Promise<void>
  pause: () => void
  stop: () => void
  seekTo: (time: number) => void
  setCurrentTime: (time: number) => void
  setCurrentBar: (bar: number) => void
  setCurrentMeasure: (measure: number) => void
  setActiveNotes: (notes: Note[]) => void
  
  // UI actions
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Learning actions
  setCurrentSection: (section: { start: number; end: number }) => void
  setPracticeMode: (enabled: boolean) => void
  setShowHints: (show: boolean) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  sheetMusicCollection: [],
  currentSheetMusic: null,
  sheetMusicPages: [],
  currentPage: 0,
  currentPDF: null,
  currentMusicSequence: null,
  
  isPlaying: false,
  isPaused: false,
  currentTime: 0,
  totalDuration: 0,
  currentBar: 0,
  currentMeasure: 1,
  playbackProgress: 0,
  activeNotes: [],
  
  audioEngine: new AudioEngine(),
  
  isLoading: false,
  error: null,
  
  currentSection: { start: 1, end: 4 },
  practiceMode: false,
  showHints: true,
  
  // Actions
  setCurrentSheetMusic: (sheetMusic) => {
    set({ currentSheetMusic: sheetMusic })
    if (sheetMusic) {
      set({ 
        sheetMusicPages: sheetMusic.pages,
        currentPage: 0,
        currentPDF: sheetMusic.file
      })
    } else {
      set({ 
        sheetMusicPages: [],
        currentPage: 0,
        currentPDF: null,
        currentMusicSequence: null
      })
    }
  },
  
  setSheetMusicPages: (pages) => set({ sheetMusicPages: pages }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setCurrentPDF: (file) => set({ currentPDF: file }),
  
  setCurrentMusicSequence: (sequence) => {
    set({ currentMusicSequence: sequence })
    if (sequence) {
      const state = get()
      state.audioEngine.loadSequence(sequence)
      set({ 
        totalDuration: state.audioEngine.getDuration(),
        currentSection: { start: 1, end: Math.min(4, sequence.totalMeasures) }
      })
    }
  },
  
  loadSheetMusicCollection: (collection) => set({ sheetMusicCollection: collection }),
  
  addSheetMusicItem: (item) => {
    const state = get()
    const updatedCollection = [...state.sheetMusicCollection, item]
    set({ sheetMusicCollection: updatedCollection })
  },
  
  removeSheetMusicItem: (id) => {
    const state = get()
    const updatedCollection = state.sheetMusicCollection.filter(item => item.id !== id)
    set({ sheetMusicCollection: updatedCollection })
  },
  
  // Playback actions
  play: async () => {
    const state = get()
    if (!state.currentMusicSequence) {
      console.error('No music sequence loaded')
      return
    }
    
    try {
      set({ isPlaying: true, isPaused: false })
      
      await state.audioEngine.play((currentTime) => {
        const progress = state.totalDuration > 0 ? (currentTime / state.totalDuration) * 100 : 0
        const currentMeasure = state.audioEngine.getCurrentMeasure(currentTime)
        
        // Get active notes at current time
        const activeNotes = state.audioEngine.getActiveNotes(currentTime)
        const storeNotes: Note[] = activeNotes.map(musicNote => ({
          name: musicNote.pitch.replace(/[0-9]/g, ''), // Remove octave number
          frequency: musicNote.frequency,
          octave: parseInt(musicNote.pitch.match(/[0-9]/)?.[0] || '4'),
          midi: musicNote.midi
        }))
        
        set({ 
          currentTime,
          playbackProgress: progress,
          currentMeasure,
          currentBar: currentMeasure,
          activeNotes: storeNotes
        })
      })
    } catch (error) {
      console.error('Failed to start playback:', error)
      set({ isPlaying: false, error: 'Failed to start playback' })
    }
  },
  
  pause: () => {
    const state = get()
    state.audioEngine.pause()
    set({ isPlaying: false, isPaused: true, activeNotes: [] })
  },
  
  stop: () => {
    const state = get()
    state.audioEngine.stop()
    set({ 
      isPlaying: false, 
      isPaused: false, 
      currentTime: 0, 
      playbackProgress: 0,
      currentBar: 0,
      currentMeasure: 1,
      activeNotes: []
    })
  },
  
  seekTo: (time) => {
    const state = get()
    const clampedTime = Math.max(0, Math.min(time, state.totalDuration))
    const progress = state.totalDuration > 0 ? (clampedTime / state.totalDuration) * 100 : 0
    const currentMeasure = state.audioEngine.getCurrentMeasure(clampedTime)
    
    set({ 
      currentTime: clampedTime,
      playbackProgress: progress,
      currentMeasure,
      currentBar: currentMeasure
    })
  },
  
  setCurrentTime: (time) => {
    const state = get()
    const progress = state.totalDuration > 0 ? (time / state.totalDuration) * 100 : 0
    const currentMeasure = state.currentMusicSequence ? 
      state.audioEngine.getCurrentMeasure(time) : 1
    
    set({ 
      currentTime: time,
      playbackProgress: progress,
      currentMeasure,
      currentBar: currentMeasure
    })
  },
  
  setCurrentBar: (bar) => set({ currentBar: bar }),
  setCurrentMeasure: (measure) => set({ currentMeasure: measure }),
  
  setActiveNotes: (notes) => set({ activeNotes: notes }),
  
  // UI actions
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  // Learning actions
  setCurrentSection: (section) => set({ currentSection: section }),
  setPracticeMode: (enabled) => set({ practiceMode: enabled }),
  setShowHints: (show) => set({ showHints: show })
}))