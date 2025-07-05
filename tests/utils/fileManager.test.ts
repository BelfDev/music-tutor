import { FileManager } from '../../src/utils/fileManager'

// Mock the dependencies
jest.mock('../../src/utils/pdfProcessor', () => ({
  processPDF: jest.fn().mockResolvedValue(['page1', 'page2']),
  extractMetadata: jest.fn().mockResolvedValue({
    title: 'Test Song',
    composer: 'Test Composer',
    tempo: 120,
    timeSignature: '4/4',
    key: 'C major'
  })
}))

jest.mock('../../src/utils/musicNotationParser', () => ({
  MusicNotationParser: {
    parsePDFToMusicSequence: jest.fn().mockResolvedValue({
      bars: [{
        number: 1,
        notes: [],
        timeSignature: '4/4',
        keySignature: 'C major',
        tempo: 120
      }],
      metadata: {
        title: 'Test Song',
        composer: 'Test Composer',
        tempo: 120,
        timeSignature: '4/4',
        key: 'C major'
      },
      totalDuration: 4
    })
  }
}))

describe('FileManager', () => {
  beforeEach(() => {
    // Clear localStorage mock
    const localStorageMock = localStorage as jest.Mocked<Storage>
    localStorageMock.clear()
  })

  test('generates unique IDs', () => {
    const id1 = FileManager.generateId()
    const id2 = FileManager.generateId()
    
    expect(id1).toBeDefined()
    expect(id2).toBeDefined()
    expect(id1).not.toBe(id2)
    expect(typeof id1).toBe('string')
    expect(typeof id2).toBe('string')
  })

  test('fileToBase64 converts file to base64', async () => {
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
    
    const base64 = await FileManager.fileToBase64(mockFile)
    
    expect(base64).toBeDefined()
    expect(typeof base64).toBe('string')
    expect(base64).toBe('data:application/pdf;base64,mock-data')
  })

  test('addSheetMusicFile creates a sheet music file', async () => {
    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    
    const sheetMusic = await FileManager.addSheetMusicFile(mockFile)
    
    expect(sheetMusic).toBeDefined()
    expect(sheetMusic.name).toBe('test.pdf')
    expect(sheetMusic.file).toBe(mockFile)
    expect(sheetMusic.metadata).toBeDefined()
    expect(sheetMusic.pages).toEqual(['page1', 'page2'])
    expect(sheetMusic.musicSequence).toBeDefined()
    expect(sheetMusic.id).toBeDefined()
    expect(sheetMusic.dateAdded).toBeInstanceOf(Date)
  })

  test('copyToSheetMusicFolder simulates file copy', async () => {
    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    
    const filePath = await FileManager.copyToSheetMusicFolder(mockFile)
    
    expect(filePath).toBe('sheet_music/test.pdf')
  })

  test('removeSheetMusicFile removes file from collection', async () => {
    const mockCollection = [
      {
        id: '1',
        name: 'test1.pdf',
        file: new File(['test1'], 'test1.pdf'),
        metadata: {
          title: 'Test 1',
          composer: 'Composer 1',
          tempo: 120,
          timeSignature: '4/4',
          key: 'C major'
        },
        pages: ['page1'],
        dateAdded: new Date()
      },
      {
        id: '2',
        name: 'test2.pdf',
        file: new File(['test2'], 'test2.pdf'),
        metadata: {
          title: 'Test 2',
          composer: 'Composer 2',
          tempo: 120,
          timeSignature: '4/4',
          key: 'C major'
        },
        pages: ['page1'],
        dateAdded: new Date()
      }
    ]
    
    const updatedCollection = await FileManager.removeSheetMusicFile('1', mockCollection)
    
    expect(updatedCollection).toHaveLength(1)
    expect(updatedCollection[0].id).toBe('2')
  })

  test('loadSheetMusicCollection returns empty array when no data', async () => {
    const localStorageMock = localStorage as jest.Mocked<Storage>
    localStorageMock.getItem.mockReturnValue(null)
    
    const collection = await FileManager.loadSheetMusicCollection()
    
    expect(collection).toEqual([])
  })

  test('saveSheetMusicCollection stores collection in localStorage', async () => {
    const mockCollection = [{
      id: '1',
      name: 'test.pdf',
      file: new File(['test'], 'test.pdf'),
      metadata: {
        title: 'Test',
        composer: 'Composer',
        tempo: 120,
        timeSignature: '4/4',
        key: 'C major'
      },
      pages: ['page1'],
      dateAdded: new Date()
    }]
    
    await FileManager.saveSheetMusicCollection(mockCollection)
    
    const localStorageMock = localStorage as jest.Mocked<Storage>
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'sheetMusicCollection',
      expect.any(String)
    )
  })
})