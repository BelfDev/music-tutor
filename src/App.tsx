import React, { useEffect } from 'react'
import './App.scss'
import { Header } from './components/Header'
import { LearningAids } from './components/LearningAids'
import { MicrophoneInput } from './components/MicrophoneInput'
import { PDFUploader } from './components/PDFUploader'
import { PianoKeyboard } from './components/PianoKeyboard'
import { PlaybackControls } from './components/PlaybackControls'
import { SheetMusicCollection } from './components/SheetMusicCollection'
import { SheetMusicViewer } from './components/SheetMusicViewer'
import { SongInfo } from './components/SongInfo'
import { useAppStore } from './store/useAppStore'
import { FileManager } from './utils/fileManager'

const App: React.FC = () => {
  const { 
    currentSheetMusic,
    sheetMusicCollection, 
    loadSheetMusicCollection, 
    setError, 
    setIsLoading,
    isLoading,
    error
  } = useAppStore()

  useEffect(() => {
    // Load sheet music collection on app startup
    const initializeApp = async () => {
      setIsLoading(true)
      setError(null)
      try {
        console.log('Initializing app...')
        
        // Load existing collection from local storage
        console.log('Loading saved collection...')
        let savedCollection: any[] = []
        try {
          savedCollection = await FileManager.loadSheetMusicCollection()
          console.log('Saved collection loaded:', savedCollection.length, 'items')
        } catch (error) {
          console.error('Failed to load saved collection, continuing with empty collection:', error)
          // Clear corrupted data
          localStorage.removeItem('sheetMusicCollection')
        }
        
        // Try to load sheet music from the sheet_music folder
        console.log('Loading folder files...')
        let folderFiles: any[] = []
        try {
          folderFiles = await FileManager.loadSheetMusicFromFolder()
          console.log('Folder files loaded:', folderFiles.length, 'items')
        } catch (error) {
          console.error('Failed to load folder files, continuing without them:', error)
        }
        
        // Merge collections, avoiding duplicates
        const mergedCollection = [...savedCollection]
        folderFiles.forEach(file => {
          if (!mergedCollection.find(item => item.name === file.name)) {
            mergedCollection.push(file)
          }
        })
        
        console.log('Loading collection into store:', mergedCollection.length, 'items')
        loadSheetMusicCollection(mergedCollection)
        
        // Save the merged collection if we have items and no errors occurred
        if (mergedCollection.length > 0) {
          try {
            console.log('Saving merged collection...')
            await FileManager.saveSheetMusicCollection(mergedCollection)
            console.log('Collection saved successfully')
          } catch (error) {
            console.error('Failed to save merged collection:', error)
            setError('Collection loaded but could not be saved. Changes may not persist.')
          }
        }
        
        console.log('App initialization completed successfully')
      } catch (error) {
        console.error('Failed to initialize app:', error)
        setError('Failed to load sheet music collection. You can still upload new files.')
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [loadSheetMusicCollection, setError, setIsLoading])

  if (isLoading) {
    return (
      <div className="app">
        <Header />
        <main className="main-content">
          <div className="loading-overlay">
            <div className="loading-content">
              <div className="loading-spinner"></div>
              <div className="loading-text">Loading Music Tutor...</div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <Header />
      
      <main className="main-content">
        {error && (
          <div className="error-message">
            <div className="error-content">{error}</div>
            <button className="close-button" onClick={() => setError(null)}>
              ✕
            </button>
          </div>
        )}
        
        {!currentSheetMusic ? (
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
          <div className="learning-interface">
            {/* Top section: Song info and controls */}
            <div className="learning-header">
              <SongInfo />
              <PlaybackControls />
            </div>
            
            {/* Main learning area: Current section of sheet music */}
            <div className="current-section">
              <div className="section-header">
                <h3>Current Section</h3>
                <div className="section-info">
                  <span>Bar 1-4</span>
                  <span>•</span>
                  <span>Measure 1</span>
                </div>
              </div>
              <div className="focused-sheet-music">
                <SheetMusicViewer />
              </div>
            </div>
            
            {/* Piano section */}
            <div className="piano-section">
              <PianoKeyboard />
            </div>
            
            {/* Bottom controls */}
            <div className="learning-controls">
              <div className="controls-left">
                <MicrophoneInput />
              </div>
              <div className="controls-right">
                <LearningAids />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App