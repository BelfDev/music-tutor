import * as pdfjsLib from 'pdfjs-dist';
import { SongMetadata } from '../store/useAppStore';

// Set up PDF.js worker for Vite - use local worker file
if (typeof window !== 'undefined') {
  // Use the worker file that's copied to the public directory
  pdfjsLib.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.js`;
  
  // Also set up a fallback in case the worker fails to load
  pdfjsLib.GlobalWorkerOptions.workerPort = null;
}

export const processPDF = async (file: File): Promise<string[]> => {
  try {
    console.log('processPDF called with file:', file.name)
    console.log('PDF.js worker source:', pdfjsLib.GlobalWorkerOptions.workerSrc)
    
    // Check if PDF.js worker is properly set up
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      console.warn('PDF.js worker not configured, setting up...')
      if (typeof window !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.js`;
        console.log('Set PDF.js worker source to:', pdfjsLib.GlobalWorkerOptions.workerSrc)
      }
    }
    
    const arrayBuffer = await file.arrayBuffer()
    console.log('File converted to ArrayBuffer, size:', arrayBuffer.byteLength)
    
    console.log('Loading PDF document...')
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise
    console.log('PDF loaded, pages:', pdf.numPages)
    
    const pages: string[] = []

    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`Processing page ${i}/${pdf.numPages}...`)
      const page = await pdf.getPage(i)
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      
      if (!context) {
        throw new Error('Could not get canvas context')
      }
      
      const viewport = page.getViewport({ scale: 2.0 })
      canvas.width = viewport.width
      canvas.height = viewport.height
      console.log(`Page ${i} viewport:`, viewport.width, 'x', viewport.height)

      console.log(`Rendering page ${i}...`)
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise

      const dataUrl = canvas.toDataURL()
      pages.push(dataUrl)
      console.log(`Page ${i} rendered successfully, data URL length:`, dataUrl.length)
    }

    console.log('All pages processed successfully')
    return pages
  } catch (error) {
    console.error('Error processing PDF:', error)
    throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export const extractMetadata = async (file: File): Promise<SongMetadata | null> => {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise
    const metadata = await pdf.getMetadata()

    // Extract basic metadata
    const info = metadata.info as any
    const title = info?.Title || file.name.replace('.pdf', '')
    const composer = info?.Author || 'Unknown'

    // Default values for music-specific metadata
    const songMetadata: SongMetadata = {
      title,
      composer,
      tempo: 120, // Default BPM
      timeSignature: '4/4', // Default time signature
      key: 'C major' // Default key
    }

    return songMetadata
  } catch (error) {
    console.error('Error extracting metadata:', error)
    return null
  }
}

export const analyzePDFForMusic = async (_file: File): Promise<any> => {
  // This would be a more advanced feature to analyze the PDF content
  // for musical elements like notes, time signatures, etc.
  // For now, we'll return basic structure
  return {
    hasStandardNotation: true,
    estimatedDifficulty: 'intermediate',
    keySignature: 'C major',
    timeSignature: '4/4',
    estimatedTempo: 120
  }
}