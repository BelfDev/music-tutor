import React, { useState } from 'react'
import { FiCalendar, FiMusic, FiPlay, FiTrash2, FiUser } from 'react-icons/fi'
import { SheetMusicItem, useAppStore } from '../store/useAppStore'
import { FileManager } from '../utils/fileManager'
import './SheetMusicCollection.scss'

export const SheetMusicCollection: React.FC = () => {
  const { 
    sheetMusicCollection, 
    currentSheetMusic, 
    setCurrentSheetMusic, 
    setError 
  } = useAppStore()
  
  const [isLoading, setIsLoading] = useState(false)

  const handleSelectSheetMusic = async (sheetMusic: SheetMusicItem) => {
    setIsLoading(true)
    try {
      setCurrentSheetMusic(sheetMusic)
    } catch (error) {
      setError('Failed to load sheet music')
      console.error('Error loading sheet music:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveSheetMusic = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this sheet music from your collection?')) {
      try {
        // Remove from collection
        const updatedCollection = sheetMusicCollection.filter(item => item.id !== id)
        
        // Update local storage
        await FileManager.updateSheetMusicCollection(updatedCollection)
        
        // If the removed item was currently selected, clear the selection
        if (currentSheetMusic?.id === id) {
          setCurrentSheetMusic(null)
        }
      } catch (error) {
        setError('Failed to remove sheet music')
        console.error('Error removing sheet music:', error)
      }
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (sheetMusicCollection.length === 0) {
    return (
      <div className="sheet-music-collection empty">
        <div className="empty-state">
          <FiMusic className="empty-icon" />
          <h3>No Sheet Music Found</h3>
          <p>Upload your first PDF to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="sheet-music-collection">
      <div className="collection-header">
        <h2>Your Sheet Music Collection</h2>
        <span className="collection-count">{sheetMusicCollection.length} pieces</span>
      </div>
      
      <div className="collection-grid">
        {sheetMusicCollection.map((sheetMusic) => (
          <div 
            key={sheetMusic.id}
            className={`sheet-music-card ${currentSheetMusic?.id === sheetMusic.id ? 'active' : ''}`}
          >
            <div className="card-thumbnail">
              {sheetMusic.pages.length > 0 && (
                <img 
                  src={sheetMusic.pages[0]} 
                  alt={`${sheetMusic.metadata.title} thumbnail`}
                  className="thumbnail-image"
                />
              )}
              <div className="card-overlay">
                <button
                  className="play-button"
                  onClick={() => handleSelectSheetMusic(sheetMusic)}
                  disabled={isLoading}
                  title="Open Sheet Music"
                >
                  <FiPlay />
                </button>
              </div>
            </div>
            
            <div className="card-content">
              <div className="card-header">
                <h3 className="card-title">{sheetMusic.metadata.title}</h3>
                <button
                  className="remove-button"
                  onClick={() => handleRemoveSheetMusic(sheetMusic.id)}
                  title="Remove from collection"
                >
                  <FiTrash2 />
                </button>
              </div>
              
              <div className="card-metadata">
                <div className="metadata-item">
                  <FiUser className="metadata-icon" />
                  <span>{sheetMusic.metadata.artist || 'Unknown Artist'}</span>
                </div>
                
                <div className="metadata-item">
                  <FiCalendar className="metadata-icon" />
                  <span>{formatDate(new Date(sheetMusic.createdAt))}</span>
                </div>
              </div>
              
              <div className="card-details">
                <div className="detail-item">
                  <span className="detail-label">Key:</span>
                  <span className="detail-value">{sheetMusic.metadata.key || 'Unknown'}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Tempo:</span>
                  <span className="detail-value">{sheetMusic.metadata.tempo || 120} BPM</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Time:</span>
                  <span className="detail-value">{sheetMusic.metadata.timeSignature || '4/4'}</span>
                </div>
              </div>
              
              <div className="card-footer">
                <span className="page-count">{sheetMusic.pages.length} pages</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}