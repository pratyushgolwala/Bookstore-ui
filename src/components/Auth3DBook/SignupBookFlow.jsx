import { useState } from 'react';
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
 * SignupBookFlow — Manages signup flow with multi-page form
 * Pages: 1=Role, 2=Personal, 3=Email, 4=Password, 5=Review, 6=Success
 */
function SignupBookFlow({ toast }) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState('forward'); // 'forward' | 'back'
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    confirm_email: '',
    password: '',
    confirm_password: '',
    phone: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Trigger smooth page transition animation
   */
  const triggerPageTransition = (direction, callback) => {
    setTransitionDirection(direction);
    setIsPageTransitioning(true);
    setTimeout(() => {
      callback();
      setIsPageTransitioning(false);
    }, 450);
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    triggerPageTransition('forward', () => setCurrentPage(2));
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateCurrentPage = () => {
    const newErrors = {};
    switch (currentPage) {
      case 2:
        if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
        if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
        break;
      case 3:
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.confirm_email.trim()) {
          newErrors.confirm_email = 'Please confirm your email';
        } else if (formData.email !== formData.confirm_email) {
          newErrors.confirm_email = 'Emails do not match';
        }
        break;
      case 4:
        if (!formData.password) {
          newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
          newErrors.password = 'Password must contain uppercase, lowercase, and numbers';
        }
        if (formData.password !== formData.confirm_password) {
          newErrors.confirm_password = 'Passwords do not match';
        }
        break;
      case 5:
        if (!formData.acceptTerms) newErrors.terms = 'You must accept the terms and conditions';
        break;
      default:
        break;
    }
    return newErrors;
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setErrors({});
      triggerPageTransition('back', () => setCurrentPage(currentPage - 1));
    }
  };

  const handleNext = () => {
    const newErrors = validateCurrentPage();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    triggerPageTransition('forward', () => setCurrentPage(currentPage + 1));
  };

  /**
   * Trigger page-flip animation then call the API
   */
  const handleSubmit = async () => {
    const newErrors = validateCurrentPage();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    // Trigger page-flip animation then show success page
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentPage(6);
      setIsAnimating(false);
    }, 850);
  };

  const handleAnimationComplete = () => {
    setIsAnimating(false);
  };

  /**
   * Called from SuccessPage — hit the API and redirect
   */
  const submitSignup = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/signup/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: selectedRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const message = data?.status?.message || 'Registration failed';
        toast.error(message);
        setErrors({ submit: message });
        setIsLoading(false);
        // Go back to review page
        triggerPageTransition('back', () => setCurrentPage(5));
        return;
      }

      toast.success('Account created! Please check your email to verify your account.');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch {
      toast.error('Connection error. Please try again.');
      setErrors({ submit: 'Connection error. Please try again.' });
      setIsLoading(false);
      triggerPageTransition('back', () => setCurrentPage(5));
    }
  };

  const renderCurrentPage = () => {
    const pageContent = (() => {
      switch (currentPage) {
        case 1:
          return (
            <RoleSelectionPage
              onRoleSelect={handleRoleSelect}
              onBackToLogin={() => navigate('/login')}
            />
          );
        case 2:
          return (
            <PersonalInfoPage
              firstName={formData.first_name}
              lastName={formData.last_name}
              onFirstNameChange={(v) => updateFormData('first_name', v)}
              onLastNameChange={(v) => updateFormData('last_name', v)}
              onPrevious={handlePrevious}
              onNext={handleNext}
              errors={errors}
            />
          );
        case 3:
          return (
            <EmailPage
              email={formData.email}
              confirmEmail={formData.confirm_email}
              onEmailChange={(v) => updateFormData('email', v)}
              onConfirmEmailChange={(v) => updateFormData('confirm_email', v)}
              onPrevious={handlePrevious}
              onNext={handleNext}
              errors={errors}
            />
          );
        case 4:
          return (
            <PasswordSecurityPage
              password={formData.password}
              confirmPassword={formData.confirm_password}
              onPasswordChange={(v) => updateFormData('password', v)}
              onConfirmPasswordChange={(v) => updateFormData('confirm_password', v)}
              onPrevious={handlePrevious}
              onNext={handleNext}
              errors={errors}
            />
          );
        case 5:
          return (
            <ReviewPage
              formData={formData}
              role={selectedRole}
              acceptTerms={formData.acceptTerms}
              onAcceptTermsChange={(checked) => updateFormData('acceptTerms', checked)}
              onPrevious={handlePrevious}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              errors={errors}
            />
          );
        case 6:
          return (
            <SuccessPage
              onRedirectToLogin={submitSignup}
              isLoading={isLoading}
            />
          );
        default:
          return null;
      }
    })();

    // Choose animation class based on transition direction
    const transitionClass = isPageTransitioning
      ? transitionDirection === 'forward'
        ? styles.pageFlipForward
        : styles.pageFlipBack
      : '';

    return (
      <div className={transitionClass} style={{ width: '100%', height: '100%' }}>
        {pageContent}
      </div>
    );
  };

  return (
    <div className={styles.signupContainer}>
      <div className={styles.signupBook}>
        {renderCurrentPage()}
      </div>

      {isAnimating && (
        <PageTurnAnimation
          onComplete={handleAnimationComplete}
          pageCount={5}
          duration={800}
          isSignup={true}
        />
      )}
    </div>
  );
}

export default SignupBookFlow;
