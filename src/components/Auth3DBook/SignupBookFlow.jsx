import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleSelectionPage from './pages/signup/RoleSelectionPage';
import PersonalInfoPage from './pages/signup/PersonalInfoPage';
import EmailPage from './pages/signup/EmailPage';
import PasswordSecurityPage from './pages/signup/PasswordSecurityPage';
import ReviewPage from './pages/signup/ReviewPage';
import SuccessPage from './pages/signup/SuccessPage';
import PageTurnAnimation from './animations/PageTurnAnimation';
import styles from './Auth3DBook.module.css';

/**
 * SignupBookFlow — Two-phase smooth page rotation:
 *   Phase 1 (rotateOut): old content spins to 90° → invisible
 *   Swap: React swaps in new page content
 *   Phase 2 (rotateIn): new content spins from 90° → 0° → visible
 */
function SignupBookFlow({ toast }) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  // 'idle' | 'out' | 'in'
  const [phase, setPhase]         = useState('idle');
  const [direction, setDirection] = useState('forward');

  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '', last_name: '',
    email: '', confirm_email: '',
    password: '', confirm_password: '',
    phone: '', acceptTerms: false,
  });
  const [errors, setErrors]     = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Duration of each half-rotation (ms) — keep snappy
  const HALF_MS = 220;

  /**
   * Two-phase transition:
   *  1. rotate out  (HALF_MS)
   *  2. swap content
   *  3. rotate in   (HALF_MS)
   */
  const changePage = (dir, nextPage) => {
    setDirection(dir);
    setPhase('out');

    setTimeout(() => {
      setCurrentPage(nextPage);
      setPhase('in');

      setTimeout(() => {
        setPhase('idle');
      }, HALF_MS);
    }, HALF_MS);
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    changePage('forward', 2);
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateCurrentPage = () => {
    const e = {};
    switch (currentPage) {
      case 2:
        if (!formData.first_name.trim()) e.first_name = 'First name is required';
        if (!formData.last_name.trim())  e.last_name  = 'Last name is required';
        break;
      case 3:
        if (!formData.email.trim()) e.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Invalid email address';
        if (!formData.confirm_email.trim()) e.confirm_email = 'Please confirm your email';
        else if (formData.email !== formData.confirm_email) e.confirm_email = 'Emails do not match';
        break;
      case 4:
        if (!formData.password) e.password = 'Password is required';
        else if (formData.password.length < 8) e.password = 'At least 8 characters';
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
          e.password = 'Must have uppercase, lowercase and number';
        if (formData.password !== formData.confirm_password)
          e.confirm_password = 'Passwords do not match';
        break;
      case 5:
        if (!formData.acceptTerms) e.terms = 'You must accept the terms';
        break;
      default: break;
    }
    return e;
  };

  const handlePrevious = () => {
    if (currentPage > 1) { setErrors({}); changePage('back', currentPage - 1); }
  };

  const handleNext = () => {
    const errs = validateCurrentPage();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    changePage('forward', currentPage + 1);
  };

  const handleSubmit = async () => {
    const errs = validateCurrentPage();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    // Call the API immediately — only show SuccessPage on success
    setIsLoading(true);
    setErrors({});
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/signup/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.first_name, last_name: formData.last_name,
          email: formData.email, password: formData.password,
          phone: formData.phone, role: selectedRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.status?.message || 'Registration failed. Please check your details.';
        toast.error(msg);
        setIsLoading(false);
        // Reset all form state and go back to page 1 (role selection)
        setErrors({});
        setFormData({
          first_name: '', last_name: '',
          email: '', confirm_email: '',
          password: '', confirm_password: '',
          phone: '', acceptTerms: false,
        });
        setSelectedRole(null);
        changePage('back', 1);
        return;
      }
      // Success — now show the SuccessPage with animation
      setIsLoading(false);
      setIsAnimating(true);
      setTimeout(() => { setCurrentPage(6); setIsAnimating(false); }, 850);
    } catch {
      toast.error('Connection error. Please try again.');
      setIsLoading(false);
      setErrors({});
      setFormData({
        first_name: '', last_name: '',
        email: '', confirm_email: '',
        password: '', confirm_password: '',
        phone: '', acceptTerms: false,
      });
      setSelectedRole(null);
      changePage('back', 1);
    }
  };

  // submitSignup is now only used by SuccessPage's "Go to login" button
  const submitSignup = () => {
    navigate('/login');
  };

  // Page content map
  const pageContent = {
    1: <RoleSelectionPage onRoleSelect={handleRoleSelect} onBackToLogin={() => navigate('/login')} />,
    2: <PersonalInfoPage
          firstName={formData.first_name} lastName={formData.last_name}
          onFirstNameChange={(v) => updateFormData('first_name', v)}
          onLastNameChange={(v) => updateFormData('last_name', v)}
          onPrevious={handlePrevious} onNext={handleNext} errors={errors} />,
    3: <EmailPage
          email={formData.email} confirmEmail={formData.confirm_email}
          onEmailChange={(v) => updateFormData('email', v)}
          onConfirmEmailChange={(v) => updateFormData('confirm_email', v)}
          onPrevious={handlePrevious} onNext={handleNext} errors={errors} />,
    4: <PasswordSecurityPage
          password={formData.password} confirmPassword={formData.confirm_password}
          onPasswordChange={(v) => updateFormData('password', v)}
          onConfirmPasswordChange={(v) => updateFormData('confirm_password', v)}
          onPrevious={handlePrevious} onNext={handleNext} errors={errors} />,
    5: <ReviewPage
          formData={formData} role={selectedRole}
          acceptTerms={formData.acceptTerms}
          onAcceptTermsChange={(v) => updateFormData('acceptTerms', v)}
          onPrevious={handlePrevious} onSubmit={handleSubmit}
          isLoading={isLoading} errors={errors} />,    6: <SuccessPage onRedirectToLogin={submitSignup} isLoading={isLoading} />,
  };

  // CSS class for each phase
  const cardClass =
    phase === 'out' ? (direction === 'forward' ? styles.rotateOutForward : styles.rotateOutBack) :
    phase === 'in'  ? (direction === 'forward' ? styles.rotateInForward  : styles.rotateInBack)  :
    '';

  return (
    <div className={styles.signupContainer}>
      <div className={styles.signupBook}>
        <div className={cardClass} style={{ width: '100%' }}>
          {pageContent[currentPage] ?? null}
        </div>
      </div>

      {isAnimating && (
        <PageTurnAnimation
          onComplete={() => setIsAnimating(false)}
          pageCount={5} duration={800} isSignup={true}
        />
      )}
    </div>
  );
}

export default SignupBookFlow;
