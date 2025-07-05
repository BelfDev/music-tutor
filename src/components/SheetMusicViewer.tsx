import React, { useEffect, useRef, useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiZoomIn, FiZoomOut } from 'react-icons/fi'
import { useAppStore } from '../store/useAppStore'
import './SheetMusicViewer.scss'

export const SheetMusicViewer: React.FC = () => {
  const { sheetMusicPages, currentPage, setCurrentPage, isPlaying, currentBar } = useAppStore()
  const [zoom, setZoom] = useState(1.0)
  const containerRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-scroll based on current bar when playing
    if (isPlaying && pageRef.current) {
      const scrollPercentage = (currentBar / 100) * 100 // Simplified calculation
      pageRef.current.scrollTop = (pageRef.current.scrollHeight * scrollPercentage) / 100
    }
  }, [isPlaying, currentBar])

  const nextPage = () => {
    if (currentPage < sheetMusicPages.length - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const zoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2.0))
  }

  const zoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5))
  }

  if (!sheetMusicPages.length) {
    return (
      <div className="sheet-music-viewer">
        <div className="no-music">
          <p>No sheet music loaded</p>
        </div>
      </div>
    )
  }

  return (
    <div className="sheet-music-viewer" ref={containerRef}>
      <div className="viewer-controls">
        <div className="page-controls">
          <button
            className="control-button"
            onClick={prevPage}
            disabled={currentPage === 0}
          >
            <FiChevronLeft />
          </button>
          <span className="page-info">
            {currentPage + 1} / {sheetMusicPages.length}
          </span>
          <button
            className="control-button"
            onClick={nextPage}
            disabled={currentPage === sheetMusicPages.length - 1}
          >
            <FiChevronRight />
          </button>
        </div>
        
        <div className="zoom-controls">
          <button
            className="control-button"
            onClick={zoomOut}
            disabled={zoom <= 0.5}
          >
            <FiZoomOut />
          </button>
          <span className="zoom-info">
            {Math.round(zoom * 100)}%
          </span>
          <button
            className="control-button"
            onClick={zoomIn}
            disabled={zoom >= 2.0}
          >
            <FiZoomIn />
          </button>
        </div>
      </div>

      <div className="sheet-music-content" ref={pageRef}>
        <div 
          className="sheet-music-page"
          style={{ transform: `scale(${zoom})` }}
        >
          <img
            src={sheetMusicPages[currentPage]}
            alt={`Sheet music page ${currentPage + 1}`}
            className="sheet-music-image"
          />
        </div>
      </div>
    </div>
  )
}