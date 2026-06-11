# 3D Book-Turning Authentication Interface - Design

## High-Level Architecture

### Component Hierarchy
```
Auth3DBook (Container)
├── LoginBookFlow (Conditional - route: /login)
│   ├── EmailValidationPage
│   ├── PageTurnAnimation (Overlay)
│   └── PasswordEntryPage
│
└── SignupBookFlow (Conditional - route: /register)
    ├── RoleSelectionPage
    ├── SignupFormPages
    │   ├── PersonalInfoPage (Page 2)
    │   ├── EmailPage (Page 3)
    │   ├── PasswordSecurityPage (Page 4)
    │   ├── ReviewPage (Page 5)
    │   └── SuccessPage (Page 6)
    └── PageTurnAnimation (Overlay)
```

### Data Flow
```
User Input → Form Validation → State Update → API Call → Response Handling → Navigation
```

### Component Interaction
```
Auth3DBook (manages current flow, page state)
  ↓
Flow Component (LoginBookFlow or SignupBookFlow)
  ↓
Page Component (renders current page content)
  ↓
User Interaction → Handler Function → State Update → Re-render
```

---

## Low-Level Design

### 1. Auth3DBook Container Component

**File:** `src/components/Auth3DBook/Auth3DBook.jsx`
**Responsibility:** Route between login and signup flows

**State:**
```javascript
const [currentFlow, setCurrentFlow] = useState('login'); // 'login' | 'signup'
```

**Props:** None (controlled by React Router)

**Exports:**
- Default export: Auth3DBook component

**Internal Components:**
- LoginBookFlow (rendered when currentFlow === 'login')
- SignupBookFlow (rendered when currentFlow === 'signup')

**Styling:** 
- Minimal container styles
- Full viewport height/width
- Centered flex container
- Background: COLORS.background

---

### 2. LoginBookFlow Component

**File:** `src/components/Auth3DBook/LoginBookFlow.jsx`
**Responsibility:** Manage login page flow and state

**State:**
```javascript
const [page, setPage] = useState('email'); // 'email' | 'animating' | 'password'
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [errors, setErrors] = useState({});
const [isLoading, setIsLoading] = useState(false);
```

**Functions:**
- `validateEmail(email)` → boolean
- `handleEmailNext()` → triggers animation, sets page to 'animating'
- `handlePasswordSubmit()` → submits to API
- `handleAnimationComplete()` → sets page to 'password'

**Render Logic:**
```
if (page === 'email') render EmailValidationPage
if (page === 'animating') render PageTurnAnimation
if (page === 'password') render PasswordEntryPage
```

**Styling:**
- Container: `Auth3DBook.module.css` → `.loginContainer`
- Book positioning: centered, landscape aspect ratio

---

### 3. EmailValidationPage Component

**File:** `src/components/Auth3DBook/pages/EmailValidationPage.jsx`
**Responsibility:** Display email input and validation

**Props:**
```javascript
{
  email: string,
  onEmailChange: (value: string) => void,
  onNext: () => void,
  error: string | undefined,
  isLoading: boolean
}
```

**Visual Layout:**
```
┌─────────────────────────┐
│   Welcome Back          │
│                         │
│   ┌─────────────────┐   │
│   │ email@addr.com  │   │
│   └─────────────────┘   │
│                         │
│   ┌─────────────┐       │
│   │    Next →   │       │
│   └─────────────┘       │
└─────────────────────────┘
```

**Styling:**
- Use Auth3DBook.module.css → `.bookPage`, `.emailPage`
- Input styling from COLORS
- Button styling: gradient primary color
- Error text: COLORS.error
- Responsive: padding scales on mobile

**Interaction:**
- Input: `type="email"`, onChange handler
- Button: onClick → parent's handleEmailNext()
- Validation feedback: real-time as user types

---

### 4. PasswordEntryPage Component

**File:** `src/components/Auth3DBook/pages/PasswordEntryPage.jsx`
**Responsibility:** Display password input and login action

**Props:**
```javascript
{
  password: string,
  onPasswordChange: (value: string) => void,
  onSubmit: () => void,
  error: string | undefined,
  isLoading: boolean
}
```

**Visual Layout:**
```
┌─────────────────────────┐
│  Enter Your Password    │
│                         │
│   ┌─────────────────┐   │
│   │ ••••••••        │   │
│   └─────────────────┘   │
│                         │
│  [Forgot Password?]     │
│                         │
│  ┌──────────────────┐   │
│  │   Sign In        │   │
│  └──────────────────┘   │
└─────────────────────────┘
```

**Styling:**
- Auth3DBook.module.css → `.bookPage`, `.passwordPage`
- Input: password type, masked text
- Forgot Password: subtle link in secondary color
- Button: gradient primary, full width
- Error display: inline below input

**Interaction:**
- Input: type="password", onChange handler
- Submit: onClick → parent's handlePasswordSubmit()
- Forgot Password: navigates to password reset (future feature)

---

### 5. PageTurnAnimation Component

**File:** `src/components/Auth3DBook/animations/PageTurnAnimation.jsx`
**Responsibility:** Render book page-turn animation and trigger callback on complete

**Props:**
```javascript
{
  onComplete: () => void,
  pageCount: number, // 5-10 pages for login, 3-5 for signup
  duration: number   // in ms, max 1300ms
}
```

**Animation Approach:**
- CSS 3D transforms with `rotateY` rotation
- Individual page flips using keyframes
- Duration distributed across pages: `totalDuration / pageCount`
- Final callback after animation completes

**Timing:**
```javascript
// Example: 8 pages in 1.2 seconds
const durationPerPage = 1200 / 8 = 150ms per page
// Use CSS keyframe animation with steps
```

**CSS Implementation:**
```css
@keyframes bookPageTurn {
  0% { transform: perspective(1000px) rotateY(0deg); }
  50% { transform: perspective(1000px) rotateY(90deg); }
  100% { transform: perspective(1000px) rotateY(0deg); }
}

.pageFlip {
  animation: bookPageTurn {duration}ms steps(8) forwards;
}
```

**Styling:**
- Auth3DBook.module.css → `.pageAnimation`, `.bookFlip`
- Full viewport overlay
- Z-index: above all other content
- Centered book element
- Non-interactive (no clicks)

---

### 6. SignupBookFlow Component

**File:** `src/components/Auth3DBook/SignupBookFlow.jsx`
**Responsibility:** Manage signup multi-page form flow and state

**State:**
```javascript
const [currentPage, setCurrentPage] = useState(2); // 2-6
const [isAnimating, setIsAnimating] = useState(false);
const [formData, setFormData] = useState({
  first_name: '',
  last_name: '',
  email: '',
  confirm_email: '',
  password: '',
  confirm_password: '',
  phone: '',
  role: null,
  acceptTerms: false
});
const [errors, setErrors] = useState({});
const [isLoading, setIsLoading] = useState(false);
const [selectedRole, setSelectedRole] = useState(null);
```

**Functions:**
- `handleRoleSelect(role)` → set role, advance to page 2
- `handlePageChange(direction)` → validate current page, advance/retreat
- `validatePage(pageNum)` → returns boolean
- `handleSubmit()` → submit to API
- `handleAnimationComplete()` → show success page (6)
- `goToLogin()` → navigate to login page

**Page Routing Logic:**
```
page === 1: RoleSelectionPage
page === 2: PersonalInfoPage
page === 3: EmailPage
page === 4: PasswordSecurityPage
page === 5: ReviewPage
page === 6: SuccessPage
```

**Styling:**
- Portrait orientation book layout
- Centered in viewport
- Similar to LoginBookFlow but vertical aspect ratio

---

### 7. Signup Page Components (Pages 1-6)

#### **Page 1: RoleSelectionPage**
**File:** `src/components/Auth3DBook/pages/signup/RoleSelectionPage.jsx`

**Props:**
```javascript
{
  onRoleSelect: (role: 'CUSTOMER' | 'AUTHOR') => void,
  onBackToLogin: () => void
}
```

**Visual:**
```
┌────────────────────────────┐
│  Join Our Community        │
│  Choose how to get started │
│                            │
│  ┌──────────────────────┐  │
│  │ 👤 Browse & Buy      │  │
│  │    Discover books    │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │ ✍️  Publish Your     │  │
│  │    Share stories     │  │
│  └──────────────────────┘  │
│                            │
│  [Back to Login]           │
└────────────────────────────┘
```

**Styling:**
- Two card buttons with hover effects
- Cards: COLORS.surface background, COLORS.border border
- Hover: COLORS.surfaceLight background, shadow
- Icons: Lucide React (Users, PenTool)
- Back link: subtle secondary text color

**Interaction:**
- Card click: trigger onRoleSelect with role value
- Back link: trigger onBackToLogin

---

#### **Page 2: PersonalInfoPage**
**File:** `src/components/Auth3DBook/pages/signup/PersonalInfoPage.jsx`

**Props:**
```javascript
{
  firstName: string,
  lastName: string,
  onFirstNameChange: (value: string) => void,
  onLastNameChange: (value: string) => void,
  onNext: () => void,
  errors: object,
  pageIndicator: "Page 2 of 5"
}
```

**Visual:**
```
┌──────────────────────┐
│ Page 2 of 5          │
│                      │
│ Personal Information │
│                      │
│ ┌──────────────────┐ │
│ │ First Name       │ │
│ │ [John        ]   │ │
│ └──────────────────┘ │
│                      │
│ ┌──────────────────┐ │
│ │ Last Name        │ │
│ │ [Doe         ]   │ │
│ └──────────────────┘ │
│                      │
│ [Previous] [Next]    │
└──────────────────────┘
```

**Styling:**
- Page indicator top: COLORS.text.secondary, small font
- Heading: COLORS.text.primary, bold
- Input styling: COLORS palette (border, background, text)
- Error states: red border + error text
- Navigation buttons: Previous disabled, Next enabled if valid

---

#### **Page 3: EmailPage**
**File:** `src/components/Auth3DBook/pages/signup/EmailPage.jsx`

**Props:**
```javascript
{
  email: string,
  confirmEmail: string,
  onEmailChange: (value: string) => void,
  onConfirmEmailChange: (value: string) => void,
  onNext: () => void,
  errors: object,
  pageIndicator: "Page 3 of 5"
}
```

**Layout:** Similar to PersonalInfoPage with 2 email inputs

**Validation:**
- Email format check
- Confirm email matches
- Both required

---

#### **Page 4: PasswordSecurityPage**
**File:** `src/components/Auth3DBook/pages/signup/PasswordSecurityPage.jsx`

**Props:**
```javascript
{
  password: string,
  confirmPassword: string,
  onPasswordChange: (value: string) => void,
  onConfirmPasswordChange: (value: string) => void,
  onNext: () => void,
  errors: object,
  pageIndicator: "Page 4 of 5"
}
```

**Visual:**
```
┌──────────────────────────┐
│ Page 4 of 5              │
│                          │
│ Password & Security      │
│                          │
│ Requirements:            │
│ • 8+ characters          │
│ • Uppercase letter       │
│ • Lowercase letter       │
│ • Number                 │
│                          │
│ ┌──────────────────────┐ │
│ │ Password             │ │
│ │ [••••••••]           │ │
│ │ Strength: Medium ▮▮▮ │ │
│ └──────────────────────┘ │
│                          │
│ ┌──────────────────────┐ │
│ │ Confirm Password     │ │
│ │ [••••••••]           │ │
│ └──────────────────────┘ │
│                          │
│ [Previous] [Next]        │
└──────────────────────────┘
```

**Styling:**
- Password strength indicator: color-coded (red/yellow/green)
- Requirements list: COLORS.text.secondary, checkmarks on valid
- Inputs: password type, masked text

---

#### **Page 5: ReviewPage**
**File:** `src/components/Auth3DBook/pages/signup/ReviewPage.jsx`

**Props:**
```javascript
{
  formData: object,
  role: string,
  acceptTerms: boolean,
  onAcceptTermsChange: (checked: boolean) => void,
  onSubmit: () => void,
  isLoading: boolean,
  pageIndicator: "Page 5 of 5"
}
```

**Visual:**
```
┌────────────────────────┐
│ Page 5 of 5            │
│                        │
│ Review Your Info       │
│                        │
│ First Name: John       │
│ Last Name: Doe         │
│ Email: john@example.com│
│ Role: Customer         │
│ Phone: +1 555-0000     │
│                        │
│ ┌────────────────────┐ │
│ │ ☑ I agree to Terms │ │
│ └────────────────────┘ │
│                        │
│ [Previous] [Create Acc]│
└────────────────────────┘
```

**Styling:**
- Read-only display of all form fields
- Checkbox: COLORS palette, accent color on check
- Submit button: disabled until terms checked

---

#### **Page 6: SuccessPage**
**File:** `src/components/Auth3DBook/pages/signup/SuccessPage.jsx`

**Props:**
```javascript
{
  onRedirectToLogin: () => void,
  autoRedirectCountdown: number // 3 seconds countdown
}
```

**Visual:**
```
┌────────────────────────┐
│                        │
│   ✓ Account Created!   │
│                        │
│   Welcome to BookStore │
│   Your account is      │
│   ready to use         │
│                        │
│   Redirecting in 3s... │
│                        │
│   [Go to Login Now]    │
│                        │
└────────────────────────┘
```

**Styling:**
- Success icon: Lucide CheckCircle, COLORS.success color
- Countdown timer: COLORS.text.secondary
- Manual redirect button: primary gradient
- Auto-redirect after 3 seconds

---

### 8. Animation Architecture

#### **Page-Turn Animation Mechanism**

**File:** `src/components/Auth3DBook/animations/PageTurnAnimation.jsx`

**CSS Module:** `Auth3DBook.module.css`

**Approach:**
1. Create CSS keyframe animation with multiple steps
2. Each step represents a page turn
3. Use `steps()` timing function for discrete page transitions
4. Final step holds the end position
5. JavaScript callback fires after animation completes

**Example Implementation:**
```css
@keyframes pageTurn8Steps {
  0%   { transform: perspective(1200px) rotateY(0deg); }
  12.5%  { transform: perspective(1200px) rotateY(90deg); }
  25%  { transform: perspective(1200px) rotateY(0deg); }
  37.5%  { transform: perspective(1200px) rotateY(90deg); }
  50%  { transform: perspective(1200px) rotateY(0deg); }
  62.5%  { transform: perspective(1200px) rotateY(90deg); }
  75%  { transform: perspective(1200px) rotateY(0deg); }
  87.5%  { transform: perspective(1200px) rotateY(90deg); }
  100% { transform: perspective(1200px) rotateY(0deg); }
}

.bookFlip8 {
  animation: pageTurn8Steps 1.2s ease-in-out forwards;
}
```

**Duration Calculation:**
```javascript
const pageCount = 8;
const totalDuration = 1200; // 1.2 seconds max
const durationPerStep = totalDuration / pageCount;
```

**Callback Implementation:**
```javascript
useEffect(() => {
  const timer = setTimeout(() => {
    onComplete();
  }, totalDuration);
  return () => clearTimeout(timer);
}, [totalDuration, onComplete]);
```

---

### 9. Styling Architecture

**File Structure:**
```
src/components/Auth3DBook/
├── Auth3DBook.jsx
├── Auth3DBook.module.css      (Main styles)
├── LoginBookFlow.jsx
├── SignupBookFlow.jsx
├── pages/
│   ├── EmailValidationPage.jsx
│   ├── PasswordEntryPage.jsx
│   ├── signup/
│   │   ├── RoleSelectionPage.jsx
│   │   ├── PersonalInfoPage.jsx
│   │   ├── EmailPage.jsx
│   │   ├── PasswordSecurityPage.jsx
│   │   ├── ReviewPage.jsx
│   │   └── SuccessPage.jsx
└── animations/
    └── PageTurnAnimation.jsx
```

**CSS Module Organization:** `Auth3DBook.module.css`

```css
/* Container Layout */
.auth3DBookContainer { }
.bookViewport { }

/* Login Flow */
.loginContainer { }
.loginBook { }
.bookPage { }
.emailPage { }
.passwordPage { }

/* Signup Flow */
.signupContainer { }
.signupBook { }
.roleSelectionPage { }
.formPage { }

/* Shared Styles */
.bookFlip { }
.bookFlipNSteps { } /* Generated: bookFlip8, bookFlip5, etc. */
.pageIndicator { }
.pageNumber { }

/* Form Elements */
.formInput { }
.formLabel { }
.formError { }
.formButton { }

/* Navigation */
.navButtonGroup { }
.previousButton { }
.nextButton { }

/* Responsive */
@media (max-width: 768px) { }
@media (max-width: 480px) { }
```

**Color Assignments:**
```javascript
// In each component's style prop:
backgroundColor: COLORS.background         // Containers
backgroundColor: COLORS.surface            // Book pages
backgroundColor: COLORS.surfaceLight       // Hover states
borderColor: COLORS.border                 // Input borders
color: COLORS.text.primary                 // Headings, main text
color: COLORS.text.secondary               // Secondary text, labels
color: COLORS.error                        // Error messages
background: COLORS.gradient.primary        // Buttons
```

---

### 10. Responsive Design

#### **Breakpoints:**
```css
Desktop: >= 1024px (default)
Tablet: 768px - 1023px
Mobile: < 768px
Small Mobile: < 480px
```

#### **Book Sizing:**
```css
Desktop:   width: 500px,  height: auto (16:9 for login, 9:16 for signup)
Tablet:    width: 400px,  height: auto
Mobile:    width: 90vw,   max-width: 320px, height: auto (scale down)
```

#### **Responsive Strategies:**
- Use `scale()` transform for smaller viewports
- Adjust padding: 32px desktop → 24px tablet → 16px mobile
- Font sizes: scale down on small screens
- Input heights: min 44px (touch target)
- Buttons: full width on mobile, constrained on desktop

#### **Media Query Example:**
```css
@media (max-width: 768px) {
  .loginBook {
    width: 90vw;
    max-width: 320px;
    padding: 20px;
    transform: scale(0.95);
  }
  
  .bookPage {
    padding: 16px;
  }
  
  .formInput {
    font-size: 16px; /* Prevent zoom on iOS */
  }
}
```

---

### 11. Accessibility Design

#### **Semantic HTML:**
```html
<form> elements for forms
<label> elements for inputs (id + htmlFor)
<button> elements for actions (type attribute)
<section> elements for page sections
```

#### **ARIA Attributes:**
```html
<!-- Page indicator -->
<div aria-live="polite" aria-label="Page 2 of 5">
  Page 2 of 5
</div>

<!-- Loading state -->
<button aria-busy={isLoading} aria-label="Sign in (Loading)">
  {isLoading ? 'Signing in...' : 'Sign In'}
</button>

<!-- Error messages -->
<div role="alert" aria-live="assertive">
  {error}
</div>

<!-- Form labels -->
<label htmlFor="email">Email address</label>
<input id="email" />
```

#### **Keyboard Navigation:**
- Tab order follows visual left-to-right, top-to-bottom
- Enter key submits forms
- Escape key cancels actions (future)
- Focus visible on all interactive elements
- Focus trap within modal (when applicable)

#### **Color Contrast:**
- All text vs background: minimum 4.5:1 ratio (WCAG AA)
- Use COLORS palette which meets standards
- Error states: red + icon + text (not color alone)

#### **Reduced Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  .bookFlip {
    animation: none;
    /* Show end state immediately */
    transform: perspective(1200px) rotateY(0deg);
  }
  
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

### 12. State Management Diagram

#### **Login Flow State:**
```
Auth3DBook.jsx
├── currentFlow: 'login'
│
LoginBookFlow.jsx
├── page: 'email' | 'animating' | 'password'
├── email: string
├── password: string
├── errors: { email?, password?, submit? }
└── isLoading: boolean

→ EmailValidationPage (renders page-specific UI)
→ PageTurnAnimation (renders full overlay, triggers callback)
→ PasswordEntryPage (renders password UI)
```

#### **Signup Flow State:**
```
Auth3DBook.jsx
├── currentFlow: 'signup'
│
SignupBookFlow.jsx
├── currentPage: 1 | 2 | 3 | 4 | 5 | 6
├── isAnimating: boolean
├── selectedRole: 'CUSTOMER' | 'AUTHOR'
├── formData: {
│   ├── first_name: string
│   ├── last_name: string
│   ├── email: string
│   ├── confirm_email: string
│   ├── password: string
│   ├── confirm_password: string
│   ├── phone: string
│   ├── acceptTerms: boolean
│   └── role: string (from selectedRole)
├── errors: { [fieldName]: string }
└── isLoading: boolean

→ Page Components (RoleSelection, PersonalInfo, Email, Password, Review, Success)
→ PageTurnAnimation (only on transition to success page)
```

---

### 13. Error Handling Flow

**Validation Layer:**
```
User Input → Real-time Validation
  ↓
Valid? → YES → Enable Submit Button
      → NO  → Show Error, Disable Submit Button
```

**API Error Handling:**
```
Submit → API Call (with loading state)
  ↓
Response
  ├── Success (200/201) → Store data → Navigate
  ├── Validation Error (400) → Display error → Allow retry
  ├── Auth Error (401) → Redirect to login
  ├── Server Error (5xx) → Generic error message
  └── Network Error → Retry prompt
```

**Error Display Strategy:**
- Inline errors below each field
- Color: COLORS.error (red)
- Text: Specific, actionable message from backend
- Icon: Optional warning icon (Lucide AlertCircle)
- Persist: Until field is corrected

---

### 14. Performance Considerations

#### **Optimization Strategies:**
1. **Code Splitting:** Lazy load signup form pages
2. **Memoization:** Memoize page components to prevent unnecessary re-renders
3. **Animation Performance:** Use GPU-accelerated transforms (transform, perspective)
4. **Avoid Layout Thrashing:** Batch DOM updates
5. **Bundle Size:** Keep component files small, modular

#### **Animation Performance:**
- Use `transform` and `opacity` properties (GPU accelerated)
- Avoid animating `left`, `top`, `width`, `height` (layout properties)
- Use `will-change` CSS property for animation targets (sparingly)
- Test 60 FPS on real devices

#### **Network Performance:**
- No pre-loading of animations
- Minimal inline styles (use CSS modules)
- Compress SVG icons
- Lazy load success page content

---

## Summary

This design provides:
- ✅ Clean component hierarchy with clear separation of concerns
- ✅ Isolated state management (no external dependencies)
- ✅ CSS 3D transforms for page-turn animations (1-1.3s total)
- ✅ Responsive design from 320px to 1920px+
- ✅ Accessibility standards (ARIA, keyboard nav, color contrast)
- ✅ Professional styling using COLORS palette
- ✅ Error handling and validation strategies
- ✅ Performance optimizations for smooth 60 FPS animations

**Next Phase:** Implement tasks based on this design spec.

