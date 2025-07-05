import { MusicNotationParser } from '../../src/utils/musicNotationParser'

describe('MusicNotationParser', () => {
  test('pitchToMidi converts pitch correctly', () => {
    expect(MusicNotationParser.pitchToMidi('C4')).toBe(60)
    expect(MusicNotationParser.pitchToMidi('A4')).toBe(69)
    expect(MusicNotationParser.pitchToMidi('C#4')).toBe(61)
    expect(MusicNotationParser.pitchToMidi('C5')).toBe(72)
  })

  test('midiToFrequency converts MIDI correctly', () => {
    expect(MusicNotationParser.midiToFrequency(69)).toBeCloseTo(440, 1) // A4
    expect(MusicNotationParser.midiToFrequency(60)).toBeCloseTo(261.63, 1) // C4
  })

  test('midiToPitch converts MIDI to pitch correctly', () => {
    expect(MusicNotationParser.midiToPitch(60)).toBe('C4')
    expect(MusicNotationParser.midiToPitch(69)).toBe('A4')
    expect(MusicNotationParser.midiToPitch(61)).toBe('C#4')
  })

  test('parsePDFToMusicSequence generates a sequence', async () => {
    const mockMetadata = {
      title: 'Test Song',
      composer: 'Test Composer',
      tempo: 120,
      timeSignature: '4/4',
      key: 'C major'
    }

    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    const sequence = await MusicNotationParser.parsePDFToMusicSequence(mockFile, mockMetadata)

    expect(sequence).toBeDefined()
    expect(sequence.metadata).toEqual(mockMetadata)
    expect(sequence.bars).toHaveLength(8)
    expect(sequence.totalDuration).toBe(32) // 8 bars * 4 beats
  })

  test('getTotalBars returns correct number of bars', async () => {
    const mockMetadata = {
      title: 'Test Song',
      composer: 'Test Composer',
      tempo: 120,
      timeSignature: '4/4',
      key: 'C major'
    }

    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    const sequence = await MusicNotationParser.parsePDFToMusicSequence(mockFile, mockMetadata)
    
    expect(MusicNotationParser.getTotalBars(sequence)).toBe(8)
  })

  test('getNotesForBar returns notes for specific bar', async () => {
    const mockMetadata = {
      title: 'Test Song',
      composer: 'Test Composer',
      tempo: 120,
      timeSignature: '4/4',
      key: 'C major'
    }

    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    const sequence = await MusicNotationParser.parsePDFToMusicSequence(mockFile, mockMetadata)
    
    const notesInBar1 = MusicNotationParser.getNotesForBar(sequence, 1)
    expect(notesInBar1).toHaveLength(4) // 4 quarter notes per bar
    
    const notesInInvalidBar = MusicNotationParser.getNotesForBar(sequence, 999)
    expect(notesInInvalidBar).toHaveLength(0)
  })

  test('sequenceToToneJSFormat converts sequence correctly', async () => {
    const mockMetadata = {
      title: 'Test Song',
      composer: 'Test Composer',
      tempo: 120,
      timeSignature: '4/4',
      key: 'C major'
    }

    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    const sequence = await MusicNotationParser.parsePDFToMusicSequence(mockFile, mockMetadata)
    
    const toneNotes = MusicNotationParser.sequenceToToneJSFormat(sequence)
    expect(toneNotes).toHaveLength(32) // 8 bars * 4 notes per bar
    
    // Check format of first note
    expect(toneNotes[0]).toHaveProperty('note')
    expect(toneNotes[0]).toHaveProperty('time')
    expect(toneNotes[0]).toHaveProperty('duration')
    expect(toneNotes[0]).toHaveProperty('velocity')
  })
})