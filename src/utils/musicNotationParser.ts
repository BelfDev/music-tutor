import { SongMetadata } from '../store/useAppStore'

export interface MusicNote {
  pitch: string // e.g., "C4", "F#5", "Bb3"
  frequency: number // Hz
  midi: number // MIDI note number (0-127)
  duration: number // in beats (1 = quarter note, 0.5 = eighth note, etc.)
  startTime: number // start time in beats from beginning
  endTime: number // end time in beats from beginning
  velocity: number // 0-127 (dynamics)
  voice: number // which voice/hand (0 = right hand, 1 = left hand)
  measure: number // which measure this note appears in
  beat: number // which beat within the measure
}

export interface MusicMeasure {
  number: number
  timeSignature: {
    numerator: number
    denominator: number
  }
  keySignature: string
  tempo: number
  notes: MusicNote[]
  dynamics: string // pp, p, mp, mf, f, ff, etc.
}

export interface MusicSequence {
  measures: MusicMeasure[]
  totalDuration: number // in beats
  totalMeasures: number
  metadata: SongMetadata
}

export class MusicNotationParser {
  // MIDI note mapping
  private static readonly NOTE_TO_MIDI: { [key: string]: number } = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 
    'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
  }

  static parsePDFToMusicSequence(_file: File, metadata: SongMetadata): Promise<MusicSequence> {
    // For now, we'll generate a realistic sequence based on common sheet music patterns
    // In a real implementation, this would use OCR and music recognition AI
    return this.generateRealisticSequence(metadata)
  }

  private static async generateRealisticSequence(metadata: SongMetadata): Promise<MusicSequence> {
    console.log('Generating realistic music sequence for:', metadata.title)
    
    const measures: MusicMeasure[] = []
    const [numerator, denominator] = metadata.timeSignature.split('/').map(Number)
    const beatsPerMeasure = numerator
    
    // Generate 16 measures of music
    for (let measureNum = 1; measureNum <= 16; measureNum++) {
      const measure = this.generateMeasure(measureNum, {
        numerator,
        denominator,
        beatsPerMeasure,
        keySignature: metadata.key,
        tempo: metadata.tempo
      })
      measures.push(measure)
    }

    const totalDuration = measures.length * beatsPerMeasure
    
    return {
      measures,
      totalDuration,
      totalMeasures: measures.length,
      metadata
    }
  }

  private static generateMeasure(measureNumber: number, config: {
    numerator: number
    denominator: number
    beatsPerMeasure: number
    keySignature: string
    tempo: number
  }): MusicMeasure {
    const notes: MusicNote[] = []
    const startTime = (measureNumber - 1) * config.beatsPerMeasure
    
    // Generate a simple melody pattern
    const melodyPattern = this.generateMelodyPattern(measureNumber, config.keySignature)
    const bassPattern = this.generateBassPattern(measureNumber, config.keySignature)
    
    // Add melody notes (right hand)
    melodyPattern.forEach((noteInfo, index) => {
      const noteStartTime = startTime + (index * 0.5) // eighth notes
      notes.push({
        pitch: noteInfo.pitch,
        frequency: this.pitchToFrequency(noteInfo.pitch),
        midi: this.pitchToMidi(noteInfo.pitch),
        duration: 0.5, // eighth note
        startTime: noteStartTime,
        endTime: noteStartTime + 0.5,
        velocity: this.getDynamicVelocity(measureNumber),
        voice: 0, // right hand
        measure: measureNumber,
        beat: Math.floor((noteStartTime - startTime) / (4 / config.denominator)) + 1
      })
    })
    
    // Add bass notes (left hand)
    bassPattern.forEach((noteInfo, index) => {
      const noteStartTime = startTime + (index * 1) // quarter notes
      notes.push({
        pitch: noteInfo.pitch,
        frequency: this.pitchToFrequency(noteInfo.pitch),
        midi: this.pitchToMidi(noteInfo.pitch),
        duration: 1, // quarter note
        startTime: noteStartTime,
        endTime: noteStartTime + 1,
        velocity: this.getDynamicVelocity(measureNumber) - 10, // slightly softer bass
        voice: 1, // left hand
        measure: measureNumber,
        beat: index + 1
      })
    })

    return {
      number: measureNumber,
      timeSignature: {
        numerator: config.numerator,
        denominator: config.denominator
      },
      keySignature: config.keySignature,
      tempo: config.tempo,
      notes,
      dynamics: this.getDynamicMarking(measureNumber)
    }
  }

  private static generateMelodyPattern(measureNumber: number, keySignature: string): { pitch: string }[] {
    // Generate a simple melody based on the key signature
    const scale = this.getScaleNotes(keySignature, 5) // Start at 5th octave
    const patterns = [
      [0, 2, 1, 3, 2, 4, 3, 5], // ascending pattern
      [4, 2, 3, 1, 2, 0, 1, 2], // wave pattern
      [0, 4, 2, 5, 3, 6, 4, 7], // arpeggio pattern
      [2, 1, 0, 2, 1, 3, 2, 4]  // gentle pattern
    ]
    
    const patternIndex = (measureNumber - 1) % patterns.length
    const pattern = patterns[patternIndex]
    
    return pattern.map(noteIndex => ({
      pitch: scale[noteIndex % scale.length]
    }))
  }

  private static generateBassPattern(measureNumber: number, keySignature: string): { pitch: string }[] {
    // Generate bass notes (typically root, fifth, third patterns)
    const scale = this.getScaleNotes(keySignature, 3) // Start at 3rd octave for bass
    const bassPatterns = [
      [0, 4, 2, 4], // root, fifth, third, fifth
      [0, 2, 4, 2], // root, third, fifth, third
      [0, 0, 4, 4], // root, root, fifth, fifth
      [0, 4, 0, 2]  // root, fifth, root, third
    ]
    
    const patternIndex = (measureNumber - 1) % bassPatterns.length
    const pattern = bassPatterns[patternIndex]
    
    return pattern.map(noteIndex => ({
      pitch: scale[noteIndex % scale.length]
    }))
  }

  private static getScaleNotes(keySignature: string, octave: number): string[] {
    // Simplified major scale generation
    const rootNote = keySignature.split(' ')[0]
    const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
    const rootIndex = notes.indexOf(rootNote)
    
    // Generate major scale starting from root
    const scale = []
    for (let i = 0; i < 8; i++) {
      const noteIndex = (rootIndex + i) % 7
      scale.push(`${notes[noteIndex]}${octave}`)
    }
    
    return scale
  }

  private static getDynamicVelocity(measureNumber: number): number {
    // Vary dynamics throughout the piece
    if (measureNumber <= 4) return 60 // mp
    if (measureNumber <= 8) return 75 // mf
    if (measureNumber <= 12) return 90 // f
    return 75 // back to mf
  }

  private static getDynamicMarking(measureNumber: number): string {
    if (measureNumber <= 4) return 'mp'
    if (measureNumber <= 8) return 'mf'
    if (measureNumber <= 12) return 'f'
    return 'mf'
  }

  static pitchToMidi(pitch: string): number {
    const match = pitch.match(/^([A-G][#b]?)(\d+)$/)
    if (!match) return 60 // Default to middle C
    
    const [, noteName, octaveStr] = match
    const octave = parseInt(octaveStr)
    const noteNumber = this.NOTE_TO_MIDI[noteName]
    
    return (octave + 1) * 12 + noteNumber
  }

  static pitchToFrequency(pitch: string): number {
    const midiNote = this.pitchToMidi(pitch)
    // A4 (440 Hz) is MIDI note 69
    return 440 * Math.pow(2, (midiNote - 69) / 12)
  }

  static getNotesAtTime(sequence: MusicSequence, currentTime: number): MusicNote[] {
    const activeNotes: MusicNote[] = []
    
    for (const measure of sequence.measures) {
      for (const note of measure.notes) {
        if (note.startTime <= currentTime && note.endTime > currentTime) {
          activeNotes.push(note)
        }
      }
    }
    
    return activeNotes
  }

  static getTotalBars(sequence: MusicSequence): number {
    return sequence.totalMeasures
  }

  static getCurrentMeasure(sequence: MusicSequence, currentTime: number): number {
    const measure = sequence.measures.find(m => {
      const measureStart = (m.number - 1) * 4 // Assuming 4/4 time
      const measureEnd = measureStart + 4
      return currentTime >= measureStart && currentTime < measureEnd
    })
    
    return measure ? measure.number : 1
  }

  static getPlaybackPosition(sequence: MusicSequence, currentTime: number, tempo: number): {
    measure: number
    beatInMeasure: number
    measureProgress: number
    totalProgress: number
  } {
    const beatsPerSecond = tempo / 60
    const beatTime = currentTime * beatsPerSecond
    const currentMeasure = this.getCurrentMeasure(sequence, currentTime)
    
    const measureStart = (currentMeasure - 1) * 4
    const beatInMeasure = beatTime - measureStart
    const measureProgress = Math.max(0, Math.min(1, beatInMeasure / 4))
    const totalProgress = beatTime / sequence.totalDuration
    
    return {
      measure: currentMeasure,
      beatInMeasure: Math.max(1, Math.min(4, Math.ceil(beatInMeasure))),
      measureProgress,
      totalProgress: Math.max(0, Math.min(1, totalProgress))
    }
  }

  static getUpcomingNotes(sequence: MusicSequence, currentTime: number, lookahead: number = 2): MusicNote[] {
    const upcomingNotes: MusicNote[] = []
    
    for (const measure of sequence.measures) {
      for (const note of measure.notes) {
        if (note.startTime > currentTime && note.startTime <= currentTime + lookahead) {
          upcomingNotes.push(note)
        }
      }
    }
    
    return upcomingNotes.sort((a, b) => a.startTime - b.startTime)
  }
}