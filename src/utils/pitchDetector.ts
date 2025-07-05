import PitchFinder from 'pitchfinder'

export class PitchDetector {
  private detector: (buffer: Float32Array) => number | null
  private sampleRate: number
  private minFreq: number
  private maxFreq: number

  constructor(sampleRate: number = 44100) {
    this.sampleRate = sampleRate
    this.minFreq = 80  // Lowest piano note (A0 ≈ 27.5 Hz, but we'll use 80 for reliability)
    this.maxFreq = 2000 // Highest practical piano note we'll detect
    
    // Initialize the pitch detector with YIN algorithm
    this.detector = PitchFinder.YIN({
      sampleRate: this.sampleRate,
      threshold: 0.1
    })
  }

  detectPitch(buffer: Float32Array): number {
    try {
      const pitch = this.detector(buffer)
      
      if (pitch && pitch >= this.minFreq && pitch <= this.maxFreq) {
        return pitch
      }
      
      return 0
    } catch (error) {
      console.error('Pitch detection error:', error)
      return 0
    }
  }

  // Alternative method using manual autocorrelation for better control
  detectPitchManual(buffer: Float32Array): number {
    const bufferSize = buffer.length
    const halfBuffer = bufferSize / 2
    const correlations = new Float32Array(halfBuffer)
    
    // Compute autocorrelation
    for (let lag = 0; lag < halfBuffer; lag++) {
      let sum = 0
      for (let i = 0; i < halfBuffer; i++) {
        sum += buffer[i] * buffer[i + lag]
      }
      correlations[lag] = sum / halfBuffer
    }
    
    // Find the lag with maximum correlation (excluding lag 0)
    let maxCorrelation = -1
    let bestLag = -1
    
    const minPeriod = Math.floor(this.sampleRate / this.maxFreq)
    const maxPeriod = Math.floor(this.sampleRate / this.minFreq)
    
    for (let lag = minPeriod; lag < Math.min(maxPeriod, halfBuffer); lag++) {
      if (correlations[lag] > maxCorrelation) {
        maxCorrelation = correlations[lag]
        bestLag = lag
      }
    }
    
    // Convert lag to frequency
    if (bestLag > 0 && maxCorrelation > 0.3) { // Threshold for correlation
      return this.sampleRate / bestLag
    }
    
    return 0
  }

  // Get the note name from frequency
  frequencyToNote(frequency: number): string | null {
    if (frequency <= 0) return null
    
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    
    // Calculate the MIDI note number
    const midiNote = Math.round(12 * Math.log2(frequency / 440) + 69)
    
    if (midiNote < 21 || midiNote > 108) return null // Piano range
    
    const noteIndex = midiNote % 12
    const octave = Math.floor((midiNote - 12) / 12)
    
    return `${noteNames[noteIndex]}${octave}`
  }

  // Analyze the strength of the detected pitch
  getPitchStrength(buffer: Float32Array, frequency: number): number {
    if (frequency <= 0) return 0
    
    const period = this.sampleRate / frequency
    const periods = Math.floor(buffer.length / period)
    
    if (periods < 2) return 0
    
    let correlation = 0
    const samplesPerPeriod = Math.floor(period)
    
    for (let i = 0; i < buffer.length - samplesPerPeriod; i++) {
      correlation += buffer[i] * buffer[i + samplesPerPeriod]
    }
    
    return Math.abs(correlation) / (buffer.length - samplesPerPeriod)
  }

  // Set detection parameters
  setFrequencyRange(minFreq: number, maxFreq: number) {
    this.minFreq = minFreq
    this.maxFreq = maxFreq
    
    // Reinitialize detector with new parameters
    this.detector = PitchFinder.YIN({
      sampleRate: this.sampleRate,
      threshold: 0.1
    })
  }
}