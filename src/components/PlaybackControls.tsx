import React, { useState, useEffect, useRef } from 'react'
import { FiPlay, FiPause, FiSquare, FiSkipBack, FiSkipForward, FiRepeat } from 'react-icons/fi'
import { useAppStore } from '../store/useAppStore'
import { AudioEngine } from '../utils/audioEngine'
import { MusicNotationParser } from '../utils/musicNotationParser'
import './PlaybackControls.scss'

export const PlaybackControls: React.FC = () => {
  const {
    isPlaying,
    currentTempo,
    currentBar,
    currentTime,
    currentMusicSequence,
    loopStart,
    loopEnd,
    setIsPlaying,
    setCurrentTempo,
    setCurrentTime,
    setLoopStart,
    setLoopEnd,
    setActiveNotes
  } = useAppStore()

  const [isLooping, setIsLooping] = useState(false)
  const [totalBars, setTotalBars] = useState(0)
  const audioEngineRef = useRef<AudioEngine | null>(null)

  useEffect(() => {
    audioEngineRef.current = new AudioEngine()
    
    // Set up playback time update callback
    audioEngineRef.current.setPlaybackTimeUpdateCallback((time: number) => {
      setCurrentTime(time)
      
      // Update active notes based on current playback time
      if (currentMusicSequence) {
        const currentNotes = MusicNotationParser.getNotesAtTime(currentMusicSequence, time)
        const activeNotes = currentNotes.map(note => ({
          name: note.pitch.replace(/\d+$/, ''),
          frequency: note.frequency,
          octave: parseInt(note.pitch.match(/\d+$/)?.[0] || '4'),
          midi: note.midi
        }))
        setActiveNotes(activeNotes)
      }
    })
    
    return () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.dispose()
      }
    }
  }, [setCurrentTime, setActiveNotes, currentMusicSequence])

  useEffect(() => {
    // Load music sequence when it changes
    if (currentMusicSequence && audioEngineRef.current) {
      audioEngineRef.current.loadMusicSequence(currentMusicSequence)
      setTotalBars(MusicNotationParser.getTotalBars(currentMusicSequence))
    }
  }, [currentMusicSequence])

  useEffect(() => {
    // Update tempo in audio engine
    if (audioEngineRef.current) {
      audioEngineRef.current.setTempo(currentTempo)
    }
  }, [currentTempo])

  useEffect(() => {
    // Update loop settings
    if (audioEngineRef.current) {
      audioEngineRef.current.setLoop(loopStart, loopEnd)
    }
  }, [loopStart, loopEnd])

  const handlePlay = async () => {
    if (!audioEngineRef.current) return
    
    if (isPlaying) {
      audioEngineRef.current.pausePlayback()
      setIsPlaying(false)
    } else {
      if (currentMusicSequence) {
        audioEngineRef.current.resumePlayback()
      } else {
        audioEngineRef.current.startPlayback()
      }
      setIsPlaying(true)
    }
  }

  const handleStop = () => {
    if (!audioEngineRef.current) return
    
    audioEngineRef.current.stopPlayback()
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const handleTempoChange = (tempo: number) => {
    setCurrentTempo(tempo)
  }

  const handleSkipBack = () => {
    const newTime = Math.max(0, currentTime - 4) // Skip back one bar
    setCurrentTime(newTime)
    if (audioEngineRef.current) {
      audioEngineRef.current.seekToTime(newTime)
    }
  }

  const handleSkipForward = () => {
    const maxTime = currentMusicSequence?.totalDuration || 0
    const newTime = Math.min(maxTime, currentTime + 4) // Skip forward one bar
    setCurrentTime(newTime)
    if (audioEngineRef.current) {
      audioEngineRef.current.seekToTime(newTime)
    }
  }

  const handleSetLoopStart = () => {
    setLoopStart(loopStart === currentBar ? null : currentBar)
  }

  const handleSetLoopEnd = () => {
    setLoopEnd(loopEnd === currentBar ? null : currentBar)
  }

  const toggleLoop = () => {
    setIsLooping(!isLooping)
    if (!isLooping) {
      // Enable loop mode
      if (loopStart === null) setLoopStart(currentBar)
      if (loopEnd === null) setLoopEnd(Math.min(currentBar + 4, totalBars))
    } else {
      // Disable loop mode
      setLoopStart(null)
      setLoopEnd(null)
    }
  }

  const formatTime = (timeInBeats: number) => {
    const totalSeconds = (timeInBeats / currentTempo) * 60
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = Math.floor(totalSeconds % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    if (!currentMusicSequence) return 0
    return (currentTime / currentMusicSequence.totalDuration) * 100
  }

  return (
    <div className="playback-controls">
      <div className="control-group">
        <h3>Playback</h3>
        <div className="transport-controls">
          <button
            className="control-button"
            onClick={handleSkipBack}
            title="Previous Bar"
            disabled={!currentMusicSequence}
          >
            <FiSkipBack />
          </button>
          
          <button
            className="control-button primary"
            onClick={handlePlay}
            title={isPlaying ? 'Pause' : 'Play'}
            disabled={!currentMusicSequence}
          >
            {isPlaying ? <FiPause /> : <FiPlay />}
          </button>
          
          <button
            className="control-button"
            onClick={handleStop}
            title="Stop"
            disabled={!currentMusicSequence}
          >
            <FiSquare />
          </button>
          
          <button
            className="control-button"
            onClick={handleSkipForward}
            title="Next Bar"
            disabled={!currentMusicSequence}
          >
            <FiSkipForward />
          </button>
        </div>
      </div>

      <div className="control-group">
        <h3>Progress</h3>
        <div className="progress-info">
          <div className="time-display">
            <span className="current-time">{formatTime(currentTime)}</span>
            <span className="separator">/</span>
            <span className="total-time">
              {formatTime(currentMusicSequence?.totalDuration || 0)}
            </span>
          </div>
          <div className="bar-display">
            <span>Bar {currentBar} of {totalBars}</span>
          </div>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      <div className="control-group">
        <h3>Tempo</h3>
        <div className="tempo-controls">
          <input
            type="range"
            min="60"
            max="200"
            value={currentTempo}
            onChange={(e) => handleTempoChange(Number(e.target.value))}
            className="tempo-slider"
          />
          <div className="tempo-display">
            <span>{currentTempo} BPM</span>
          </div>
        </div>
      </div>

      <div className="control-group">
        <h3>Loop</h3>
        <div className="loop-controls">
          <button
            className={`control-button ${isLooping ? 'active' : ''}`}
            onClick={toggleLoop}
            title="Toggle Loop"
            disabled={!currentMusicSequence}
          >
            <FiRepeat />
          </button>
          
          <div className="loop-settings">
            <button
              className={`loop-button ${loopStart === currentBar ? 'active' : ''}`}
              onClick={handleSetLoopStart}
              title="Set Loop Start"
              disabled={!currentMusicSequence}
            >
              Start: {loopStart || '--'}
            </button>
            
            <button
              className={`loop-button ${loopEnd === currentBar ? 'active' : ''}`}
              onClick={handleSetLoopEnd}
              title="Set Loop End"
              disabled={!currentMusicSequence}
            >
              End: {loopEnd || '--'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}