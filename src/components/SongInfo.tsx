import React from 'react'
import { FiInfo, FiMusic, FiUser, FiClock } from 'react-icons/fi'
import { useAppStore } from '../store/useAppStore'
import './SongInfo.scss'

export const SongInfo: React.FC = () => {
  const { 
    songMetadata, 
    currentBar, 
    currentBeat, 
    currentTempo,
    isPlaying 
  } = useAppStore()

  if (!songMetadata) {
    return (
      <div className="song-info">
        <div className="info-placeholder">
          <FiInfo />
          <span>No song information available</span>
        </div>
      </div>
    )
  }

  return (
    <div className="song-info">
      <div className="song-header">
        <div className="song-title">
          <FiMusic className="icon" />
          <h2>{songMetadata.title}</h2>
        </div>
        <div className="song-composer">
          <FiUser className="icon" />
          <span>{songMetadata.composer}</span>
        </div>
      </div>

      <div className="song-details">
        <div className="detail-item">
          <label>Key:</label>
          <span>{songMetadata.key}</span>
        </div>
        <div className="detail-item">
          <label>Time Signature:</label>
          <span>{songMetadata.timeSignature}</span>
        </div>
        <div className="detail-item">
          <label>Tempo:</label>
          <span>{songMetadata.tempo} BPM</span>
        </div>
      </div>

      <div className="playback-info">
        <h3>Current Position</h3>
        <div className="position-display">
          <div className="position-item">
            <label>Bar:</label>
            <span className="position-value">{currentBar}</span>
          </div>
          <div className="position-item">
            <label>Beat:</label>
            <span className="position-value">{currentBeat}</span>
          </div>
          <div className="position-item">
            <label>Tempo:</label>
            <span className="position-value">{currentTempo} BPM</span>
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