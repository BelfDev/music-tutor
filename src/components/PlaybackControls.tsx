import React, { useEffect, useState } from 'react'
import { FiPause, FiPlay, FiSettings, FiSkipBack, FiSkipForward, FiSquare, FiVolume2 } from 'react-icons/fi'
import { useAppStore } from '../store/useAppStore'
import './PlaybackControls.scss'

export const PlaybackControls: React.FC = () => {
  const { 
    isPlaying, 
    isPaused,
    currentTime,
    totalDuration,
    playbackProgress,
    currentMeasure,
    currentMusicSequence,
    play,
    pause,
    stop,
    seekTo,
    audioEngine,
    setCurrentSection,
    currentSection,
    practiceMode,
    setPracticeMode
  } = useAppStore()

  const [volume, setVolume] = useState(50)
  const [tempo, setTempo] = useState(120)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    if (currentMusicSequence) {
      setTempo(currentMusicSequence.metadata.tempo)
    }
  }, [currentMusicSequence])

  const handlePlay = async () => {
    if (!currentMusicSequence) return
    
    try {
      await play()
    } catch (error) {
      console.error('Failed to start playback:', error)
    }
  }

  const handlePause = () => {
    pause()
  }

  const handleStop = () => {
    stop()
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const progress = parseFloat(e.target.value)
    const time = (progress / 100) * totalDuration
    seekTo(time)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value)
    setVolume(newVolume)
    audioEngine.setVolume(newVolume / 100)
  }

  const handleTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTempo = parseInt(e.target.value)
    setTempo(newTempo)
    audioEngine.setTempo(newTempo)
  }

  const jumpToMeasure = (measure: number) => {
    if (!currentMusicSequence) return
    
    // Calculate time based on measure (assuming 4/4 time)
    const beatsPerMeasure = 4
    const beatsPerSecond = tempo / 60
    const time = ((measure - 1) * beatsPerMeasure) / beatsPerSecond
    
    seekTo(time)
    
    // Update current section to center around the jumped measure
    const sectionStart = Math.max(1, measure - 1)
    const sectionEnd = Math.min(currentMusicSequence.totalMeasures, sectionStart + 3)
    setCurrentSection({ start: sectionStart, end: sectionEnd })
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (!currentMusicSequence) {
    return (
      <div className="playback-controls">
        <div className="controls-disabled">
          <p>Load sheet music to enable playback</p>
        </div>
      </div>
    )
  }

  return (
    <div className="playback-controls">
      <div className="main-controls">
        <div className="transport-controls">
          <button
            className="control-button"
            onClick={handleStop}
            disabled={!isPlaying && !isPaused}
            title="Stop"
          >
            <FiSquare />
          </button>
          
          <button
            className="control-button skip-button"
            onClick={() => jumpToMeasure(Math.max(1, currentMeasure - 4))}
            disabled={currentMeasure <= 1}
            title="Previous Section"
          >
            <FiSkipBack />
          </button>
          
          <button
            className="control-button play-button"
            onClick={isPlaying ? handlePause : handlePlay}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <FiPause /> : <FiPlay />}
          </button>
          
          <button
            className="control-button skip-button"
            onClick={() => jumpToMeasure(Math.min(currentMusicSequence.totalMeasures, currentMeasure + 4))}
            disabled={currentMeasure >= currentMusicSequence.totalMeasures}
            title="Next Section"
          >
            <FiSkipForward />
          </button>
        </div>

        <div className="progress-section">
          <div className="time-display">
            <span className="current-time">{formatTime(currentTime)}</span>
            <span className="separator">/</span>
            <span className="total-time">{formatTime(totalDuration)}</span>
          </div>
          
          <div className="progress-container">
            <input
              type="range"
              min="0"
              max="100"
              value={playbackProgress}
              onChange={handleSeek}
              className="progress-slider"
            />
            <div className="progress-markers">
              {Array.from({ length: Math.min(currentMusicSequence.totalMeasures, 16) }, (_, i) => (
                <div
                  key={i}
                  className={`measure-marker ${i + 1 === currentMeasure ? 'active' : ''}`}
                  style={{ left: `${((i + 1) / currentMusicSequence.totalMeasures) * 100}%` }}
                  onClick={() => jumpToMeasure(i + 1)}
                  title={`Measure ${i + 1}`}
                />
              ))}
            </div>
          </div>
          
          <div className="measure-display">
            <span>Measure {currentMeasure} / {currentMusicSequence.totalMeasures}</span>
          </div>
        </div>
      </div>

      <div className="secondary-controls">
        <div className="volume-control">
          <FiVolume2 />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
          />
          <span className="volume-display">{volume}%</span>
        </div>

        <div className="practice-mode">
          <label className="practice-toggle">
            <input
              type="checkbox"
              checked={practiceMode}
              onChange={(e) => setPracticeMode(e.target.checked)}
            />
            <span>Practice Mode</span>
          </label>
        </div>

        <button
          className="control-button settings-button"
          onClick={() => setShowSettings(!showSettings)}
          title="Settings"
        >
          <FiSettings />
        </button>
      </div>

      {showSettings && (
        <div className="settings-panel">
          <div className="setting-group">
            <label>Tempo: {tempo} BPM</label>
            <input
              type="range"
              min="60"
              max="200"
              value={tempo}
              onChange={handleTempoChange}
              className="tempo-slider"
            />
          </div>
          
          <div className="setting-group">
            <label>Section: Measures {currentSection.start}-{currentSection.end}</label>
            <div className="section-controls">
              <button
                className="section-button"
                onClick={() => setCurrentSection({ 
                  start: Math.max(1, currentSection.start - 1), 
                  end: Math.max(4, currentSection.end - 1) 
                })}
                disabled={currentSection.start <= 1}
              >
                ←
              </button>
              <button
                className="section-button"
                onClick={() => setCurrentSection({ 
                  start: Math.min(currentMusicSequence.totalMeasures - 3, currentSection.start + 1), 
                  end: Math.min(currentMusicSequence.totalMeasures, currentSection.end + 1) 
                })}
                disabled={currentSection.end >= currentMusicSequence.totalMeasures}
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}