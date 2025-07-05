import React, { useEffect, useRef, useState } from 'react'
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiZoomIn, FiZoomOut } from 'react-icons/fi'
import { useAppStore } from '../store/useAppStore'
import { MusicNotationParser } from '../utils/musicNotationParser'
import './SheetMusicViewer.scss'

export const SheetMusicViewer: React.FC = () => {
  const { 
    sheetMusicPages, 
    currentPage, 
    setCurrentPage, 
    isPlaying, 
    currentTime,
    currentMusicSequence,
    setCurrentSheetMusic 
  } = useAppStore()
  
  const [zoom, setZoom] = useState(1.0)
  const [focusedSection, setFocusedSection] = useState({ start: 1, end: 4 })
  const containerRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Update focused section based on current playback position
    if (isPlaying && currentMusicSequence) {
      const currentMeasure = MusicNotationParser.getCurrentMeasure(currentMusicSequence, currentTime)
      
      // Show 4 measures at a time, centered around current measure
      const sectionStart = Math.max(1, currentMeasure - 1)
      const sectionEnd = Math.min(currentMusicSequence.totalMeasures, sectionStart + 3)
      
      setFocusedSection({ start: sectionStart, end: sectionEnd })
    }
  }, [isPlaying, currentTime, currentMusicSequence])

  useEffect(() => {
    // Auto-scroll to current section when playing
    if (isPlaying && pageRef.current && currentMusicSequence) {
      const currentMeasure = MusicNotationParser.getCurrentMeasure(currentMusicSequence, currentTime)
      const progressPercentage = (currentMeasure / currentMusicSequence.totalMeasures) * 100
      
      // Smooth scroll to current position
      const scrollTop = (pageRef.current.scrollHeight * progressPercentage) / 100
      pageRef.current.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      })
    }
  }, [isPlaying, currentTime, currentMusicSequence])

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

  const goBackToCollection = () => {
    setCurrentSheetMusic(null)
  }

  const nextSection = () => {
    if (currentMusicSequence && focusedSection.end < currentMusicSequence.totalMeasures) {
      const newStart = focusedSection.end + 1
      const newEnd = Math.min(currentMusicSequence.totalMeasures, newStart + 3)
      setFocusedSection({ start: newStart, end: newEnd })
    }
  }

  const prevSection = () => {
    if (focusedSection.start > 1) {
      const newStart = Math.max(1, focusedSection.start - 4)
      const newEnd = newStart + 3
      setFocusedSection({ start: newStart, end: newEnd })
    }
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
        <div className="back-control">
          <button
            className="control-button back-button"
            onClick={goBackToCollection}
            title="Back to Collection"
          >
            <FiArrowLeft />
          </button>
        </div>
        
        <div className="section-controls">
          <button
            className="control-button"
            onClick={prevSection}
            disabled={focusedSection.start <= 1}
            title="Previous Section"
          >
            <FiChevronLeft />
          </button>
          <span className="section-info">
            Measures {focusedSection.start}-{focusedSection.end}
          </span>
          <button
            className="control-button"
            onClick={nextSection}
            disabled={!currentMusicSequence || focusedSection.end >= currentMusicSequence.totalMeasures}
            title="Next Section"
          >
            <FiChevronRight />
          </button>
        </div>
        
        <div className="page-controls">
          <button
            className="control-button"
            onClick={prevPage}
            disabled={currentPage === 0}
            title="Previous Page"
          >
            <FiChevronLeft />
          </button>
          <span className="page-info">
            Page {currentPage + 1} / {sheetMusicPages.length}
          </span>
          <button
            className="control-button"
            onClick={nextPage}
            disabled={currentPage === sheetMusicPages.length - 1}
            title="Next Page"
          >
            <FiChevronRight />
          </button>
        </div>
        
        <div className="zoom-controls">
          <button
            className="control-button"
            onClick={zoomOut}
            disabled={zoom <= 0.5}
            title="Zoom Out"
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
            title="Zoom In"
          >
            <FiZoomIn />
          </button>
        </div>
      </div>

      <div className="sheet-music-content" ref={pageRef}>
        <div className="current-measure-indicator">
          {isPlaying && currentMusicSequence && (
            <div className="measure-progress">
              <span>Current: Measure {MusicNotationParser.getCurrentMeasure(currentMusicSequence, currentTime)}</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${(currentTime / currentMusicSequence.totalDuration) * 100}%` 
                  }}
                />
              </div>
            </div>
          )}
        </div>
        
        <div 
          className="sheet-music-page"
          style={{ transform: `scale(${zoom})` }}
        >
          <img
            src={sheetMusicPages[currentPage]}
            alt={`Sheet music page ${currentPage + 1}`}
            className="sheet-music-image"
          />
          
          {/* Overlay for highlighting current section */}
          {isPlaying && currentMusicSequence && (
            <div className="playback-overlay">
              <div 
                className="current-section-highlight"
                style={{
                  left: '10%',
                  width: '80%',
                  top: `${((MusicNotationParser.getCurrentMeasure(currentMusicSequence, currentTime) - 1) / currentMusicSequence.totalMeasures) * 80 + 10}%`,
                  height: '8%'
                }}
              />
            </div>
          )}
        </div>
        
        {/* Upcoming notes preview */}
        {isPlaying && currentMusicSequence && (
          <div className="upcoming-notes">
            <h4>Next Notes:</h4>
            <div className="note-list">
              {MusicNotationParser.getUpcomingNotes(currentMusicSequence, currentTime, 2).slice(0, 4).map((note, index) => (
                <div key={index} className="note-preview">
                  <span className="note-pitch">{note.pitch}</span>
                  <span className="note-timing">in {(note.startTime - currentTime).toFixed(1)}s</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}