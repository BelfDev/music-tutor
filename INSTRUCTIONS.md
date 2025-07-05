
# Prompt Requirement Document

**Project:** Piano Sheet Music Learning App
**Project Name:** Note Pilot
**Execution Environment:** Cursor Background Agents

## 1. Objective

Develop a web-based application that accelerates the process of learning new piano sheet music. The user uploads a sheet music PDF, and the app provides an interactive, step-by-step learning experience.

You are free to choose the appropriate tech stack, but make sure your choices are documented in one or more markdown files under a docs/ directory in the root level. I do have a bias for React.

## 2. Key Features

### Sheet Music Display

- **PDF Import:** User uploads a sheet music PDF.
- **Visual Display:** Render the sheet music clearly and responsively in the browser.
- **Auto-Scroll:** Sheet music scrolls vertically in sync with the user’s playing.


### Interactive Piano Keyboard

- **Full-Sized Piano:** On-screen keyboard displays all keys.
- **Note Highlighting:** Keys light up as the user plays or as the app guides them.
- **Real-Time Feedback:** Show which notes are being played in real time.


### Notation Support

- **Dual Notation:** Display both standard music notation and A B C D E F note names for each note. In other words, letter notation in addition to the solfege notation.
- **Toggle Option:** User can switch between or view both notations simultaneously.


### Playback \& Audio

- **Playback Mechanism:** Play the sheet music so the user can hear how it should sound.
- **Adjustable Tempo:** User can slow down or speed up playback.
- **Loop Sections:** Allow looping of specific bars or sections for practice.


### Song Information

- **Tempo Display:** Show the current tempo (BPM).
- **Bar Indicator:** Display the current bar/measure number.
- **Song Metadata:** Title, composer, and other relevant details.


### Learning Aids

- **Tips Section:** Provide context-specific tips, such as identifying patterns, scales, or fingerings relevant to the piece.
- **Pattern Recognition:** Highlight recurring motifs or technical challenges.

### Microphone Input for Real-Time Feedback

- **Microphone Integration:** The app should be able to access the user's microphone (with permission) to listen as they play their physical piano or keyboard.
- **Pitch Detection:** Analyze incoming audio to detect which notes are being played in real time.
- **Visual Feedback:** Highlight corresponding keys on the on-screen piano and scroll the sheet music in sync with the user's performance.
- **Error Detection:** Notify the user of missed or incorrect notes, and offer suggestions for improvement.
- **Privacy Consideration:** All audio processing should occur locally in the browser; no audio data is sent to external servers.


### User Experience

- **Local Execution:** All features run in the user’s web browser; no server-side processing required for core functionality.
- **Responsive Design:** App adapts to different screen sizes and devices.
- **Accessibility:** Ensure color contrast, keyboard navigation, and screen reader compatibility.

## 3. Functional Requirements

| Requirement ID | Description | Priority | Acceptance Criteria |
| :-- | :-- | :-- | :-- |
| FR-1 | User can upload a PDF of piano sheet music | High | PDF loads and displays correctly in the app |
| FR-2 | Sheet music is rendered and scrolls vertically as user plays | High | Scrolling is smooth and synchronized with input |
| FR-3 | On-screen piano keyboard displays all keys and highlights played notes | High | Keys light up in real time as notes are played |
| FR-4 | App displays both standard notation and letter notation (A-G) | High | Notation is clear and toggleable |
| FR-5 | Playback feature plays the sheet music with adjustable tempo | High | Audio matches the score and tempo can be changed |
| FR-6 | App displays tempo, bar number, and song metadata | Medium | Information is visible and updates as song progresses |
| FR-7 | Tips section provides learning advice for the current piece | Medium | Tips are relevant and context-specific |
| FR-8 | App runs fully in the browser without server-side dependencies | High | No internet required after initial load |
| FR-9 | Modern, user-friendly, and accessible design | High | Users report ease of use and visual appeal |
| FR-10 | Microphone input for real-time note detection and feedback | High | App listens, detects notes, and provides feedback |

## 4. Non-Functional Requirements

- **Performance:** App loads within 3 seconds and responds to user input with <100ms latency.
- **Security:** No user data or sheet music is uploaded to external servers.
- **Privacy:** All processing is local; no analytics or tracking. Microphone access is opt-in, and all audio is processed locally.
- **Maintainability:** Codebase follows modular, well-documented structure.
- **Extensibility:** Easy to add support for new features or instruments.
- **Accessibility:** Comply with WCAG standards for color contrast, keyboard navigation, and screen reader support.
- **User Experience:** The interface must be visually appealing, intuitive, and require minimal learning curve.

## 5. Technical Constraints

- **Frontend:** Must be a web application (e.g., React, Vue, or similar).
- **PDF Parsing:** Use a reliable library for PDF and music notation parsing.
- **Audio Synthesis:** Use Web Audio API or similar for playback.


## 6. Best Practices

- **Clear Language:** Use unambiguous, concise descriptions for all requirements.
- **Testing:** Include unit, integration, and user acceptance tests.
- **Documentation:** Maintain up-to-date technical and user documentation.

## 7. Assumptions \& Constraints

- Users have access to a modern web browser.
- Sheet music PDFs are legible and follow standard notation.
- The app is intended for personal, non-commercial use.


## 8. Risks

- **PDF Complexity:** Some PDFs may not parse correctly if they use non-standard notation.
- **Browser Compatibility:** Advanced features (e.g., real-time audio synthesis) may not work on all browsers.
- **Performance:** Large or complex scores may impact performance.


## 9. Example User Flow

1. User opens the app in their browser.
2. User uploads a piano sheet music PDF.
3. The app displays the sheet music and a full piano keyboard.
4. User starts playback or plays along; sheet music scrolls automatically.
5. Notes played are highlighted on the keyboard and labeled in both notations.
6. User can view tips, adjust tempo, and loop sections for practice.
