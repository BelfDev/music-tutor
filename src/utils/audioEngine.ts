import * as Tone from 'tone'

export class AudioEngine {
  private synth: Tone.PolySynth
  private isInitialized = false
  private activeNotes: Map<number, string> = new Map()

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

  setTempo(bpm: number) {
    try {
      Tone.Transport.bpm.value = bpm
    } catch (error) {
      console.error('Failed to set tempo:', error)
    }
  }

  startPlayback() {
    try {
      Tone.Transport.start()
    } catch (error) {
      console.error('Failed to start playback:', error)
    }
  }

  stopPlayback() {
    try {
      Tone.Transport.stop()
      // Stop all active notes
      this.activeNotes.forEach((freqStr, frequency) => {
        this.synth.triggerRelease(freqStr, Tone.now())
      })
      this.activeNotes.clear()
    } catch (error) {
      console.error('Failed to stop playback:', error)
    }
  }

  pausePlayback() {
    try {
      Tone.Transport.pause()
    } catch (error) {
      console.error('Failed to pause playback:', error)
    }
  }

  dispose() {
    try {
      this.stopPlayback()
      this.synth.dispose()
    } catch (error) {
      console.error('Failed to dispose audio engine:', error)
    }
  }
}