import React, { useEffect, useRef } from 'react'
import { useAppStore } from '../store/useAppStore'
import { AudioEngine } from '../utils/audioEngine'
import { Note } from '../store/useAppStore'
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
  const { 
    activeNotes, 
    detectedNotes, 
    showLetterNotation, 
    addActiveNote, 
    removeActiveNote 
  } = useAppStore()
  
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
    const note: Note = {
      name: key.note,
      frequency: 440 * Math.pow(2, (key.midi - 69) / 12), // A4 = 440Hz
      octave: key.octave,
      midi: key.midi
    }
    
    addActiveNote(note)
    audioEngineRef.current?.playNote(note.frequency)
  }

  const handleKeyRelease = (key: typeof keys[0]) => {
    const note: Note = {
      name: key.note,
      frequency: 440 * Math.pow(2, (key.midi - 69) / 12),
      octave: key.octave,
      midi: key.midi
    }
    
    removeActiveNote(note)
    audioEngineRef.current?.stopNote(note.frequency)
  }

  const isKeyActive = (midi: number) => {
    return activeNotes.some(note => note.midi === midi) || 
           detectedNotes.some(note => note.midi === midi)
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
                ${isKeyActive(key.midi) ? 'active' : ''}
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
            onChange={(e) => useAppStore.getState().setShowLetterNotation(e.target.checked)}
          />
          Show Letter Notation
        </label>
      </div>
    </div>
  )
}