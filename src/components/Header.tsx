import React from 'react'
import { FiFile, FiFolder, FiMusic, FiSettings } from 'react-icons/fi'
import { useAppStore } from '../store/useAppStore'
import './Header.scss'

export const Header: React.FC = () => {
  const { 
    currentSheetMusic, 
    sheetMusicCollection,
    setCurrentSheetMusic
  } = useAppStore()

  const showCollection = () => {
    setCurrentSheetMusic(null)
  }

  const startNewSession = () => {
    setCurrentSheetMusic(null)
    // Could add more reset logic here if needed
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <FiMusic className="logo-icon" />
          <h1 className="logo-text">Music Tutor</h1>
        </div>
        
        <nav className="nav">
          {sheetMusicCollection.length > 0 && (
            <button
              className={`nav-button ${!currentSheetMusic ? 'active' : ''}`}
              onClick={showCollection}
              title="View Collection"
            >
              <FiFolder />
              Collection ({sheetMusicCollection.length})
            </button>
          )}
          
          {currentSheetMusic && (
            <button
              className="nav-button active"
              title="Current Sheet Music"
            >
              <FiFile />
              {currentSheetMusic.metadata.title}
            </button>
          )}
          
          <button
            className="nav-button"
            onClick={startNewSession}
            title="New Session"
          >
            New Session
          </button>
          
          <button
            className="nav-button"
            title="Settings"
          >
            <FiSettings />
          </button>
        </nav>
      </div>
    </header>
  )
}