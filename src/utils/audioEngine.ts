import { MusicNote, MusicSequence } from './musicNotationParser'

export interface AudioEngineConfig {
  volume: number
  tempo: number
  instrument: string
}

export class AudioEngine {
  private audioContext: AudioContext | null = null
  private gainNode: GainNode | null = null
  private scheduledNotes: Map<number, OscillatorNode> = new Map()
  private currentSequence: MusicSequence | null = null
  private isPlaying = false
  private startTime = 0
  private pausedTime = 0
  private config: AudioEngineConfig = {
    volume: 0.5,
    tempo: 120,
    instrument: 'piano'
  }

  constructor() {
    this.initializeAudioContext()
  }

  private async initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.gainNode = this.audioContext.createGain()
      this.gainNode.connect(this.audioContext.destination)
      this.gainNode.gain.value = this.config.volume
      
      // Resume audio context if suspended (required by some browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }
    } catch (error) {
      console.error('Failed to initialize audio context:', error)
    }
  }

  async loadSequence(sequence: MusicSequence): Promise<void> {
    this.currentSequence = sequence
    this.config.tempo = sequence.metadata.tempo
    console.log('Loaded music sequence:', sequence.metadata.title)
    console.log('Total measures:', sequence.totalMeasures)
    console.log('Total duration:', sequence.totalDuration, 'beats')
  }

  async play(onProgress?: (currentTime: number) => void): Promise<void> {
    if (!this.audioContext || !this.currentSequence) {
      console.error('Audio context or sequence not ready')
      return
    }

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }

    this.isPlaying = true
    this.startTime = this.audioContext.currentTime - this.pausedTime
    
    console.log('Starting playback at time:', this.startTime)
    
    // Schedule all notes
    this.scheduleSequence(onProgress)
  }

  pause(): void {
    this.isPlaying = false
    this.pausedTime = this.audioContext ? this.audioContext.currentTime - this.startTime : 0
    this.stopAllNotes()
    console.log('Paused at time:', this.pausedTime)
  }

  stop(): void {
    this.isPlaying = false
    this.pausedTime = 0
    this.stopAllNotes()
    console.log('Stopped playback')
  }

  setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume))
    if (this.gainNode) {
      this.gainNode.gain.value = this.config.volume
    }
  }

  setTempo(tempo: number): void {
    this.config.tempo = Math.max(40, Math.min(200, tempo))
    if (this.currentSequence) {
      this.currentSequence.metadata.tempo = this.config.tempo
    }
  }

  getCurrentTime(): number {
    if (!this.audioContext || !this.isPlaying) {
      return this.pausedTime
    }
    return this.audioContext.currentTime - this.startTime
  }

  getDuration(): number {
    if (!this.currentSequence) return 0
    // Convert beats to seconds based on tempo
    const beatsPerSecond = this.config.tempo / 60
    return this.currentSequence.totalDuration / beatsPerSecond
  }

  private scheduleSequence(onProgress?: (currentTime: number) => void): void {
    if (!this.currentSequence || !this.audioContext) return

    const beatsPerSecond = this.config.tempo / 60
    let scheduledNotesCount = 0

    // Schedule all notes from all measures
    for (const measure of this.currentSequence.measures) {
      for (const note of measure.notes) {
        const noteStartTime = this.startTime + (note.startTime / beatsPerSecond)
        const noteDuration = note.duration / beatsPerSecond
        
        // Only schedule notes that haven't passed yet
        if (noteStartTime > this.audioContext.currentTime) {
          this.scheduleNote(note, noteStartTime, noteDuration)
          scheduledNotesCount++
        }
      }
    }

    console.log(`Scheduled ${scheduledNotesCount} notes for playback`)

    // Start progress tracking
    if (onProgress) {
      this.startProgressTracking(onProgress)
    }
  }

  private scheduleNote(note: MusicNote, startTime: number, duration: number): void {
    if (!this.audioContext || !this.gainNode) return

    try {
      // Create oscillator for the note
      const oscillator = this.audioContext.createOscillator()
      const noteGain = this.audioContext.createGain()
      
      // Connect audio nodes
      oscillator.connect(noteGain)
      noteGain.connect(this.gainNode)
      
      // Set frequency
      oscillator.frequency.value = note.frequency
      
      // Use a more pleasant waveform
      oscillator.type = 'sine'
      
      // Set up ADSR envelope for more realistic sound
      const attackTime = 0.01
      const decayTime = 0.1
      const sustainLevel = 0.7
      const releaseTime = 0.2
      
      const noteVolume = (note.velocity / 127) * this.config.volume
      
      // Attack
      noteGain.gain.setValueAtTime(0, startTime)
      noteGain.gain.linearRampToValueAtTime(noteVolume, startTime + attackTime)
      
      // Decay
      noteGain.gain.linearRampToValueAtTime(noteVolume * sustainLevel, startTime + attackTime + decayTime)
      
      // Sustain (hold the level)
      noteGain.gain.setValueAtTime(noteVolume * sustainLevel, startTime + duration - releaseTime)
      
      // Release
      noteGain.gain.linearRampToValueAtTime(0, startTime + duration)
      
      // Start and stop the oscillator
      oscillator.start(startTime)
      oscillator.stop(startTime + duration)
      
      // Store reference for potential cleanup
      const noteId = Date.now() + Math.random()
      this.scheduledNotes.set(noteId, oscillator)
      
      // Clean up after the note ends
      oscillator.onended = () => {
        this.scheduledNotes.delete(noteId)
      }
      
    } catch (error) {
      console.error('Failed to schedule note:', note.pitch, error)
    }
  }

  private startProgressTracking(onProgress: (currentTime: number) => void): void {
    if (!this.isPlaying) return

    const updateProgress = () => {
      if (!this.isPlaying) return

      const currentTime = this.getCurrentTime()
      const duration = this.getDuration()
      
      onProgress(currentTime)
      
      // Continue tracking if still playing and not finished
      if (currentTime < duration) {
        requestAnimationFrame(updateProgress)
      } else {
        // Playback finished
        this.isPlaying = false
        this.pausedTime = 0
      }
    }

    requestAnimationFrame(updateProgress)
  }

  private stopAllNotes(): void {
    for (const [_noteId, oscillator] of this.scheduledNotes) {
      try {
        oscillator.stop()
      } catch (error) {
        // Oscillator might already be stopped
      }
    }
    this.scheduledNotes.clear()
  }

  // Get notes that should be playing at a specific time
  getActiveNotes(time: number): MusicNote[] {
    if (!this.currentSequence) return []

    const beatsPerSecond = this.config.tempo / 60
    const beatTime = time * beatsPerSecond

    const activeNotes: MusicNote[] = []
    
    for (const measure of this.currentSequence.measures) {
      for (const note of measure.notes) {
        if (note.startTime <= beatTime && note.endTime > beatTime) {
          activeNotes.push(note)
        }
      }
    }

    return activeNotes
  }

  // Get the current measure being played
  getCurrentMeasure(time: number): number {
    if (!this.currentSequence) return 1

    const beatsPerSecond = this.config.tempo / 60
    const beatTime = time * beatsPerSecond

    for (const measure of this.currentSequence.measures) {
      const measureStart = (measure.number - 1) * 4 // Assuming 4/4 time
      const measureEnd = measureStart + 4
      
      if (beatTime >= measureStart && beatTime < measureEnd) {
        return measure.number
      }
    }

    // If we're past all measures, return the last measure
    return Math.min(this.currentSequence.totalMeasures, Math.max(1, Math.ceil(beatTime / 4)))
  }

  // Get the current beat within the current measure
  getCurrentBeat(time: number): number {
    if (!this.currentSequence) return 1

    const beatsPerSecond = this.config.tempo / 60
    const beatTime = time * beatsPerSecond
    const currentMeasure = this.getCurrentMeasure(time)
    const measureStart = (currentMeasure - 1) * 4
    const beatInMeasure = beatTime - measureStart
    
    return Math.max(1, Math.min(4, Math.ceil(beatInMeasure)))
  }

  // Get precise playback position as percentage
  getPlaybackPosition(): number {
    if (!this.currentSequence) return 0
    
    const currentTime = this.getCurrentTime()
    const duration = this.getDuration()
    
    return duration > 0 ? (currentTime / duration) * 100 : 0
  }

  // Play a single note (for testing/preview)
  async playNote(frequency: number, duration: number = 0.5, velocity: number = 64): Promise<void> {
    if (!this.audioContext || !this.gainNode) return

    try {
      const oscillator = this.audioContext.createOscillator()
      const noteGain = this.audioContext.createGain()
      
      oscillator.connect(noteGain)
      noteGain.connect(this.gainNode)
      
      oscillator.frequency.value = frequency
      oscillator.type = 'sine'
      
      const volume = (velocity / 127) * this.config.volume
      
      // Simple envelope
      const now = this.audioContext.currentTime
      noteGain.gain.setValueAtTime(0, now)
      noteGain.gain.linearRampToValueAtTime(volume, now + 0.01)
      noteGain.gain.linearRampToValueAtTime(0, now + duration)
      
      oscillator.start(now)
      oscillator.stop(now + duration)
      
    } catch (error) {
      console.error('Failed to play note:', error)
    }
  }

  // Clean up resources
  dispose(): void {
    this.stop()
    if (this.audioContext) {
      this.audioContext.close()
    }
  }
}