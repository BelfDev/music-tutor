import { SongMetadata } from '../store/useAppStore'

export interface MusicNote {
  pitch: string // e.g., "C4", "D#5"
  duration: number // in quarter notes (1 = quarter note, 0.5 = eighth note, 2 = half note)
  startTime: number // in beats from start of piece
  velocity: number // 0-127 (MIDI velocity)
  midi: number // MIDI note number
  frequency: number // Hz
}

export interface MusicBar {
  number: number
  notes: MusicNote[]
  timeSignature: string
  keySignature: string
  tempo: number
}

export interface MusicSequence {
  bars: MusicBar[]
  metadata: SongMetadata
  totalDuration: number // in beats
}

export class MusicNotationParser {
  private static noteNameToMidi: { [key: string]: number } = {
    'C': 0, 'C#': 1, 'DB': 1, 'D': 2, 'D#': 3, 'EB': 3, 'E': 4, 'F': 5,
    'F#': 6, 'GB': 6, 'G': 7, 'G#': 8, 'AB': 8, 'A': 9, 'A#': 10, 'BB': 10, 'B': 11
  }

  static parsePDFToMusicSequence(_file: File, metadata: SongMetadata): Promise<MusicSequence> {
    // In a real implementation, this would use OCR and music notation recognition
    // For now, we'll generate a simple example sequence based on the metadata
    return this.generateExampleSequence(metadata)
  }

  private static async generateExampleSequence(metadata: SongMetadata): Promise<MusicSequence> {
    // Generate a simple C major scale sequence as an example
    const bars: MusicBar[] = []
    const tempo = metadata.tempo
    const timeSignature = metadata.timeSignature
    const keySignature = metadata.key

    // Generate 8 bars of simple melody
    for (let barNumber = 1; barNumber <= 8; barNumber++) {
      const bar: MusicBar = {
        number: barNumber,
        notes: [],
        timeSignature,
        keySignature,
        tempo
      }

      // Generate notes for this bar based on C major scale
      const scale = this.getCMajorScale(4) // C4 major scale
      const notesPerBar = 4 // 4 quarter notes per bar

      for (let noteIndex = 0; noteIndex < notesPerBar; noteIndex++) {
        const scaleIndex = ((barNumber - 1) * notesPerBar + noteIndex) % scale.length
        const pitch = scale[scaleIndex]
        const startTime = (barNumber - 1) * 4 + noteIndex // in quarter notes
        
        const note: MusicNote = {
          pitch,
          duration: 1, // quarter note
          startTime,
          velocity: 64 + Math.random() * 32, // vary velocity slightly
          midi: this.pitchToMidi(pitch),
          frequency: this.midiToFrequency(this.pitchToMidi(pitch))
        }

        bar.notes.push(note)
      }

      bars.push(bar)
    }

    return {
      bars,
      metadata,
      totalDuration: bars.length * 4 // 4 beats per bar
    }
  }

  private static getCMajorScale(octave: number): string[] {
    return [
      `C${octave}`, `D${octave}`, `E${octave}`, `F${octave}`,
      `G${octave}`, `A${octave}`, `B${octave}`, `C${octave + 1}`
    ]
  }

  static pitchToMidi(pitch: string): number {
    const match = pitch.match(/([A-G]#?)(\d+)/)
    if (!match) return 60 // default to C4

    const noteName = match[1]
    const octave = parseInt(match[2])
    
    const baseNote = this.noteNameToMidi[noteName.toUpperCase()]
    return baseNote + (octave + 1) * 12
  }

  static midiToFrequency(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12)
  }

  static midiToPitch(midi: number): string {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    const octave = Math.floor((midi - 12) / 12)
    const noteIndex = midi % 12
    return noteNames[noteIndex] + octave
  }

  // Convert a music sequence to a format suitable for Tone.js
  static sequenceToToneJSFormat(sequence: MusicSequence): Array<{
    note: string
    time: string
    duration: string
    velocity: number
  }> {
    const toneNotes: Array<{
      note: string
      time: string
      duration: string
      velocity: number
    }> = []

    sequence.bars.forEach(bar => {
      bar.notes.forEach(note => {
        // Convert beat time to Tone.js time format
        const beatTime = `${Math.floor(note.startTime / 4)}:${note.startTime % 4}:0`
        
        // Convert duration to Tone.js duration format
        let duration: string
        if (note.duration === 1) duration = '4n' // quarter note
        else if (note.duration === 0.5) duration = '8n' // eighth note
        else if (note.duration === 2) duration = '2n' // half note
        else if (note.duration === 4) duration = '1n' // whole note
        else duration = '4n' // default to quarter note

        toneNotes.push({
          note: note.pitch,
          time: beatTime,
          duration,
          velocity: note.velocity / 127 // normalize to 0-1 range
        })
      })
    })

    return toneNotes
  }

  // Get notes for a specific bar
  static getNotesForBar(sequence: MusicSequence, barNumber: number): MusicNote[] {
    const bar = sequence.bars.find(b => b.number === barNumber)
    return bar ? bar.notes : []
  }

  // Get the total number of bars in a sequence
  static getTotalBars(sequence: MusicSequence): number {
    return sequence.bars.length
  }

  // Check if a sequence has notes at a specific time
  static hasNotesAtTime(sequence: MusicSequence, time: number): boolean {
    return sequence.bars.some(bar => 
      bar.notes.some(note => 
        note.startTime <= time && note.startTime + note.duration > time
      )
    )
  }

  // Get all notes playing at a specific time
  static getNotesAtTime(sequence: MusicSequence, time: number): MusicNote[] {
    const playingNotes: MusicNote[] = []
    
    sequence.bars.forEach(bar => {
      bar.notes.forEach(note => {
        if (note.startTime <= time && note.startTime + note.duration > time) {
          playingNotes.push(note)
        }
      })
    })
    
    return playingNotes
  }
}