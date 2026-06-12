# Implementation Plan: Interactive Bookshelf

## Overview

This plan implements a 3D interactive bookshelf for the bookstore UI using React Three Fiber, integrating with the existing Redux store (booksSlice, cartSlice, authSlice) and routing. Books are displayed as colored 3D spines organized by category on a vintage wooden shelf. A responsive 2D fallback grid serves mobile users and devices without WebGL. Mock data drives the feature until Django backend integration.

## Tasks

- [x] 1. Install dependencies and set up data layer
  - [x] 1.1 Install new dependencies (@react-three/fiber, @react-three/drei, three) and dev dependencies (vitest, @testing-library/react, @testing-library/jest-dom, fast-check)
    - Run `npm install @react-three/fiber @react-three/drei three`
    - Run `npm install -D vitest @testing-library/react @testing-library/jest-dom fast-check jsdom`
    - Add `"test": "vitest --run"` script to package.json
    - Configure vitest in `vite.config.js` with jsdom environment
    - _Requirements: 5.4, 8.1_

  - [x] 1.2 Create mock data store and spine color constants
    - Create `src/data/mockBooks.js` with 20-30 book objects across 4-5 categories (Science Fiction, Fantasy, Mystery, Non-Fiction, Classic Literature)
    - Each book must have: id, title, author, price, coverImageUrl, category, pageCount
    - Use `https://picsum.photos/seed/{title}/200/300` for coverImageUrl
    - Create `src/constants/bookColors.js` with SPINE_COLORS array (12+ colors)
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 1.3 Create utility functions for bookshelf logic
    - Create `src/utils/bookshelfUtils.js` with:
      - `groupBooksByCategory(books)` — groups flat array into `Record<string, Book[]>`
      - `computeSpineThickness(pageCount)` — returns thickness proportional to pageCount
      - `assignSpineColor(index)` — returns a color from SPINE_COLORS by index
    - _Requirements: 4.1, 5.2, 5.5_

  - [ ]* 1.4 Write property tests for mock data schema validity
    - **Property 6: Mock data schema validity**
    - **Validates: Requirements 7.3, 7.4**
    - Create `src/data/__tests__/mockBooks.property.test.js`
    - Verify every book in MOCK_BOOKS has all required fields with correct types

  - [ ]* 1.5 Write property tests for category grouping and spine utilities
    - **Property 1: Category grouping invariant**
    - **Validates: Requirements 4.1, 4.4, 6.3**
    - **Property 3: Spine color assignment from palette**
    - **Validates: Requirements 5.2**
    - **Property 4: Spine thickness proportional to page count**
    - **Validates: Requirements 5.5**
    - Create `src/utils/__tests__/bookshelfUtils.property.test.js`

- [x] 2. Extend Redux store and create hooks
  - [x] 2.1 Extend booksSlice with selection state and mock data loading
    - Add `selected: null` and update reducers: `selectBook`, `clearSelection`
    - Add a `loadMockBooks` action or initializer that populates `items` from mockBooks.js if empty
    - _Requirements: 7.5, 3.1_

  - [x] 2.2 Verify cartSlice has addItem action for book cart integration
    - Ensure `cartSlice` has an `addItem` reducer that accepts `{ id, title, price, quantity }`
    - Add it if missing
    - _Requirements: 3.3_

  - [x] 2.3 Create useViewport hook
    - Create `src/hooks/useViewport.js`
    - Return `{ width, isMobile, hasWebGL }`
    - `isMobile`: true when width < 768px
    - `hasWebGL`: test via `document.createElement('canvas').getContext('webgl')` on mount
    - Listen to window resize events, debounced
    - _Requirements: 6.1, 6.5_

  - [x] 2.4 Create useBookshelf hook
    - Create `src/hooks/useBookshelf.js`
    - On mount, dispatch loadMockBooks if store is empty
    - Derive `booksByCategory` using `useMemo` and `groupBooksByCategory`
    - Expose: `books`, `booksByCategory`, `categories`, `selectedBook`, `selectBook`, `clearSelection`, `loading`
    - _Requirements: 4.1, 7.5_

  - [ ]* 2.5 Write property test for viewport threshold
    - **Property 5: Viewport threshold determines render mode**
    - **Validates: Requirements 6.1**
    - Create `src/hooks/__tests__/useViewport.property.test.js`

- [x] 3. Checkpoint - Ensure data layer and hooks are working
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement 3D Bookshelf components
  - [x] 4.1 Create BookSpine component
    - Create `src/components/Bookshelf/BookSpine.jsx`
    - Render box geometry with thickness from `computeSpineThickness(book.pageCount)`
    - Apply color from `assignSpineColor(index)`
    - Render title text on spine face using drei `<Text>`
    - On hover (when interactive): scale up slightly, apply emissive glow
    - On click (when interactive): call `onSelect(book)`
    - _Requirements: 5.2, 5.5, 3.2, 2.1_

  - [x] 4.2 Create ShelfRow component
    - Create `src/components/Bookshelf/ShelfRow.jsx`
    - Render a wood-textured shelf plank mesh
    - Render a 3D text label for the category name using drei `<Text>`
    - Map books to `<BookSpine>` left-to-right with spacing
    - Accept `yPosition` for vertical placement
    - _Requirements: 4.1, 4.2, 4.3, 5.1_

  - [x] 4.3 Create BookshelfScene component
    - Create `src/components/Bookshelf/BookshelfScene.jsx`
    - Render `<Canvas>` with camera positioned to show all shelf rows
    - Set up ambient light (warm tone) and directional light
    - Render shelf structure and one `<ShelfRow>` per category
    - Accept `interactive` prop; when false apply reduced opacity overlay
    - Accept `onBookSelect` callback
    - Export as default for React.lazy usage
    - _Requirements: 5.1, 5.3, 5.4, 1.1, 1.3, 2.2_

  - [x] 4.4 Create BookDetailCard component
    - Create `src/components/Bookshelf/BookDetailCard.jsx`
    - HTML overlay (not 3D) that renders above the canvas
    - Display: title, author, price, cover image, category
    - "Add to Cart" button dispatches `addItem` to cartSlice
    - Close on outside click (useRef + mousedown) or Escape key
    - Position adjacent to selection without viewport overflow
    - _Requirements: 3.1, 3.3, 3.4, 3.5_

  - [ ]* 4.5 Write property test for book detail card data completeness
    - **Property 2: Book detail card data completeness**
    - **Validates: Requirements 3.1, 6.4**
    - Create `src/components/Bookshelf/__tests__/BookDetailCard.property.test.js`

  - [ ]* 4.6 Write unit tests for BookDetailCard
    - Test renders all fields for a given book
    - Test closes on Escape key
    - Test closes on outside click
    - Test Add to Cart dispatches correct action
    - Create `src/components/Bookshelf/__tests__/BookDetailCard.test.jsx`
    - _Requirements: 3.1, 3.3, 3.4_

- [x] 5. Implement Fallback Grid and Error Boundary
  - [x] 5.1 Create FallbackGrid component
    - Create `src/components/FallbackGrid/FallbackGrid.jsx`
    - Group books by category with visible category headings
    - Render cards in responsive Tailwind grid (`grid-cols-2 sm:grid-cols-3`)
    - Each card shows cover image, title, author, price
    - Tapping a card calls `onBookSelect(book)`
    - _Requirements: 6.2, 6.3, 6.4_

  - [x] 5.2 Create LoadingSpinner component
    - Create `src/components/common/LoadingSpinner.jsx`
    - Centered spinner using the application's primary color
    - Used as Suspense fallback
    - _Requirements: 8.2, 8.3_

  - [x] 5.3 Create BookshelfErrorBoundary component
    - Create `src/components/Bookshelf/BookshelfErrorBoundary.jsx`
    - Catches errors from BookshelfScene and renders FallbackGrid as recovery
    - Logs error to console
    - _Requirements: 8.5_

  - [ ]* 5.4 Write unit tests for FallbackGrid
    - Test renders category headings for books in multiple categories
    - Test renders correct number of book cards
    - Test tapping a card triggers onBookSelect
    - Create `src/components/FallbackGrid/__tests__/FallbackGrid.test.jsx`
    - _Requirements: 6.2, 6.3, 6.4_

- [x] 6. Checkpoint - Ensure all components render without errors
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Wire pages and routing together
  - [x] 7.1 Update BooksPage to use bookshelf components
    - Modify `src/pages/Books/` (or create `src/pages/Books/BooksPage.jsx`)
    - Use `useViewport` to decide between 3D scene and fallback grid
    - Use `useBookshelf` for data and selection state
    - Wrap `BookshelfScene` in `<BookshelfErrorBoundary>` and `<Suspense fallback={<LoadingSpinner />}>`
    - Lazy-load `BookshelfScene` via `React.lazy`
    - Render `BookDetailCard` when a book is selected
    - _Requirements: 2.1, 2.2, 2.3, 6.1, 6.5, 8.1, 8.2_

  - [x] 7.2 Update LandingPage to include static bookshelf
    - Modify `src/pages/Landing/` to render `BookshelfScene` with `interactive={false}` in the hero section
    - Wrap in Suspense with LoadingSpinner fallback
    - Add redirect to books page if user is already authenticated
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.4_

  - [x] 7.3 Ensure routing connects authenticated users to the interactive bookshelf
    - Verify route configuration in `src/routes/` sends authenticated users to the books page
    - Verify landing page redirects authenticated users
    - _Requirements: 2.3, 2.4_

  - [ ]* 7.4 Write integration tests for page rendering
    - Test: authenticated desktop user sees BookshelfScene on /books
    - Test: mobile viewport sees FallbackGrid on /books
    - Test: mock data loads into Redux on initialization
    - Test: book selection flow triggers BookDetailCard
    - Create `src/pages/Books/__tests__/BooksPage.test.jsx`
    - _Requirements: 2.1, 2.3, 6.1, 7.5_

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The project uses Vite + React (JSX), Redux Toolkit, React Router, and Tailwind CSS
- Three.js dependencies (@react-three/fiber, @react-three/drei, three) are new additions
- Testing uses Vitest with fast-check for property-based tests

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["1.4", "1.5", "2.1", "2.2", "2.3"] },
    { "id": 3, "tasks": ["2.4", "2.5"] },
    { "id": 4, "tasks": ["4.1", "5.1", "5.2"] },
    { "id": 5, "tasks": ["4.2", "4.4", "5.3"] },
    { "id": 6, "tasks": ["4.3", "4.5", "4.6", "5.4"] },
    { "id": 7, "tasks": ["7.1", "7.2"] },
    { "id": 8, "tasks": ["7.3", "7.4"] }
  ]
}
```
