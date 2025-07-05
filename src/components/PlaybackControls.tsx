import React, { useState, useEffect, useRef } from 'react'
import { FiPlay, FiPause, FiSquare, FiSkipBack, FiSkipForward, FiRepeat } from 'react-icons/fi'
import { useAppStore } from '../store/useAppStore'
import { AudioEngine } from '../utils/audioEngine'
import './PlaybackControls.scss'

export const PlaybackControls: React.FC = () => {
  const {
    isPlaying,
    currentTempo,
    currentBar,
    loopStart,
    loopEnd,
    setIsPlaying,
    setCurrentTempo,
    setCurrentBar,
    setLoopStart,
    setLoopEnd
  } = useAppStore()

  const [isLooping, setIsLooping] = useState(false)
  const audioEngineRef = useRef<AudioEngine | null>(null)

  useEffect(() => {
    audioEngineRef.current = new AudioEngine()
    return () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.dispose()
      }
    }
  }, [])

  const handlePlay = async () => {
    if (!audioEngineRef.current) return
    
    if (isPlaying) {
      audioEngineRef.current.pausePlayback()
      setIsPlaying(false)
    } else {
      audioEngineRef.current.startPlayback()
      setIsPlaying(true)
    }
  }

  const handleStop = () => {
    if (!audioEngineRef.current) return
    
    audioEngineRef.current.stopPlayback()
    setIsPlaying(false)
    setCurrentBar(1)
  }

  const handleTempoChange = (tempo: number) => {
    setCurrentTempo(tempo)
    if (audioEngineRef.current) {
      audioEngineRef.current.setTempo(tempo)
    }
  }

  const handleSkipBack = () => {
    const newBar = Math.max(1, currentBar - 1)
    setCurrentBar(newBar)
  }

  const handleSkipForward = () => {
    setCurrentBar(currentBar + 1)
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
      if (loopEnd === null) setLoopEnd(currentBar + 4)
    } else {
      // Disable loop mode
      setLoopStart(null)
      setLoopEnd(null)
    }
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
          >
            <FiSkipBack />
          </button>
          
          <button
            className="control-button primary"
            onClick={handlePlay}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <FiPause /> : <FiPlay />}
          </button>
          
          <button
            className="control-button"
            onClick={handleStop}
            title="Stop"
          >
            <FiSquare />
          </button>
          
          <button
            className="control-button"
            onClick={handleSkipForward}
            title="Next Bar"
          >
            <FiSkipForward />
          </button>
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
          >
            <FiRepeat />
          </button>
          
          <div className="loop-settings">
            <button
              className={`loop-button ${loopStart === currentBar ? 'active' : ''}`}
              onClick={handleSetLoopStart}
              title="Set Loop Start"
            >
              Start: {loopStart || '--'}
            </button>
            
            <button
              className={`loop-button ${loopEnd === currentBar ? 'active' : ''}`}
              onClick={handleSetLoopEnd}
              title="Set Loop End"
            >
              End: {loopEnd || '--'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}