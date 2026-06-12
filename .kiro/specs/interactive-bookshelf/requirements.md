# Requirements Document

## Introduction

The Interactive Bookshelf feature replaces the existing placeholder Books page and enhances the Landing page with a 3D vintage wooden bookshelf that displays books organized by category. Before login, the bookshelf renders as a static decorative element on the landing page. After login, the bookshelf becomes the primary interactive page where users can browse, inspect, and add books to their cart. On smaller screens, the experience gracefully degrades to a 2D grid layout for performance and usability.

## Glossary

- **Bookshelf_Scene**: The React Three Fiber 3D canvas component that renders the wooden bookshelf with book spine models arranged in shelf rows
- **Book_Spine**: A 3D mesh representing a single book on the shelf, rendered with a color, title text, and thickness proportional to page count
- **Book_Detail_Card**: A UI overlay that appears when a user interacts with a Book_Spine, displaying title, author, price, cover image, category, and an Add to Cart button
- **Shelf_Row**: A single horizontal shelf within the Bookshelf_Scene; each Shelf_Row corresponds to one book category
- **Mock_Data_Store**: A static JSON array of 20-30 book objects across 4-5 categories used as the data source until the Django API is integrated
- **Viewport_Detector**: A utility hook that determines the current viewport width and returns whether the device qualifies as a small screen (below 768px)
- **Fallback_Grid**: A 2D Tailwind CSS grid layout that displays book cards when the viewport is below the small-screen threshold or when WebGL is unavailable
- **Loading_Spinner**: A visual indicator displayed while the 3D Bookshelf_Scene assets are being loaded
- **Authenticated_User**: A user who has completed the login flow and possesses a valid JWT token in the Redux auth state

## Requirements

### Requirement 1: Static Bookshelf on Landing Page

**User Story:** As a visitor, I want to see a decorative 3D bookshelf on the landing page, so that I get a visual preview of the bookstore's character before signing in.

#### Acceptance Criteria

1. WHILE the user is not authenticated, THE Bookshelf_Scene SHALL render as a non-interactive background element within the Landing page hero section
2. WHILE the user is not authenticated, THE Bookshelf_Scene SHALL disable pointer events on all Book_Spine elements
3. WHILE the user is not authenticated, THE Bookshelf_Scene SHALL apply a reduced opacity overlay or depth-of-field blur to communicate non-interactivity
4. THE Bookshelf_Scene SHALL use the existing COLORS constants from the application theme for ambient lighting and background tones

### Requirement 2: Interactive Bookshelf After Login

**User Story:** As an authenticated user, I want the bookshelf to become interactive after I log in, so that I can browse and explore available books.

#### Acceptance Criteria

1. WHILE the user is an Authenticated_User, THE Bookshelf_Scene SHALL enable pointer events on all Book_Spine elements
2. WHILE the user is an Authenticated_User, THE Bookshelf_Scene SHALL render at full clarity without any non-interactivity overlay
3. WHEN an Authenticated_User navigates to the books route, THE application SHALL display the interactive Bookshelf_Scene as the primary page content
4. THE application SHALL redirect an Authenticated_User from the landing page to the interactive bookshelf page

### Requirement 3: Book Detail Card Display

**User Story:** As an authenticated user, I want to see book details when I interact with a book spine, so that I can decide whether to add the book to my cart.

#### Acceptance Criteria

1. WHEN an Authenticated_User clicks on a Book_Spine, THE Book_Detail_Card SHALL appear displaying: title, author, price, cover image, and category
2. WHEN an Authenticated_User hovers over a Book_Spine, THE Book_Spine SHALL visually highlight by scaling up or glowing to indicate interactivity
3. THE Book_Detail_Card SHALL include an "Add to Cart" button that dispatches a placeholder action to the cart Redux slice
4. WHEN the Authenticated_User clicks outside the Book_Detail_Card or presses Escape, THE Book_Detail_Card SHALL close
5. THE Book_Detail_Card SHALL position itself adjacent to the selected Book_Spine without overflowing the viewport boundaries

### Requirement 4: Category-Based Shelf Organization

**User Story:** As a user, I want books organized by category on separate shelf rows, so that I can visually scan for genres I am interested in.

#### Acceptance Criteria

1. THE Bookshelf_Scene SHALL render one Shelf_Row per book category present in the Mock_Data_Store
2. THE Bookshelf_Scene SHALL display a visible category label on each Shelf_Row
3. THE Bookshelf_Scene SHALL arrange Book_Spine elements within each Shelf_Row in a left-to-right sequence
4. WHEN the Mock_Data_Store contains books in N categories, THE Bookshelf_Scene SHALL render exactly N Shelf_Row elements

### Requirement 5: Vintage Aesthetic and 3D Rendering

**User Story:** As a user, I want the bookshelf to look like a warm vintage wooden bookshelf with colorful book spines, so that the browsing experience feels immersive and inviting.

#### Acceptance Criteria

1. THE Bookshelf_Scene SHALL render shelf surfaces with a wood-grain texture and warm brown coloring
2. THE Bookshelf_Scene SHALL render each Book_Spine with a distinct color sampled from a predefined palette of at least 12 colors
3. THE Bookshelf_Scene SHALL apply warm-toned ambient and directional lighting to simulate a cozy library atmosphere
4. THE Bookshelf_Scene SHALL use React Three Fiber with @react-three/drei for all 3D rendering
5. THE Bookshelf_Scene SHALL render Book_Spine elements with varying thickness to create a natural, non-uniform appearance

### Requirement 6: Responsive Fallback for Small Screens

**User Story:** As a mobile user, I want a usable book browsing experience even if my device cannot handle 3D rendering, so that I can still explore the catalog.

#### Acceptance Criteria

1. WHEN the Viewport_Detector reports a screen width below 768px, THE application SHALL render the Fallback_Grid instead of the Bookshelf_Scene
2. THE Fallback_Grid SHALL display book cards in a responsive 2D grid layout using Tailwind CSS
3. THE Fallback_Grid SHALL group books by category with visible category headings
4. WHEN a user taps a book card in the Fallback_Grid, THE Book_Detail_Card SHALL appear with the same information as in the 3D view
5. IF WebGL is not available in the browser, THEN THE application SHALL render the Fallback_Grid regardless of screen width

### Requirement 7: Mock Data Source

**User Story:** As a developer, I want a static mock data source with realistic book entries, so that the bookshelf can be developed and demonstrated without a backend dependency.

#### Acceptance Criteria

1. THE Mock_Data_Store SHALL contain between 20 and 30 book objects
2. THE Mock_Data_Store SHALL distribute books across 4 to 5 distinct categories
3. THE Mock_Data_Store SHALL provide the following fields for each book: id, title, author, price, coverImageUrl, category, and pageCount
4. THE Mock_Data_Store SHALL use placeholder cover image URLs that resolve to valid images
5. THE application SHALL load the Mock_Data_Store into the Redux books slice on initialization

### Requirement 8: Performance and Loading

**User Story:** As a user, I want the bookshelf to load efficiently without blocking the rest of the page, so that I do not experience a blank screen while assets load.

#### Acceptance Criteria

1. THE application SHALL lazy-load the Bookshelf_Scene component using React.lazy and Suspense
2. WHILE the Bookshelf_Scene is loading, THE application SHALL display the Loading_Spinner
3. THE Loading_Spinner SHALL be centered within the bookshelf container and use the application's primary color scheme
4. THE Bookshelf_Scene SHALL complete its initial render within 3 seconds on a standard broadband connection with an empty browser cache
5. IF the Bookshelf_Scene fails to load, THEN THE application SHALL display the Fallback_Grid as a recovery path
