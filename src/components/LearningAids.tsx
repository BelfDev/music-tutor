import React, { useEffect, useState } from 'react'
import { FiEye, FiEyeOff, FiSun, FiTarget, FiTrendingUp } from 'react-icons/fi'
import { useAppStore } from '../store/useAppStore'
import './LearningAids.scss'

const LEARNING_TIPS = [
  {
    id: 1,
    title: "Hand Position",
    content: "Keep your wrists relaxed and fingers curved. Imagine holding a small ball in your hand."
  },
  {
    id: 2,
    title: "Rhythm Practice",
    content: "Start slowly and focus on playing with steady rhythm. Use a metronome to maintain consistent timing."
  },
  {
    id: 3,
    title: "Chord Recognition",
    content: "Learn to identify common chord patterns like triads, sevenths, and inversions for faster reading."
  },
  {
    id: 4,
    title: "Scale Practice",
    content: "Practice scales in the key of your piece to improve finger familiarity and technical skills."
  },
  {
    id: 5,
    title: "Sight Reading",
    content: "Practice reading both clefs simultaneously. Start with simple pieces and gradually increase difficulty."
  }
]

const PATTERN_RECOGNITION = [
  {
    id: 1,
    type: "Chord Progression",
    pattern: "I-V-vi-IV",
    description: "Very common chord progression in popular music"
  },
  {
    id: 2,
    type: "Scale Pattern",
    pattern: "C Major Scale",
    description: "All white keys: C-D-E-F-G-A-B-C"
  },
  {
    id: 3,
    type: "Rhythmic Pattern",
    pattern: "4/4 Time",
    description: "Four quarter note beats per measure"
  }
]

export const LearningAids: React.FC = () => {
  const { currentSheetMusic } = useAppStore()
  
  const [showTips, setShowTips] = useState(true)
  const [selectedTip, setSelectedTip] = useState<number | null>(null)
  const [showPatterns, setShowPatterns] = useState(false)
  const [currentTips, setCurrentTips] = useState<string[]>([])

  useEffect(() => {
    // Generate context-specific tips based on song metadata
    if (currentSheetMusic?.metadata) {
      const contextTips = generateContextTips(currentSheetMusic.metadata)
      setCurrentTips(contextTips)
    } else {
      setCurrentTips([])
    }
  }, [currentSheetMusic])

  const generateContextTips = (metadata: any) => {
    const tips: string[] = []
    
    // Key-specific tips
    if (metadata.key?.includes('major')) {
      tips.push("This piece is in a major key - expect a bright, happy sound.")
    } else if (metadata.key?.includes('minor')) {
      tips.push("This piece is in a minor key - expect a more melancholic or dramatic sound.")
    }
    
    // Tempo-specific tips
    if (metadata.tempo < 80) {
      tips.push("This is a slow piece - focus on expression and smooth legato playing.")
    } else if (metadata.tempo > 140) {
      tips.push("This is a fast piece - practice slowly first, then gradually increase speed.")
    }
    
    // Time signature tips
    if (metadata.timeSignature === '3/4') {
      tips.push("This piece is in 3/4 time - feel the waltz-like rhythm with emphasis on beat 1.")
    } else if (metadata.timeSignature === '4/4') {
      tips.push("This piece is in 4/4 time - the most common time signature with four beats per measure.")
    }
    
    return tips
  }

  const toggleTips = () => {
    setShowTips(!showTips)
  }

  const togglePatterns = () => {
    setShowPatterns(!showPatterns)
  }

  if (!showTips) {
    return (
      <div className="learning-aids collapsed">
        <button 
          className="toggle-button"
          onClick={toggleTips}
          title="Show Learning Aids"
        >
          <FiEye />
          <span>Show Learning Aids</span>
        </button>
      </div>
    )
  }

  return (
    <div className="learning-aids">
      <div className="aids-header">
        <h3>
          <FiSun className="icon" />
          Learning Aids
        </h3>
        <button 
          className="toggle-button"
          onClick={toggleTips}
          title="Hide Learning Aids"
        >
          <FiEyeOff />
        </button>
      </div>

      <div className="aids-content">
        <div className="section">
          <h4>
            <FiTarget className="icon" />
            Context Tips
          </h4>
          <div className="tips-list">
            {currentTips.length > 0 ? (
              currentTips.map((tip, index) => (
                <div key={index} className="tip-item">
                  <p>{tip}</p>
                </div>
              ))
            ) : (
              <p className="no-tips">Upload a song to see context-specific tips</p>
            )}
          </div>
        </div>

        <div className="section">
          <h4>
            <FiTrendingUp className="icon" />
            General Tips
          </h4>
          <div className="tips-grid">
            {LEARNING_TIPS.map((tip) => (
              <div 
                key={tip.id}
                className={`tip-card ${selectedTip === tip.id ? 'selected' : ''}`}
                onClick={() => setSelectedTip(selectedTip === tip.id ? null : tip.id)}
              >
                <h5>{tip.title}</h5>
                {selectedTip === tip.id && (
                  <p className="tip-content">{tip.content}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <h4>
              <FiTarget className="icon" />
              Pattern Recognition
            </h4>
            <button 
              className="toggle-button small"
              onClick={togglePatterns}
            >
              {showPatterns ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {showPatterns && (
            <div className="patterns-list">
              {PATTERN_RECOGNITION.map((pattern) => (
                <div key={pattern.id} className="pattern-item">
                  <div className="pattern-header">
                    <span className="pattern-type">{pattern.type}</span>
                    <span className="pattern-name">{pattern.pattern}</span>
                  </div>
                  <p className="pattern-description">{pattern.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}