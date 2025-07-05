import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { FiUpload, FiFile } from 'react-icons/fi'
import { useAppStore } from '../store/useAppStore'
import { processPDF, extractMetadata } from '../utils/pdfProcessor'
import './PDFUploader.scss'

export const PDFUploader: React.FC = () => {
  const { setPDF, setSheetMusicPages, setSongMetadata, setIsLoading, setError } = useAppStore()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      setPDF(file)
      
      // Process PDF pages and extract metadata in parallel
      const [pages, metadata] = await Promise.all([
        processPDF(file),
        extractMetadata(file)
      ])
      
      setSheetMusicPages(pages)
      if (metadata) {
        setSongMetadata(metadata)
      }
    } catch (error) {
      setError('Failed to process PDF. Please try again.')
      console.error('PDF processing error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [setPDF, setSheetMusicPages, setIsLoading, setError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  })

  return (
    <div className="pdf-uploader">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="dropzone-content">
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
        </div>
      </div>
    </div>
  )
}