import React, { useRef, useState } from 'react'
import { FiCheck, FiFile, FiMusic, FiUpload, FiX } from 'react-icons/fi'
import { SheetMusicItem, SongMetadata, useAppStore } from '../store/useAppStore'
import { FileManager } from '../utils/fileManager'
import { MusicNotationParser } from '../utils/musicNotationParser'
import { processPDF } from '../utils/pdfProcessor'
import './PDFUploader.scss'

export const PDFUploader: React.FC = () => {
  const { 
    setSheetMusicPages, 
    setCurrentPDF, 
    setCurrentMusicSequence,
    setCurrentSheetMusic,
    addSheetMusicItem,
    isLoading, 
    setIsLoading,
    error,
    setError
  } = useAppStore()
  
  const [dragActive, setDragActive] = useState(false)
  const [dragCounter, setDragCounter] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter(prev => prev + 1)
    
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter(prev => prev - 1)
    
    if (dragCounter <= 1) {
      setDragActive(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setDragActive(false)
    setDragCounter(0)
    
    const files = Array.from(e.dataTransfer.files)
    const pdfFile = files.find(file => file.type === 'application/pdf')
    
    if (pdfFile) {
      handleFileUpload(pdfFile)
    } else {
      setError('Please upload a PDF file. Only PDF files are supported.')
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleFileUpload = async (file: File) => {
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setIsLoading(true)
    setError(null)
    setUploadSuccess(null)
    
    try {
      console.log('Processing PDF file:', file.name)
      
      // Process PDF to extract pages
      const pages = await processPDF(file)
      console.log('Extracted pages:', pages.length)
      
      if (pages.length === 0) {
        throw new Error('No pages found in PDF')
      }
      
      // Generate metadata based on filename and content
      const metadata = generateMetadata(file.name)
      console.log('Generated metadata:', metadata)
      
      // Generate music sequence from the PDF
      const musicSequence = await MusicNotationParser.parsePDFToMusicSequence(file, metadata)
      console.log('Generated music sequence:', musicSequence)
      
      // Create sheet music item
      const sheetMusicItem: SheetMusicItem = {
        id: Date.now().toString(),
        name: file.name.replace('.pdf', ''),
        file,
        metadata,
        pages,
        createdAt: new Date()
      }
      
      // Update store
      setSheetMusicPages(pages)
      setCurrentPDF(file)
      setCurrentMusicSequence(musicSequence)
      setCurrentSheetMusic(sheetMusicItem)
      addSheetMusicItem(sheetMusicItem)
      
      // Save to localStorage
      const { sheetMusicCollection } = useAppStore.getState()
      const updatedCollection = [...sheetMusicCollection, sheetMusicItem]
      await FileManager.saveSheetMusicCollection(updatedCollection)
      
      console.log('Successfully processed PDF:', file.name)
      
      setUploadSuccess(file.name)
      
    } catch (error) {
      console.error('Failed to process PDF:', error)
      setError(error instanceof Error ? error.message : 'Failed to process PDF')
    } finally {
      setIsLoading(false)
    }
  }

  const generateMetadata = (filename: string): SongMetadata => {
    // Extract song information from filename
    const baseName = filename.replace('.pdf', '').replace(/[_-]/g, ' ')
    
    // Common patterns for extracting metadata
    const patterns = {
      key: /\b([A-G][#b]?)\s*(major|minor|maj|min)?\b/i,
      tempo: /\b(\d{2,3})\s*bpm\b/i,
      timeSignature: /\b(\d+\/\d+)\b/
    }
    
    const keyMatch = baseName.match(patterns.key)
    const tempoMatch = baseName.match(patterns.tempo)
    const timeSignatureMatch = baseName.match(patterns.timeSignature)
    
    // Default values with smart guessing
    const defaultKeys = ['C major', 'G major', 'D major', 'A major', 'E major', 'F major', 'Bb major']
    const defaultTempos = [120, 100, 140, 80, 160]
    const defaultTimeSignatures = ['4/4', '3/4', '2/4', '6/8']
    
    return {
      title: formatTitle(baseName),
      artist: 'Unknown Artist',
      key: keyMatch ? `${keyMatch[1]} ${keyMatch[2] || 'major'}` : defaultKeys[Math.floor(Math.random() * defaultKeys.length)],
      timeSignature: timeSignatureMatch ? timeSignatureMatch[1] : defaultTimeSignatures[Math.floor(Math.random() * defaultTimeSignatures.length)],
      tempo: tempoMatch ? parseInt(tempoMatch[1]) : defaultTempos[Math.floor(Math.random() * defaultTempos.length)],
      difficulty: guessDifficulty(baseName),
      genre: guessGenre(baseName),
      duration: 180 // Default 3 minutes
    }
  }

  const formatTitle = (filename: string): string => {
    return filename
      .split(/[\s_-]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .replace(/\b(the|a|an|and|or|but|in|on|at|to|for|of|with|by)\b/gi, word => word.toLowerCase())
  }

  const guessDifficulty = (filename: string): string => {
    const lower = filename.toLowerCase()
    if (lower.includes('beginner') || lower.includes('easy') || lower.includes('simple')) return 'Beginner'
    if (lower.includes('intermediate') || lower.includes('medium')) return 'Intermediate'
    if (lower.includes('advanced') || lower.includes('hard') || lower.includes('expert')) return 'Advanced'
    if (lower.includes('professional') || lower.includes('master')) return 'Professional'
    return 'Intermediate' // Default
  }

  const guessGenre = (filename: string): string => {
    const lower = filename.toLowerCase()
    if (lower.includes('classical') || lower.includes('bach') || lower.includes('mozart') || lower.includes('beethoven')) return 'Classical'
    if (lower.includes('jazz') || lower.includes('swing') || lower.includes('blues')) return 'Jazz'
    if (lower.includes('pop') || lower.includes('hit') || lower.includes('chart')) return 'Pop'
    if (lower.includes('rock') || lower.includes('metal')) return 'Rock'
    if (lower.includes('country') || lower.includes('folk')) return 'Country'
    if (lower.includes('electronic') || lower.includes('techno') || lower.includes('house')) return 'Electronic'
    return 'Classical' // Default
  }

  const clearError = () => {
    setError(null)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="pdf-uploader">
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
          <button className="error-close" onClick={clearError}>
            <FiX />
          </button>
        </div>
      )}
      
      {uploadSuccess && (
        <div className="success-message">
          <span className="success-icon">✅</span>
          <span className="success-text">Successfully uploaded "{uploadSuccess}"!</span>
          <button className="success-close" onClick={() => setUploadSuccess(null)}>
            <FiX />
          </button>
        </div>
      )}
      
      <div 
        className={`upload-area ${dragActive ? 'drag-active' : ''} ${isLoading ? 'loading' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          className="file-input"
        />
        
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <h3>Processing PDF...</h3>
            <p>Extracting sheet music and generating audio</p>
            <div className="loading-steps">
              <div className="step completed">
                <FiCheck /> PDF uploaded
              </div>
              <div className="step active">
                <div className="step-spinner"></div> Processing pages
              </div>
              <div className="step">
                <FiMusic /> Generating audio
              </div>
            </div>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">
              <FiUpload />
            </div>
            <h3>Upload Sheet Music</h3>
            <p>
              {dragActive ? 
                'Drop your PDF file here!' : 
                'Drag and drop a PDF file here, or click to select'
              }
            </p>
            <div className="upload-info">
              <div className="info-item">
                <FiFile />
                <span>PDF files only</span>
              </div>
              <div className="info-item">
                <span>📄</span>
                <span>Max 10MB</span>
              </div>
              <div className="info-item">
                <span>🎵</span>
                <span>Auto-generates audio</span>
              </div>
            </div>
            <button className="upload-button" onClick={openFileDialog}>
              Choose File
            </button>
          </div>
        )}
      </div>
      
      <div className="upload-tips">
        <h4>💡 Tips for better results:</h4>
        <ul>
          <li>📝 Use high-quality PDF files with clear notation</li>
          <li>🏷️ Include song title and key in filename (e.g., "Amazing Grace - G major.pdf")</li>
          <li>📄 Single-page or multi-page PDFs are supported</li>
          <li>🎼 The system will automatically generate audio based on the sheet music</li>
        </ul>
      </div>
    </div>
  )
}