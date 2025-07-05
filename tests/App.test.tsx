import React from 'react'
import { render, screen } from '@testing-library/react'
import App from '../src/App'

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />)
    expect(screen.getByText('Upload Sheet Music')).toBeInTheDocument()
  })

  test('shows upload section when no PDF is loaded', () => {
    render(<App />)
    expect(screen.getByText('Upload Sheet Music')).toBeInTheDocument()
    expect(screen.getByText('Drag & drop a PDF file here, or click to select')).toBeInTheDocument()
  })

  test('displays header component', () => {
    render(<App />)
    // The header should be present
    const headerElement = document.querySelector('header')
    expect(headerElement).toBeInTheDocument()
  })

  test('has proper accessibility attributes', () => {
    render(<App />)
    const mainElement = screen.getByRole('main')
    expect(mainElement).toBeInTheDocument()
    expect(mainElement).toHaveClass('main-content')
  })
})