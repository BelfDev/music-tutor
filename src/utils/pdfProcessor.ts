import * as pdfjsLib from 'pdfjs-dist'
import { SongMetadata } from '../store/useAppStore'

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js`

export const processPDF = async (file: File): Promise<string[]> => {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise
    const pages: string[] = []

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')!
      
      const viewport = page.getViewport({ scale: 2.0 })
      canvas.width = viewport.width
      canvas.height = viewport.height

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise

      pages.push(canvas.toDataURL())
    }

    return pages
  } catch (error) {
    console.error('Error processing PDF:', error)
    throw new Error('Failed to process PDF')
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