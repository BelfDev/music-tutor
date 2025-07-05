import React from 'react'
import { FiClock, FiInfo, FiMusic, FiTrendingUp, FiUser } from 'react-icons/fi'
import { useAppStore } from '../store/useAppStore'
import './SongInfo.scss'

export const SongInfo: React.FC = () => {
  const { 
    currentSheetMusic,
    currentMeasure,
    currentTime,
    totalDuration,
    isPlaying 
  } = useAppStore()

  if (!currentSheetMusic) {
    return (
      <div className="song-info">
        <div className="info-placeholder">
          <FiInfo />
          <span>No song information available</span>
        </div>
      </div>
    )
  }

  const metadata = currentSheetMusic.metadata

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="song-info">
      <div className="song-header">
        <div className="song-title">
          <FiMusic className="icon" />
          <h2>{metadata.title}</h2>
        </div>
        <div className="song-artist">
          <FiUser className="icon" />
          <span>{metadata.artist}</span>
        </div>
      </div>

      <div className="song-details">
        <div className="detail-item">
          <label>Key:</label>
          <span>{metadata.key}</span>
        </div>
        <div className="detail-item">
          <label>Time:</label>
          <span>{metadata.timeSignature}</span>
        </div>
        <div className="detail-item">
          <label>Tempo:</label>
          <span>{metadata.tempo} BPM</span>
        </div>
        <div className="detail-item">
          <label>Difficulty:</label>
          <span className={`difficulty ${metadata.difficulty.toLowerCase()}`}>
            <FiTrendingUp />
            {metadata.difficulty}
          </span>
        </div>
      </div>

      <div className="playback-info">
        <h3>Current Position</h3>
        <div className="position-display">
          <div className="position-item">
            <label>Measure:</label>
            <span className="position-value">{currentMeasure}</span>
          </div>
          <div className="position-item">
            <label>Time:</label>
            <span className="position-value">{formatTime(currentTime)}</span>
          </div>
          <div className="position-item">
            <label>Duration:</label>
            <span className="position-value">{formatTime(totalDuration)}</span>
          </div>
        </div>
        
        <div className="playback-status">
          <div className={`status-indicator ${isPlaying ? 'playing' : 'paused'}`}>
            <FiClock className="icon" />
            <span>{isPlaying ? 'Playing' : 'Paused'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}