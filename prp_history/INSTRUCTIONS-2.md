# Prompt Requirement Document 2

## 1. Objective

Refine and correct the application's code to address issues with sheet music loading, parsing, playback, file management, and testing. Ensure the app reliably loads, parses, and plays sheet music, manages local files, and maintains high code quality through comprehensive testing.

## 2. Key Fixes & Additions

### Sheet Music Loading & Parsing

- **Robust PDF Import:**  
  - The app must reliably load and display uploaded PDF sheet music.
  - If parsing fails, provide a clear error message and troubleshooting steps.
- **Parsing Support:**  
  - Integrate or improve PDF-to-music-notation parsing (e.g., PDF to MusicXML or similar).
  - Support standard piano sheet music formats and handle common parsing errors gracefully.

Note: please ensure that the example sheet music provided under the "sheet_music" folder works.

### Playback Functionality

- **Accurate Playback:**  
  - Playback must interpret and play the notes from the loaded sheet music, not just a generic audio file.
  - Playback should reflect the actual notes, tempo, and dynamics present in the score.

### Local File Management

- **Sheet Music Folder Integration:**  
  - The app must recognize and display all sheet music files present in the local "sheet_music" folder on startup.
  - Any new sheet music uploaded by the user should be automatically copied to the "sheet_music" folder.
- **Sheet Music Collection:**  
  - Provide a user interface to browse, select, and manage all previously loaded sheet music from the "sheet_music" folder.
  - Display metadata (title, composer, date added) for each piece in the collection.

### Testing & Code Quality

- **Comprehensive Testing:**  
  - The codebase must include both unit and integration tests for all major features, including:
    - Sheet music loading and parsing
    - Playback functionality
    - File management and collection display
    - User interface interactions
  - Tests should be automated and easy to run locally.
- **Test Coverage:**  
  - Aim for high test coverage, especially for critical logic and user flows.

## 3. Updated Functional Requirements

| Requirement ID | Description                                                                 | Priority | Acceptance Criteria                                  |
|----------------|-----------------------------------------------------------------------------|----------|------------------------------------------------------|
| FR-1           | User can upload a PDF of piano sheet music                                  | High     | PDF loads, parses, and displays correctly            |
| FR-2           | App parses sheet music and extracts notes for playback                      | High     | Notes are extracted and available for playback       |
| FR-3           | Playback plays the actual notes from the sheet music                        | High     | Playback matches the score’s notes and tempo         |
| FR-4           | App recognizes sheet music in the "sheet_music" local folder                | High     | All files in folder are listed and loadable          |
| FR-5           | Uploaded sheet music is copied to the "sheet_music" folder                  | High     | New uploads appear in the folder and collection      |
| FR-6           | App displays a collection of all loaded sheet music                         | High     | Users can browse, select, and manage pieces          |
| FR-7           | Codebase includes integration and unit tests                                | High     | Tests exist, are automated, and cover key features   |

## 4. Non-Functional Requirements

- **Reliability:**  
  - The app must handle file errors gracefully and provide clear user feedback.
- **Performance:**  
  - Loading and parsing should be efficient, even for large scores.
- **Maintainability:**  
  - Code should be modular, well-documented, and easy to extend.
- **Testability:**  
  - All new features must be testable with automated tests.

## 5. Technical Constraints

- **Local File Access:**  
  - The app must interact with the local "sheet_music" folder for reading and writing files.
- **Frontend Framework:**  
  - Continue using a modern web framework (e.g., React).
- **Music Parsing:**  
  - Use or improve upon existing libraries for PDF and music notation parsing.
- **Testing Tools:**  
  - Use established testing frameworks (e.g., Jest, React Testing Library) for both unit and integration tests.

Note: ensure there are no warnings or errors when running the application.

## 6. Acceptance Criteria

- Sheet music PDFs load and display without errors.
- Notes are parsed and available for accurate playback.
- Playback reflects the actual sheet music.
- All files in the "sheet_music" folder are recognized and manageable in the app.
- Uploaded files are copied to the "sheet_music" folder and added to the collection.
- The app provides a user-friendly interface for browsing and managing sheet music.
- The codebase includes comprehensive, automated tests for all major features.

## 7. Risks & Mitigations

- **PDF Parsing Limitations:**  
  - Some PDFs may not convert cleanly; provide user guidance and support for common issues.
- **File System Access:**  
  - Ensure compatibility with browser and local file system APIs.
- **Test Coverage:**  
  - Allocate time for writing and maintaining tests as features evolve.

## 8. Reminders

- If you need to recall context, look at the current codebas and previous instructions.
- Follow best practices for file management and automated testing in web applications.
- Don't forget to update documentation, make commands, and the root-level README file if necessary.