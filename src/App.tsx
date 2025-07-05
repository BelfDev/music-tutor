import React, { useState } from 'react'
import { Header } from './components/Header'
import { PDFUploader } from './components/PDFUploader'
import { SheetMusicViewer } from './components/SheetMusicViewer'
import { PianoKeyboard } from './components/PianoKeyboard'
import { PlaybackControls } from './components/PlaybackControls'
import { SongInfo } from './components/SongInfo'
import { LearningAids } from './components/LearningAids'
import { MicrophoneInput } from './components/MicrophoneInput'
import { useAppStore } from './store/useAppStore'
import './App.scss'

const App: React.FC = () => {
  const { currentPDF, isPlaying, currentTempo } = useAppStore()

  return (
    <div className="app">
      <Header />
      
      <main className="main-content">
        {!currentPDF ? (
          <div className="upload-section">
            <PDFUploader />
          </div>
        ) : (
          <div className="app-layout">
            <div className="sheet-music-section">
              <SheetMusicViewer />
            </div>
            
            <div className="controls-section">
              <SongInfo />
              <PlaybackControls />
            </div>
            
            <div className="piano-section">
              <PianoKeyboard />
            </div>
            
            <div className="learning-section">
              <LearningAids />
            </div>
            
            <div className="microphone-section">
              <MicrophoneInput />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App