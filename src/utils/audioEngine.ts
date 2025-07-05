import * as Tone from 'tone'
import { MusicSequence, MusicNotationParser } from './musicNotationParser'

export class AudioEngine {
  private synth: Tone.PolySynth
  private sequencePart: Tone.Part | null = null
  private isInitialized = false
  private activeNotes: Map<number, string> = new Map()
  private currentSequence: MusicSequence | null = null
  private onPlaybackTimeUpdate?: (time: number) => void

  constructor() {
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        partials: [0, 2, 3, 4],
      },
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.3,
        release: 0.3,
      },
    })
    
    this.synth.toDestination()
  }

  async initialize() {
    if (this.isInitialized) return
    
    try {
      await Tone.start()
      this.isInitialized = true
      console.log('Audio engine initialized')
    } catch (error) {
      console.error('Failed to initialize audio engine:', error)
    }
  }

  async playNote(frequency: number) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      const freqStr = frequency.toString()
      this.synth.triggerAttack(freqStr, Tone.now())
      this.activeNotes.set(frequency, freqStr)
    } catch (error) {
      console.error('Failed to play note:', error)
    }
  }

  async stopNote(frequency: number) {
    if (!this.isInitialized) return

    try {
      const freqStr = this.activeNotes.get(frequency)
      if (freqStr) {
        this.synth.triggerRelease(freqStr, Tone.now())
        this.activeNotes.delete(frequency)
      }
    } catch (error) {
      console.error('Failed to stop note:', error)
    }
  }

  async playSequence(notes: Array<{ frequency: number; duration: number; startTime: number }>) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      const now = Tone.now()
      
      notes.forEach(note => {
        const freqStr = note.frequency.toString()
        this.synth.triggerAttackRelease(
          freqStr,
          note.duration,
          now + note.startTime
        )
      })
    } catch (error) {
      console.error('Failed to play sequence:', error)
    }
  }

  async loadMusicSequence(sequence: MusicSequence) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      this.currentSequence = sequence
      
      // Clear existing sequence
      if (this.sequencePart) {
        this.sequencePart.dispose()
        this.sequencePart = null
      }

      // Convert sequence to Tone.js format
      const toneNotes = MusicNotationParser.sequenceToToneJSFormat(sequence)
      
      // Create new sequence part
      this.sequencePart = new Tone.Part((time, note) => {
        this.synth.triggerAttackRelease(note.note, note.duration, time, note.velocity)
      }, toneNotes)

      // Set up playback progress tracking
      this.sequencePart.loop = false
      this.sequencePart.loopStart = 0
      this.sequencePart.loopEnd = `${sequence.bars.length}:0:0`

      console.log('Music sequence loaded successfully')
    } catch (error) {
      console.error('Failed to load music sequence:', error)
    }
  }

  setTempo(bpm: number) {
    try {
      Tone.Transport.bpm.value = bpm
    } catch (error) {
      console.error('Failed to set tempo:', error)
    }
  }

  setLoop(start: number | null, end: number | null) {
    try {
      if (this.sequencePart && start !== null && end !== null) {
        this.sequencePart.loop = true
        this.sequencePart.loopStart = `${start - 1}:0:0` // Convert to 0-based
        this.sequencePart.loopEnd = `${end}:0:0`
      } else if (this.sequencePart) {
        this.sequencePart.loop = false
      }
    } catch (error) {
      console.error('Failed to set loop:', error)
    }
  }

  async startPlayback() {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      if (this.sequencePart) {
        this.sequencePart.start()
      }
      
      Tone.Transport.start()
      
      // Set up progress tracking
      this.startProgressTracking()
      
      console.log('Playback started')
    } catch (error) {
      console.error('Failed to start playback:', error)
    }
  }

  stopPlayback() {
    try {
      if (this.sequencePart) {
        this.sequencePart.stop()
      }
      
      Tone.Transport.stop()
      Tone.Transport.position = 0
      
      // Stop progress tracking
      this.stopProgressTracking()
      
      // Stop all active notes
      this.activeNotes.forEach((freqStr) => {
        this.synth.triggerRelease(freqStr, Tone.now())
      })
      this.activeNotes.clear()
      
      console.log('Playback stopped')
    } catch (error) {
      console.error('Failed to stop playback:', error)
    }
  }

  pausePlayback() {
    try {
      if (this.sequencePart) {
        this.sequencePart.stop()
      }
      
      Tone.Transport.pause()
      
      // Stop progress tracking
      this.stopProgressTracking()
      
      console.log('Playback paused')
    } catch (error) {
      console.error('Failed to pause playback:', error)
    }
  }

  resumePlayback() {
    try {
      if (this.sequencePart) {
        this.sequencePart.start()
      }
      
      Tone.Transport.start()
      
      // Resume progress tracking
      this.startProgressTracking()
      
      console.log('Playback resumed')
    } catch (error) {
      console.error('Failed to resume playback:', error)
    }
  }

  seekToTime(time: number) {
    try {
      const transportTime = `${Math.floor(time / 4)}:${time % 4}:0`
      Tone.Transport.position = transportTime
      console.log(`Seeked to time: ${transportTime}`)
    } catch (error) {
      console.error('Failed to seek:', error)
    }
  }

  setPlaybackTimeUpdateCallback(callback: (time: number) => void) {
    this.onPlaybackTimeUpdate = callback
  }

  private startProgressTracking() {
    // Update progress every 100ms
    const updateInterval = setInterval(() => {
      if (Tone.Transport.state === 'started') {
        const position = Tone.Transport.position.toString()
        const timeInBeats = this.transportPositionToBeats(position)
        
        if (this.onPlaybackTimeUpdate) {
          this.onPlaybackTimeUpdate(timeInBeats)
        }
      } else {
        clearInterval(updateInterval)
      }
    }, 100)
  }

  private stopProgressTracking() {
    // Progress tracking will be automatically stopped when transport stops
  }

  private transportPositionToBeats(position: string | number): number {
    if (typeof position === 'string') {
      const parts = position.split(':')
      const bars = parseInt(parts[0]) || 0
      const beats = parseInt(parts[1]) || 0
      const sixteenths = parseInt(parts[2]) || 0
      
      return bars * 4 + beats + sixteenths / 4
    }
    return 0
  }

  getCurrentSequence(): MusicSequence | null {
    return this.currentSequence
  }

  dispose() {
    try {
      this.stopPlayback()
      
      if (this.sequencePart) {
        this.sequencePart.dispose()
        this.sequencePart = null
      }
      
      this.synth.dispose()
      this.currentSequence = null
      
      console.log('Audio engine disposed')
    } catch (error) {
      console.error('Failed to dispose audio engine:', error)
    }
  }
}