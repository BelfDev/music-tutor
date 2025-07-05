import { SheetMusicItem } from '../store/useAppStore'
import { extractMetadata, processPDF } from './pdfProcessor'

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
  static async saveSheetMusicCollection(collection: SheetMusicItem[]): Promise<void> {
    try {
      const serializedCollection = await Promise.all(
        collection.map(async (item) => {
          // Ensure dates are valid before serializing
          const createdAt = item.createdAt instanceof Date && !isNaN(item.createdAt.getTime()) 
            ? item.createdAt 
            : new Date()
          
          const lastPlayed = item.lastPlayed instanceof Date && !isNaN(item.lastPlayed.getTime()) 
            ? item.lastPlayed 
            : undefined

          return {
            ...item,
            file: await this.fileToBase64(item.file),
            createdAt: createdAt.toISOString(),
            lastPlayed: lastPlayed?.toISOString()
          }
        })
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
  static async loadSheetMusicCollection(): Promise<SheetMusicItem[]> {
    try {
      const stored = localStorage.getItem(this.SHEET_MUSIC_STORAGE_KEY)
      if (!stored) return []

      const serializedCollection = JSON.parse(stored)
      
      // Validate the data structure
      if (!Array.isArray(serializedCollection)) {
        console.warn('Invalid collection format in localStorage, clearing...')
        this.clearSheetMusicCollection()
        return []
      }
      
      const collection = await Promise.all(
        serializedCollection.map(async (item: any) => {
          // Validate required fields
          if (!item.id || !item.name || !item.file) {
            console.warn('Invalid item in collection, skipping:', item)
            return null
          }
          
          const file = await this.base64ToFile(item.file, item.name)
          
          // Safely parse dates
          let createdAt: Date
          try {
            createdAt = new Date(item.createdAt)
            if (isNaN(createdAt.getTime())) {
              createdAt = new Date()
            }
          } catch {
            createdAt = new Date()
          }
          
          let lastPlayed: Date | undefined
          if (item.lastPlayed) {
            try {
              lastPlayed = new Date(item.lastPlayed)
              if (isNaN(lastPlayed.getTime())) {
                lastPlayed = undefined
              }
            } catch {
              lastPlayed = undefined
            }
          }
          
          const sheetMusic: SheetMusicItem = {
            ...item,
            file,
            createdAt,
            lastPlayed
          }
          
          return sheetMusic
        })
      )
      
      // Filter out null items (invalid entries)
      return collection.filter(item => item !== null) as SheetMusicItem[]
    } catch (error) {
      console.error('Failed to load sheet music collection:', error)
      console.log('Clearing corrupted localStorage data...')
      this.clearSheetMusicCollection()
      return []
    }
  }

  // Add a new sheet music file to collection
  static async addSheetMusicFile(file: File): Promise<SheetMusicItem> {
    try {
      console.log('FileManager.addSheetMusicFile called with:', file.name)
      const id = this.generateId()
      console.log('Generated ID:', id)
      
      console.log('Processing PDF...')
      const pages = await processPDF(file)
      console.log('PDF processed, pages count:', pages.length)
      
      console.log('Extracting metadata...')
      const metadata = await extractMetadata(file)
      console.log('Metadata extracted:', metadata)
      
      const finalMetadata = metadata || {
        title: file.name.replace('.pdf', ''),
        artist: 'Unknown Artist',
        key: 'C major',
        timeSignature: '4/4',
        tempo: 120,
        difficulty: 'Intermediate',
        genre: 'Classical',
        duration: 180
      }
      console.log('Final metadata:', finalMetadata)
      
      const sheetMusic: SheetMusicItem = {
        id,
        name: file.name.replace('.pdf', ''),
        file,
        metadata: finalMetadata,
        pages,
        createdAt: new Date()
      }

      console.log('Sheet music object created:', sheetMusic)
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
  static async loadSheetMusicFromFolder(): Promise<SheetMusicItem[]> {
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
  static async loadExampleSheetMusic(): Promise<SheetMusicItem[]> {
    try {
      // In a real implementation, this would fetch the actual file from the server
      // For now, we'll create a placeholder entry
      const exampleFiles: SheetMusicItem[] = []
      
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
  static async removeSheetMusicFile(id: string, collection: SheetMusicItem[]): Promise<SheetMusicItem[]> {
    return collection.filter(item => item.id !== id)
  }

  // Update sheet music collection in storage
  static async updateSheetMusicCollection(collection: SheetMusicItem[]): Promise<void> {
    await this.saveSheetMusicCollection(collection)
  }

  // Clear corrupted localStorage data
  static clearSheetMusicCollection(): void {
    try {
      localStorage.removeItem(this.SHEET_MUSIC_STORAGE_KEY)
      console.log('Sheet music collection localStorage cleared')
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
    }
  }
}