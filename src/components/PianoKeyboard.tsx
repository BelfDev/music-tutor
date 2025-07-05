import React, { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { AudioEngine } from '../utils/audioEngine'
import './PianoKeyboard.scss'

const PIANO_KEYS = [
  { note: 'C', type: 'white', midi: 60 },
  { note: 'C#', type: 'black', midi: 61 },
  { note: 'D', type: 'white', midi: 62 },
  { note: 'D#', type: 'black', midi: 63 },
  { note: 'E', type: 'white', midi: 64 },
  { note: 'F', type: 'white', midi: 65 },
  { note: 'F#', type: 'black', midi: 66 },
  { note: 'G', type: 'white', midi: 67 },
  { note: 'G#', type: 'black', midi: 68 },
  { note: 'A', type: 'white', midi: 69 },
  { note: 'A#', type: 'black', midi: 70 },
  { note: 'B', type: 'white', midi: 71 },
]

// Generate full keyboard (88 keys starting from A0)
const generateFullKeyboard = () => {
  const keys: Array<{ note: string; type: 'white' | 'black'; midi: number; octave: number }> = []
  
  // Start from A0 (MIDI 21) to C8 (MIDI 108)
  for (let midi = 21; midi <= 108; midi++) {
    const noteIndex = (midi - 21) % 12
    const octave = Math.floor((midi - 12) / 12)
    const baseNote = PIANO_KEYS[noteIndex]
    
    keys.push({
      note: baseNote.note,
      type: baseNote.type as 'white' | 'black',
      midi,
      octave
    })
  }
  
  return keys
}

export const PianoKeyboard: React.FC = () => {
  const { activeNotes, isPlaying } = useAppStore()
  const [manualActiveNotes, setManualActiveNotes] = useState<{ midi: number; frequency: number }[]>([])
  const [showLetterNotation, setShowLetterNotation] = useState(true)
  
  const audioEngineRef = useRef<AudioEngine | null>(null)
  const keys = generateFullKeyboard()

  useEffect(() => {
    audioEngineRef.current = new AudioEngine()
    return () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.dispose()
      }
    }
  }, [])

  const handleKeyPress = (key: typeof keys[0]) => {
    const frequency = 440 * Math.pow(2, (key.midi - 69) / 12) // A4 = 440Hz
    
    // Add to manual active notes if not already there
    setManualActiveNotes(prev => {
      if (!prev.some(n => n.midi === key.midi)) {
        return [...prev, { midi: key.midi, frequency }]
      }
      return prev
    })
    
    audioEngineRef.current?.playNote(frequency)
  }

  const handleKeyRelease = (key: typeof keys[0]) => {
    // Remove from manual active notes
    setManualActiveNotes(prev => prev.filter(n => n.midi !== key.midi))
    
    // Stop the note (if the audio engine supports it)
    const frequency = 440 * Math.pow(2, (key.midi - 69) / 12)
    if (audioEngineRef.current && 'stopNote' in audioEngineRef.current) {
      (audioEngineRef.current as any).stopNote(frequency)
    }
  }

  const isKeyActive = (midi: number) => {
    // Check if key is active from playback
    const playbackActive = isPlaying && activeNotes.some(note => note.midi === midi)
    // Check if key is manually pressed
    const manualActive = manualActiveNotes.some(note => note.midi === midi)
    
    return playbackActive || manualActive
  }

  const getKeyHighlightClass = (midi: number) => {
    const playbackActive = isPlaying && activeNotes.some(note => note.midi === midi)
    const manualActive = manualActiveNotes.some(note => note.midi === midi)
    
    if (playbackActive && manualActive) return 'active playback manual'
    if (playbackActive) return 'active playback'
    if (manualActive) return 'active manual'
    return ''
  }

  return (
    <div className="piano-keyboard">
      <div className="keyboard-container">
        <div className="keyboard">
          {keys.map((key) => (
            <div
              key={`${key.note}-${key.octave}-${key.midi}`}
              className={`
                piano-key 
                ${key.type} 
                ${getKeyHighlightClass(key.midi)}
              `}
              onMouseDown={() => handleKeyPress(key)}
              onMouseUp={() => handleKeyRelease(key)}
              onMouseLeave={() => handleKeyRelease(key)}
              onTouchStart={() => handleKeyPress(key)}
              onTouchEnd={() => handleKeyRelease(key)}
            >
              {showLetterNotation && (
                <span className="key-label">
                  {key.note}
                  {key.type === 'white' && <sub>{key.octave}</sub>}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="keyboard-controls">
        <label className="notation-toggle">
          <input
            type="checkbox"
            checked={showLetterNotation}
            onChange={(e) => setShowLetterNotation(e.target.checked)}
          />
          Show Letter Notation
        </label>
      </div>
    </div>
  )
}