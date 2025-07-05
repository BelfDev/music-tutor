import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { FiFile, FiUpload } from 'react-icons/fi'
import { useAppStore } from '../store/useAppStore'
import { FileManager } from '../utils/fileManager'
import './PDFUploader.scss'

export const PDFUploader: React.FC = () => {
  const { 
    setPDF, 
    setSheetMusicPages, 
    setSongMetadata, 
    isLoading, 
    setIsLoading, 
    error,
    setError,
    addSheetMusic,
    sheetMusicCollection,
    setCurrentSheetMusic
  } = useAppStore()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    console.log('onDrop called with files:', acceptedFiles)
    const file = acceptedFiles[0]
    if (!file) {
      console.log('No file provided')
      return
    }

    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    })

    if (file.type !== 'application/pdf') {
      console.log('Invalid file type:', file.type)
      setError('Please upload a PDF file')
      return
    }

    setIsLoading(true)
    setError(null)
    console.log('Starting PDF processing...')

    try {
      // Create sheet music file entry
      console.log('Creating sheet music file entry...')
      const sheetMusicFile = await FileManager.addSheetMusicFile(file)
      console.log('Sheet music file created:', sheetMusicFile)
      
      // Add to collection
      console.log('Adding to collection...')
      addSheetMusic(sheetMusicFile)
      
      // Set as current sheet music
      console.log('Setting as current sheet music...')
      setCurrentSheetMusic(sheetMusicFile)
      
      // Update local storage with new collection
      console.log('Updating local storage...')
      const updatedCollection = [...sheetMusicCollection, sheetMusicFile]
      await FileManager.saveSheetMusicCollection(updatedCollection)
      
      // Simulate copying to sheet_music folder
      console.log('Copying to sheet_music folder...')
      await FileManager.copyToSheetMusicFolder(file)
      
      console.log('Sheet music uploaded and added to collection successfully')
    } catch (error) {
      console.error('PDF processing error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setError(`Failed to process PDF: ${errorMessage}`)
    } finally {
      setIsLoading(false)
      console.log('PDF processing completed')
    }
  }, [
    setPDF, 
    setSheetMusicPages, 
    setSongMetadata, 
    setIsLoading, 
    setError, 
    addSheetMusic, 
    sheetMusicCollection, 
    setCurrentSheetMusic
  ])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: isLoading
  })

  return (
    <div className="pdf-uploader">
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="error-close">
            ×
          </button>
        </div>
      )}
      
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''} ${isLoading ? 'loading' : ''}`}
        style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
      >
        <input {...getInputProps()} />
        <div className="dropzone-content">
          {isLoading ? (
            <>
              <div className="loading-spinner"></div>
              <h2>Processing PDF...</h2>
              <p>Please wait while we analyze your sheet music</p>
            </>
          ) : (
            <>
              <FiUpload className="upload-icon" />
              <h2>Upload Sheet Music</h2>
              <p>
                {isDragActive
                  ? 'Drop the PDF here...'
                  : 'Drag & drop a PDF file here, or click to select'
                }
              </p>
              <div className="file-info">
                <FiFile className="file-icon" />
                <span>PDF files only</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}