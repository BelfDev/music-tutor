import React, { useEffect } from 'react'
import { Header } from './components/Header'
import { PDFUploader } from './components/PDFUploader'
import { SheetMusicCollection } from './components/SheetMusicCollection'
import { SheetMusicViewer } from './components/SheetMusicViewer'
import { PianoKeyboard } from './components/PianoKeyboard'
import { PlaybackControls } from './components/PlaybackControls'
import { SongInfo } from './components/SongInfo'
import { LearningAids } from './components/LearningAids'
import { MicrophoneInput } from './components/MicrophoneInput'
import { useAppStore } from './store/useAppStore'
import { FileManager } from './utils/fileManager'
import './App.scss'

const App: React.FC = () => {
  const { 
    currentPDF, 
    sheetMusicCollection, 
    loadSheetMusicCollection, 
    setError, 
    setIsLoading 
  } = useAppStore()

  useEffect(() => {
    // Load sheet music collection on app startup
    const initializeApp = async () => {
      setIsLoading(true)
      try {
        // Load existing collection from local storage
        const savedCollection = await FileManager.loadSheetMusicCollection()
        
        // Try to load sheet music from the sheet_music folder
        const folderFiles = await FileManager.loadSheetMusicFromFolder()
        
        // Merge collections, avoiding duplicates
        const mergedCollection = [...savedCollection]
        folderFiles.forEach(file => {
          if (!mergedCollection.find(item => item.name === file.name)) {
            mergedCollection.push(file)
          }
        })
        
        loadSheetMusicCollection(mergedCollection)
        
        // Save the merged collection
        if (mergedCollection.length > 0) {
          await FileManager.saveSheetMusicCollection(mergedCollection)
        }
      } catch (error) {
        console.error('Failed to initialize app:', error)
        setError('Failed to load sheet music collection')
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [loadSheetMusicCollection, setError, setIsLoading])

  return (
    <div className="app">
      <Header />
      
      <main className="main-content">
        {!currentPDF ? (
          <div className="start-section">
            <div className="upload-section">
              <PDFUploader />
            </div>
            
            {sheetMusicCollection.length > 0 && (
              <div className="collection-section">
                <SheetMusicCollection />
              </div>
            )}
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