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
  const [focusedSection, setFocusedSection] = useState({ start: 1, end: 8 })
  const containerRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Update focused section based on current playback position
    if (isPlaying && currentMusicSequence) {
      const currentMeasure = MusicNotationParser.getCurrentMeasure(currentMusicSequence, currentTime)
      
      // Show 8 measures at a time, starting from measure groups (1-8, 9-16, etc.)
      const sectionNumber = Math.ceil(currentMeasure / 8)
      const sectionStart = (sectionNumber - 1) * 8 + 1
      const sectionEnd = Math.min(currentMusicSequence.totalMeasures, sectionStart + 7)
      
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
      const newEnd = Math.min(currentMusicSequence.totalMeasures, newStart + 7)
      setFocusedSection({ start: newStart, end: newEnd })
    }
  }

  const prevSection = () => {
    if (focusedSection.start > 1) {
      const newStart = Math.max(1, focusedSection.start - 8)
      const newEnd = newStart + 7
      setFocusedSection({ start: newStart, end: newEnd })
    }
  }

  if (!sheetMusicPages.length) {
    return (
      <div className="sheet-music-viewer">
        <div className="no-music">
          <div className="no-music-content">
            <div className="icon">🎼</div>
            <h3>No Sheet Music Selected</h3>
            <p>Upload a PDF or select from your collection to get started</p>
          </div>
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
              <span>
                Current: Measure {MusicNotationParser.getCurrentMeasure(currentMusicSequence, currentTime)}
                {(() => {
                  const position = MusicNotationParser.getPlaybackPosition(
                    currentMusicSequence, 
                    currentTime, 
                    currentMusicSequence.metadata.tempo || 120
                  )
                  return ` • Beat ${position.beatInMeasure}`
                })()}
              </span>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${(() => {
                      const position = MusicNotationParser.getPlaybackPosition(
                        currentMusicSequence, 
                        currentTime, 
                        currentMusicSequence.metadata.tempo || 120
                      )
                      return position.totalProgress * 100
                    })()}%`
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
          
          {/* Focused section overlay */}
          <div className="focused-section-overlay">
            <div className="section-crop" />
            
            {/* Measure indicators for the current 8-measure section */}
            <div className="measure-indicators">
              {Array.from({ length: Math.min(8, focusedSection.end - focusedSection.start + 1) }, (_, i) => {
                const measureNum = focusedSection.start + i
                const isCurrent = isPlaying && currentMusicSequence && 
                  MusicNotationParser.getCurrentMeasure(currentMusicSequence, currentTime) === measureNum
                return (
                  <div 
                    key={measureNum}
                    className={`measure-marker ${isCurrent ? 'current' : ''}`}
                  >
                    {measureNum}
                  </div>
                )
              })}
            </div>
            
            {/* Section navigation buttons */}
            <div className="section-focus-controls">
              {currentMusicSequence && Array.from({ length: Math.ceil(currentMusicSequence.totalMeasures / 8) }, (_, i) => {
                const sectionStart = i * 8 + 1
                const sectionEnd = Math.min(currentMusicSequence.totalMeasures, sectionStart + 7)
                const isActive = focusedSection.start === sectionStart
                return (
                  <button
                    key={i}
                    className={`section-button ${isActive ? 'active' : ''}`}
                    onClick={() => setFocusedSection({ start: sectionStart, end: sectionEnd })}
                  >
                    {sectionStart}-{sectionEnd}
                  </button>
                )
              })}
            </div>
          </div>
          
          {/* Overlay for highlighting current section */}
          {isPlaying && currentMusicSequence && (
            <div className="playback-overlay">
              {(() => {
                const position = MusicNotationParser.getPlaybackPosition(
                  currentMusicSequence, 
                  currentTime, 
                  currentMusicSequence.metadata.tempo || 120
                )
                
                return (
                  <>
                    {/* Current measure highlight (subtle background) */}
                    <div 
                      className="current-measure-highlight"
                      style={{
                        left: `${((position.measure - 1) / currentMusicSequence.totalMeasures) * 100}%`,
                        width: `${100 / currentMusicSequence.totalMeasures}%`,
                        top: '20%',
                        height: '60%'
                      }}
                    />
                    
                    {/* Horizontal playback position bar - moves left to right */}
                    <div 
                      className="playback-position-bar horizontal"
                      style={{
                        left: `${(() => {
                          const measureWidth = 100 / currentMusicSequence.totalMeasures
                          const measureLeft = ((position.measure - 1) / currentMusicSequence.totalMeasures) * 100
                          return measureLeft + (position.measureProgress * measureWidth)
                        })()}%`,
                        top: '15%',
                        width: '3px',
                        height: '70%'
                      }}
                    />
                  </>
                )
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}