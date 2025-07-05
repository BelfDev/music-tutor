import { SheetMusicFile } from '../store/useAppStore'
import { processPDF, extractMetadata } from './pdfProcessor'
import { MusicNotationParser } from './musicNotationParser'

export class FileManager {
  private static SHEET_MUSIC_STORAGE_KEY = 'sheetMusicCollection'

  // Convert File to Base64 for storage
  static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  // Convert Base64 back to File
  static async base64ToFile(base64: string, filename: string): Promise<File> {
    const response = await fetch(base64)
    const blob = await response.blob()
    return new File([blob], filename, { type: 'application/pdf' })
  }

  // Save sheet music collection to local storage
  static async saveSheetMusicCollection(collection: SheetMusicFile[]): Promise<void> {
    try {
      const serializedCollection = await Promise.all(
        collection.map(async (item) => ({
          ...item,
          file: await this.fileToBase64(item.file),
          dateAdded: item.dateAdded.toISOString(),
          // Don't serialize the musicSequence as it's too large - will be regenerated
          musicSequence: undefined
        }))
      )
      
      localStorage.setItem(
        this.SHEET_MUSIC_STORAGE_KEY,
        JSON.stringify(serializedCollection)
      )
    } catch (error) {
      console.error('Failed to save sheet music collection:', error)
      throw error
    }
  }

  // Load sheet music collection from local storage
  static async loadSheetMusicCollection(): Promise<SheetMusicFile[]> {
    try {
      const stored = localStorage.getItem(this.SHEET_MUSIC_STORAGE_KEY)
      if (!stored) return []

      const serializedCollection = JSON.parse(stored)
      
      const collection = await Promise.all(
        serializedCollection.map(async (item: any) => {
          const file = await this.base64ToFile(item.file, item.name)
          const sheetMusic: SheetMusicFile = {
            ...item,
            file,
            dateAdded: new Date(item.dateAdded)
          }
          
          // Regenerate music sequence
          if (sheetMusic.metadata) {
            try {
              sheetMusic.musicSequence = await MusicNotationParser.parsePDFToMusicSequence(
                file, 
                sheetMusic.metadata
              )
            } catch (error) {
              console.warn('Failed to regenerate music sequence for', sheetMusic.name, error)
            }
          }
          
          return sheetMusic
        })
      )
      
      return collection
    } catch (error) {
      console.error('Failed to load sheet music collection:', error)
      return []
    }
  }

  // Add a new sheet music file to collection
  static async addSheetMusicFile(file: File): Promise<SheetMusicFile> {
    try {
      const id = this.generateId()
      const pages = await processPDF(file)
      const metadata = await extractMetadata(file)
      
      const finalMetadata = metadata || {
        title: file.name.replace('.pdf', ''),
        composer: 'Unknown',
        tempo: 120,
        timeSignature: '4/4',
        key: 'C major'
      }
      
      // Generate music sequence
      const musicSequence = await MusicNotationParser.parsePDFToMusicSequence(
        file, 
        finalMetadata
      )
      
      const sheetMusic: SheetMusicFile = {
        id,
        name: file.name,
        file,
        metadata: finalMetadata,
        pages,
        dateAdded: new Date(),
        filePath: `sheet_music/${file.name}`,
        musicSequence
      }

      return sheetMusic
    } catch (error) {
      console.error('Failed to add sheet music file:', error)
      throw error
    }
  }

  // Generate unique ID for sheet music files
  static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Simulate copying file to sheet_music folder (in real implementation this would be server-side)
  static async copyToSheetMusicFolder(file: File): Promise<string> {
    // In a real implementation, this would copy the file to the server's sheet_music folder
    // For now, we'll just return a simulated file path
    const fileName = file.name
    console.log(`Simulating copy of ${fileName} to sheet_music folder`)
    return `sheet_music/${fileName}`
  }

  // Load sheet music files from the sheet_music folder on startup
  static async loadSheetMusicFromFolder(): Promise<SheetMusicFile[]> {
    try {
      // In a real implementation, this would make an API call to list files in the sheet_music folder
      // For demo purposes, we'll check if we have the example file
      const exampleFiles = await this.loadExampleSheetMusic()
      return exampleFiles
    } catch (error) {
      console.error('Failed to load sheet music from folder:', error)
      return []
    }
  }

  // Load example sheet music (concerning_hobbits.pdf)
  static async loadExampleSheetMusic(): Promise<SheetMusicFile[]> {
    try {
      // In a real implementation, this would fetch the actual file from the server
      // For now, we'll create a placeholder entry
      const exampleFiles: SheetMusicFile[] = []
      
      // Check if we can access the example file
      try {
        const response = await fetch('/sheet_music/concerning_hobbits.pdf')
        if (response.ok) {
          const blob = await response.blob()
          const file = new File([blob], 'concerning_hobbits.pdf', { type: 'application/pdf' })
          const sheetMusic = await this.addSheetMusicFile(file)
          exampleFiles.push(sheetMusic)
        }
      } catch (error) {
        console.log('Example sheet music not accessible via HTTP, will need to be uploaded manually')
      }
      
      return exampleFiles
    } catch (error) {
      console.error('Failed to load example sheet music:', error)
      return []
    }
  }

  // Remove a sheet music file
  static async removeSheetMusicFile(id: string, collection: SheetMusicFile[]): Promise<SheetMusicFile[]> {
    return collection.filter(item => item.id !== id)
  }

  // Update sheet music collection in storage
  static async updateSheetMusicCollection(collection: SheetMusicFile[]): Promise<void> {
    await this.saveSheetMusicCollection(collection)
  }
}