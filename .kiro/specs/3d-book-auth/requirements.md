# 3D Book-Turning Authentication Interface - Requirements

## Overview
Create a sophisticated 3D book-turning animation interface for user login and signup flows. The book metaphor will provide an engaging, thematic authentication experience that reinforces the bookstore brand while maintaining full functional parity with existing auth endpoints.

**Target Users:** All new and returning BookStore users requiring authentication
**Priority:** High - Central to user onboarding and brand experience
**Scope:** Frontend-only, isolated UI components; no backend modifications

---

## 1. Functional Requirements

### 1.1 Login Flow (3D Horizontal Book)
**Layout:** Landscape orientation book positioned at center of viewport

#### Phase 1: Email Validation Page
- **Visual:** First page of open book displays email input form
- **Content:**
  - Heading: "Welcome Back"
  - Email input field with validation
  - "Next" button to proceed
- **Interaction:** User enters email, clicks Next
- **Validation:** Email must be valid format before advancing
- **State:** Disable Next button until valid email entered
- **Behavior:** On valid email submission, trigger page-turn animation

#### Phase 2: Page-Turn Animation (5-10 rapid page turns)
- **Visual:** Book pages rapidly flip from email page toward password page
- **Duration:** 1-1.3 seconds total animation
- **Purpose:** Dramatic transition, suspenseful UX before password entry
- **No Input:** User cannot interact during animation
- **Seamless Transition:** Animation completes and lands on password page

#### Phase 3: Password Entry Page
- **Visual:** Next book page displays password input form
- **Content:**
  - Heading: "Enter Your Password"
  - Password input field
  - "Sign In" button
  - "Forgot Password?" link
- **Interaction:** User enters password, clicks Sign In
- **API Integration:** Submit to existing `/user/login/` endpoint
- **Response Handling:** 
  - Success: Store user data, redirect based on role (ADMIN → /admin, AUTHOR → /profile, else → /books)
  - Error: Display error message on current page, allow retry
- **State:** Disable Sign In button while request pending

### 1.2 Signup Flow (3D Vertical Book)
**Layout:** Portrait orientation book positioned at center of viewport

#### Phase 1: Role Selection Page
- **Visual:** First page of portrait book displays role selector
- **Content:**
  - Heading: "Join Our Community"
  - Two role option cards:
    - Customer: "Browse & Buy Books" (with Lucide icon)
    - Author: "Publish Your Books" (with Lucide icon)
  - "Back to Login" link (navigates to login page)
- **Interaction:** User clicks on role card to select
- **State:** Highlight selected role
- **Behavior:** Selection auto-advances to Form Page 1

#### Phase 2: Form Pages (Multi-page signup form, pages increment)
**Page Layout Strategy:** Each form section on its own numbered book page
- Users navigate forward/backward through form pages
- Each page has clear page indicators (e.g., "Page 2 of 5")
- Form data persists as user pages through
- Back/Previous button allows returning to previous pages

**Signup Form Pages (Proposed Structure):**

**Page 2: Personal Information**
- Fields: First Name, Last Name
- Page indicator: "Page 2 of 5"
- Navigation: Previous (disabled), Next

**Page 3: Email Address**
- Fields: Email, Confirm Email
- Email validation
- Page indicator: "Page 3 of 5"
- Navigation: Previous, Next

**Page 4: Password & Security**
- Fields: Password, Confirm Password
- Password strength indicator
- Requirements display: "8+ chars, uppercase, lowercase, numbers"
- Page indicator: "Page 4 of 5"
- Navigation: Previous, Next

**Page 5: Review & Confirm**
- Display summary of entered information (read-only)
- Checkbox: Agree to Terms & Conditions
- Page indicator: "Page 5 of 5"
- Navigation: Previous, Submit
- Page-turn animation on Submit (2-3 seconds, 3-5 page turns)
- After animation: Show success confirmation page

**Page 6: Success Confirmation**
- Heading: "Account Created!"
- Message: "Redirecting to login..."
- Auto-redirect to login page after 3 seconds
- Or manual "Go to Login" button

#### Phase 3: Page Navigation
- **Previous Button:** On pages 3+ (not on page 2)
- **Next/Submit Button:** Advances to next page with validation
- **Validation:**
  - Each page validates its fields before allowing advance
  - Display inline error messages for invalid fields
  - Do not proceed to next page if validation fails
- **Form State:** Retain form data as user navigates pages
- **Cancellation:** Users can return to login page from page 2

---

## 2. Non-Functional Requirements

### 2.1 Architecture & Code Quality
- **Component Isolation:** Create isolated `Auth3DBook` component with sub-components for Login and Signup
- **No Backend Changes:** 
  - ✅ Existing API endpoints must work unchanged (`/user/login/`, `/user/signup/`)
  - ✅ Existing auth handlers must be preserved
  - ✅ No modifications to auth state management
- **Code Style:** Professional, clean, maintainable code (10-year developer standard)
- **No External 3D Libraries:** Do NOT use Three.js, Babylon.js, or similar 3D engines
  - ✅ Use CSS 3D transforms for book animations
  - ✅ Use Framer Motion or CSS keyframes for smooth transitions
- **Performance:** Animations must be smooth at 60 FPS on modern devices
- **Bundle Size:** Minimal dependency additions

### 2.2 Styling & Visual Design
- **Color Palette:** Use COLORS constant exclusively
  - Background: `#0f0f0f`
  - Surface: `#1a1a1a`
  - Primary: `#5c5c8f` (deep indigo)
  - Secondary: `#d4933e` (warm gold)
  - Accent: `#d48080` (copper rose)
  - Gradients: Use defined gradient values
- **Typography:** Consistent with existing pages (Tailwind default or custom font)
- **Spacing:** Maintain consistent padding, margins across components
- **Icons:** Use Lucide React only (no emojis)
- **Module CSS:** Use `.module.css` files for scoped styling (NO plain CSS files)
- **Inline Styles:** Use inline styles for dynamic color values from COLORS

### 2.3 Responsiveness
- **Breakpoints:** Full responsiveness from mobile (320px) to desktop (1920px+)
- **Mobile:** 
  - Book scales down appropriately
  - Touch-friendly interactive elements (min 44px tap targets)
  - Form inputs remain usable on small screens
  - May stack vertically on very small screens if needed
- **Tablet:** Medium scaling, optimized for landscape and portrait
- **Desktop:** Full-size experience with optimal spacing
- **Media Queries:** Use CSS media queries with scale transforms

### 2.4 Animation & Performance
- **Animation Libraries:** 
  - Recommended: Framer Motion (already familiar from project context) or vanilla CSS transitions
  - Alternative: React Spring if lightweight
  - Avoid heavy libraries
- **Page-Turn Effect:**
  - CSS 3D transform perspective-based flip
  - Smooth duration: 300-500ms per page turn
  - Easing: Smooth ease-in-out function
- **No Jank:** GPU-accelerated transforms (use `transform` and `perspective` properties)
- **Prefers Reduced Motion:** Respect user's OS animation preferences

---

## 3. API Integration Requirements

### 3.1 Login Endpoint: POST `/user/login/`
**Existing Implementation Reference:**
```javascript
// From current LoginPage.jsx
{
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
}

// Response Structure:
{
  "status": "success" | "failed",
  "details": "message",
  "data": {
    "id": "uuid",
    "email": "email@example.com",
    "role": "CUSTOMER" | "AUTHOR" | "ADMIN",
    "full_name": "First Last"
  },
  "status_code": 200 | 400
}
```

**Requirements:**
- ✅ Use exact same endpoint and payload format
- ✅ Handle all response scenarios (success, validation errors, server errors)
- ✅ Store user data in localStorage with same structure as LoginPage
- ✅ Navigate based on user role (existing role-based redirect logic)

### 3.2 Signup Endpoint: POST `/user/signup/`
**Existing Implementation Reference:**
```javascript
// From current RegisterPage.jsx
{
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    first_name,
    last_name,
    email,
    password,
    phone,
    role: "CUSTOMER" | "AUTHOR"
  })
}

// Response Structure:
{
  "status": "success" | "failed",
  "details": "message",
  "data": {
    "id": "uuid",
    "email": "email@example.com",
    "role": "CUSTOMER" | "AUTHOR",
    "full_name": "First Last"
  },
  "status_code": 201 | 400
}
```

**Requirements:**
- ✅ Use exact same endpoint and payload format
- ✅ Pass all form fields in exact format backend expects
- ✅ Handle validation errors from backend gracefully
- ✅ On success: Show confirmation, then redirect to login page
- ✅ On error: Display error message on current form page, allow correction and retry

### 3.3 Error Handling
- **Network Errors:** Display user-friendly message "Connection error. Please try again."
- **Validation Errors:** Display backend error message from `data.details`
- **Server Errors (5xx):** Display "Server error. Please try again later."
- **Invalid Credentials (4xx):** Display "Invalid email or password. Please try again."
- **User Already Exists:** Display backend error message
- **Retry Logic:** Allow user to correct and resubmit without full page reload

---

## 4. User Experience Requirements

### 4.1 Form Validation
- **Real-time Validation:** Validate fields as user types (not just on submit)
- **Inline Error Messages:** Show error below field immediately
- **Visual Feedback:**
  - Invalid field: Red border + error text
  - Valid field: Green checkmark or subtle border change
  - Disabled state: Submit button disabled until form valid
- **Password Strength:** Show strength indicator on signup password field

### 4.2 Accessibility
- **Semantic HTML:** Use proper form elements (input, label, button)
- **ARIA Labels:** Add aria-labels for screen readers
- **Focus Management:** Clear focus indicators, proper tab order
- **Keyboard Navigation:** Full keyboard support (tab, enter, escape)
- **Color Contrast:** All text meets WCAG AA standards (use COLORS palette)
- **Reduced Motion:** Respect `prefers-reduced-motion` for animations

### 4.3 Mobile Experience
- **Portrait First:** Mobile should work well in portrait orientation
- **Touch Friendly:** Large touch targets (44px minimum)
- **Keyboard Handling:** Virtual keyboard doesn't cover input fields
- **Responsive Typography:** Font sizes scale for readability
- **Form Submission:** Clear feedback while processing

### 4.4 Loading States
- **Email Validation:** Button shows loading state while checking (if backend-based)
- **Form Submission:** Sign In / Submit button shows "Signing in..." or "Creating account..."
- **Disable Input:** All form inputs disabled during submission to prevent duplicate submissions
- **Error Retry:** After error, maintain user input and allow quick retry

---

## 5. State Management Requirements

### 5.1 Form State
- **Persist Across Pages:**
  - Login: Email and password fields persist through page turns
  - Signup: All form data persists as user pages through signup form
  - No data loss when navigating between pages
- **State Scope:** Keep all state within Auth3DBook component (local state via useState)
- **Validation State:** Track which fields have errors
- **Loading State:** Track submission state for button disable/loading UI

### 5.2 Navigation State
- **Current Page:** Track which page user is on (for page indicators)
- **Page History:** Support back/previous navigation with full state restoration
- **Prevent Accidental Navigation:** Warn user if they try to leave with unsaved data

### 5.3 Auth State Integration
- **Preserve Existing Logic:** Do NOT modify existing auth context/hooks
- **Direct Wire:** Final submit buttons wire directly to existing auth handlers
- **localStorage:** Use same localStorage format as current LoginPage
- **Session Handling:** Reuse existing session management from backend

---

## 6. Browser & Device Support

### 6.1 Browsers
- ✅ Chrome/Chromium (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Safari (latest 2 versions)
- ✅ Edge (latest 2 versions)

### 6.2 Devices
- ✅ iOS (Safari, Chrome)
- ✅ Android (Chrome, Firefox)
- ✅ macOS (Chrome, Safari, Firefox, Edge)
- ✅ Windows (Chrome, Firefox, Edge)

### 6.3 CSS 3D Support
- ✅ Requires CSS 3D Transforms support (available in all modern browsers)
- ✅ Fallback: For older browsers, render form without 3D effect (graceful degradation)

---

## 7. Acceptance Criteria

### Login Page
- [ ] Email validation page renders with input field and Next button
- [ ] Email field validates format before allowing next
- [ ] Invalid email shows error message, prevents progression
- [ ] Next button triggers page-turn animation (5-10 pages, 1-1.3 seconds)
- [ ] After animation completes, password page renders
- [ ] Password page has input field and Sign In button
- [ ] Sign In button submits to `/user/login/` endpoint
- [ ] On success: User data stored, redirect by role
- [ ] On error: Error message displays, allows retry
- [ ] Form remains functional after animation
- [ ] Mobile responsive, works on small screens
- [ ] Animations smooth (60 FPS on modern devices)
- [ ] Keyboard navigation works (tab, enter)

### Signup Page
- [ ] Role selection page renders with Customer and Author options
- [ ] Clicking role advances to Page 2 (Personal Info)
- [ ] Page 2: First/Last name fields with validation
- [ ] Page 3: Email fields with validation
- [ ] Page 4: Password fields with strength indicator
- [ ] Page 5: Review page with all entered data
- [ ] Terms checkbox must be checked to submit
- [ ] Previous button works on pages 3+, disabled on page 2
- [ ] Submit button triggers page-turn animation (3-5 pages, 1-1.3 seconds)
- [ ] After animation: Success confirmation page with auto-redirect
- [ ] Form data persists when navigating between pages
- [ ] All fields validated before allowing progression
- [ ] Validation errors display inline with clear messaging
- [ ] Back to Login link works from any page
- [ ] Submit uses `/user/signup/` endpoint with correct payload
- [ ] On error: Error message displays, allows correction/retry
- [ ] Mobile responsive with touch-friendly inputs
- [ ] Keyboard navigation works throughout flow
- [ ] Animations smooth on all devices

### General
- [ ] No backend API changes required
- [ ] No auth state management modifications
- [ ] Uses COLORS palette throughout
- [ ] No emojis (Lucide icons only)
- [ ] Module CSS files for scoped styles
- [ ] Professional, clean code quality
- [ ] No CSS 3D library dependencies (vanilla or Framer Motion)
- [ ] Accessibility standards met (ARIA, color contrast, keyboard nav)

---

## 8. Dependencies & Constraints

### 8.1 Allowed Dependencies
- ✅ React (already available)
- ✅ React Router (already available)
- ✅ Lucide React (already available)
- ✅ Framer Motion (consider if not already available - lightweight)
- ✅ Tailwind CSS (already available for layout)

### 8.2 NOT Allowed
- ❌ Three.js / 3D graphics library
- ❌ Babylon.js
- ❌ Other complex 3D engines
- ❌ Backend modifications
- ❌ Changes to existing auth endpoints
- ❌ Modifications to existing auth state management

### 8.3 Constraints
- **Frontend Only:** All logic and state must be frontend-only
- **Backward Compatible:** Existing auth flow must continue to work
- **API Contract:** Must match existing endpoint signatures exactly
- **Token/Storage:** Follow existing localStorage patterns
- **Error Handling:** Must handle all existing backend error responses

---

## 9. Definition of Done

This feature is complete when:

1. ✅ All acceptance criteria pass
2. ✅ Code passes lint/type checks
3. ✅ No console errors or warnings in production build
4. ✅ Tested on multiple browsers and devices (mobile, tablet, desktop)
5. ✅ Performance: Animations run at 60 FPS, no jank
6. ✅ Accessibility: Keyboard navigation, screen reader compatible
7. ✅ Code reviewed: Meets professional standards
8. ✅ Pushed to `feature/3d-book-auth` branch
9. ✅ PR created for merge to `develop`
10. ✅ Existing tests still pass (no regression)

---

## 10. Next Steps

After requirements approval:
1. Create `design.md` with high-level and low-level design artifacts
2. Create `tasks.md` with implementation tasks
3. Begin component development following spec
4. Iterative testing and refinement
5. Final QA and browser testing

