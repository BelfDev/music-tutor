import React from 'react'
import { FiMusic, FiSettings } from 'react-icons/fi'
import { useAppStore } from '../store/useAppStore'
import './Header.scss'

export const Header: React.FC = () => {
  const { reset } = useAppStore()

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <FiMusic className="logo-icon" />
          <h1 className="logo-text">Note Pilot</h1>
        </div>
        
        <nav className="nav">
          <button
            className="nav-button"
            onClick={reset}
            title="New Session"
          >
            New Session
          </button>
          <button
            className="nav-button"
            title="Settings"
          >
            <FiSettings />
          </button>
        </nav>
      </div>
    </header>
  )
}