import React, { useState, useEffect, useRef } from 'react'
import { FiMic, FiMicOff, FiVolume2, FiVolumeX } from 'react-icons/fi'
import { useAppStore } from '../store/useAppStore'
import { PitchDetector } from '../utils/pitchDetector'
import { Note } from '../store/useAppStore'
import './MicrophoneInput.scss'

export const MicrophoneInput: React.FC = () => {
  const {
    detectedNotes,
    setMicrophoneEnabled,
    setMicrophonePermission,
    setDetectedNotes,
    addActiveNote
  } = useAppStore()

  const [audioLevel, setAudioLevel] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const pitchDetectorRef = useRef<PitchDetector | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null)

  useEffect(() => {
    return () => {
      stopListening()
    }
  }, [])

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      })
      
      mediaStreamRef.current = stream
      setMicrophonePermission(true)
      setError(null)
      
      return stream
    } catch (err) {
      setError('Microphone permission denied or not available')
      setMicrophonePermission(false)
      console.error('Microphone permission error:', err)
      return null
    }
  }

  const startListening = async () => {
    try {
      let stream = mediaStreamRef.current
      
      if (!stream) {
        stream = await requestMicrophonePermission()
        if (!stream) return
      }

      // Create audio context and analyzer
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 2048
      
      // Connect microphone to analyzer
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream)
      microphoneRef.current.connect(analyserRef.current)
      
      // Initialize pitch detector
      pitchDetectorRef.current = new PitchDetector(audioContextRef.current.sampleRate)
      
      setIsListening(true)
      setMicrophoneEnabled(true)
      
      // Start pitch detection loop
      startPitchDetection()
      
    } catch (err) {
      setError('Failed to start audio processing')
      console.error('Audio processing error:', err)
    }
  }

  const stopListening = () => {
    setIsListening(false)
    setMicrophoneEnabled(false)
    
    // Stop all audio processing
    if (microphoneRef.current) {
      microphoneRef.current.disconnect()
      microphoneRef.current = null
    }
    
    if (analyserRef.current) {
      analyserRef.current.disconnect()
      analyserRef.current = null
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }
    
    pitchDetectorRef.current = null
    setDetectedNotes([])
    setAudioLevel(0)
  }

  const startPitchDetection = () => {
    if (!analyserRef.current || !pitchDetectorRef.current) return

    const bufferLength = analyserRef.current.fftSize
    const dataArray = new Float32Array(bufferLength)
    
    const detectPitch = () => {
      if (!isListening || !analyserRef.current || !pitchDetectorRef.current) return
      
      analyserRef.current.getFloatTimeDomainData(dataArray)
      
      // Calculate audio level for visualization
      const rms = Math.sqrt(dataArray.reduce((sum, val) => sum + val * val, 0) / dataArray.length)
      setAudioLevel(Math.min(rms * 10, 1))
      
      // Detect pitch
      const pitch = pitchDetectorRef.current.detectPitch(dataArray)
      
      if (pitch > 0) {
        // Convert frequency to note
        const note = frequencyToNote(pitch)
        if (note) {
          setDetectedNotes([note])
          addActiveNote(note)
        }
      } else {
        setDetectedNotes([])
      }
      
      requestAnimationFrame(detectPitch)
    }
    
    detectPitch()
  }

  const frequencyToNote = (frequency: number): Note | null => {
    if (frequency < 80 || frequency > 2000) return null
    
    // Convert frequency to MIDI note number
    const midiNote = Math.round(12 * Math.log2(frequency / 440) + 69)
    
    if (midiNote < 21 || midiNote > 108) return null
    
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    const octave = Math.floor((midiNote - 12) / 12)
    const noteIndex = midiNote % 12
    
    return {
      name: noteNames[noteIndex],
      frequency,
      octave,
      midi: midiNote
    }
  }

  const toggleMicrophone = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return (
    <div className="microphone-input">
      <div className="microphone-header">
        <h3>
          <FiMic className="icon" />
          Microphone Input
        </h3>
        <button
          className={`microphone-toggle ${isListening ? 'listening' : ''}`}
          onClick={toggleMicrophone}
          title={isListening ? 'Stop Listening' : 'Start Listening'}
        >
          {isListening ? <FiMicOff /> : <FiMic />}
          <span>{isListening ? 'Stop' : 'Start'}</span>
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <div className="microphone-content">
        <div className="audio-level">
          <label>Audio Level:</label>
          <div className="level-bar">
            <div 
              className="level-fill"
              style={{ width: `${audioLevel * 100}%` }}
            />
          </div>
          {audioLevel > 0 ? <FiVolume2 /> : <FiVolumeX />}
        </div>

        <div className="detection-status">
          <h4>Detected Notes:</h4>
          <div className="detected-notes">
            {detectedNotes.length > 0 ? (
              detectedNotes.map((note, index) => (
                <div key={index} className="detected-note">
                  <span className="note-name">{note.name}</span>
                  <span className="note-octave">{note.octave}</span>
                  <span className="note-frequency">{note.frequency.toFixed(1)} Hz</span>
                </div>
              ))
            ) : (
              <span className="no-detection">
                {isListening ? 'Listening...' : 'Not listening'}
              </span>
            )}
          </div>
        </div>

        <div className="microphone-info">
          <p>
            <strong>Privacy:</strong> All audio processing happens locally in your browser. 
            No audio data is sent to external servers.
          </p>
          <p>
            <strong>Tip:</strong> For best results, play close to the microphone and 
            minimize background noise.
          </p>
        </div>
      </div>
    </div>
  )
}