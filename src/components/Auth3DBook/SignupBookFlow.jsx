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
 * State: form data, page tracking, errors, loading state
 */
function SignupBookFlow() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
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
   * Trigger page transition animation
   */
  const triggerPageTransition = (callback) => {
    setIsPageTransitioning(true);
    setTimeout(() => {
      callback();
      setIsPageTransitioning(false);
    }, 500);
  };

  /**
   * Handle role selection and advance to page 2
   */
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    triggerPageTransition(() => {
      setCurrentPage(2);
    });
  };

  /**
   * Update form data field
   */
  const updateFormData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear field error as user types
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  /**
   * Validate current page fields
   */
  const validateCurrentPage = () => {
    const newErrors = {};

    switch (currentPage) {
      case 2: // Personal Info
        if (!formData.first_name.trim()) {
          newErrors.first_name = 'First name is required';
        }
        if (!formData.last_name.trim()) {
          newErrors.last_name = 'Last name is required';
        }
        break;

      case 3: // Email
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

      case 4: // Password
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

      case 5: // Review
        if (!formData.acceptTerms) {
          newErrors.terms = 'You must accept the terms and conditions';
        }
        break;

      default:
        break;
    }

    return newErrors;
  };

  /**
   * Handle previous button (go to previous page)
   */
  const handlePrevious = () => {
    if (currentPage > 1) {
      triggerPageTransition(() => {
        setCurrentPage(currentPage - 1);
      });
    }
  };

  /**
   * Handle next button (validate and go to next page)
   */
  const handleNext = () => {
    const newErrors = validateCurrentPage();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    triggerPageTransition(() => {
      setCurrentPage(currentPage + 1);
    });
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    const newErrors = validateCurrentPage();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Trigger page-turn animation before showing success
    setIsAnimating(true);

    // Wait for animation to complete
    setTimeout(() => {
      // Show success page
      setCurrentPage(6);
      setIsAnimating(false);
    }, 850); // Match animation duration
  };

  /**
   * Handle animation complete from SuccessPage
   */
  const handleAnimationComplete = () => {
    setIsAnimating(false);
  };

  /**
   * Submit actual signup API call
   */
  const submitSignup = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/signup/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || 'Registration failed');
      }

      // Success — redirect to login
      navigate('/login?registered=true', {
        state: { email: formData.email, role: selectedRole },
      });
    } catch (error) {
      setErrors({ submit: error.message || 'An error occurred during registration' });
      setIsLoading(false);
      // Go back to review page to allow correction
      triggerPageTransition(() => {
        setCurrentPage(5);
      });
    }
  };

  /**
   * Render current page based on currentPage state
   */
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
              onFirstNameChange={(value) => updateFormData('first_name', value)}
              onLastNameChange={(value) => updateFormData('last_name', value)}
              onPrevious={handlePrevious}
              onNext={handleNext}
              errors={errors}
              progressPercentage={(2 / 5) * 100}
            />
          );

        case 3:
          return (
            <EmailPage
              email={formData.email}
              confirmEmail={formData.confirm_email}
              onEmailChange={(value) => updateFormData('email', value)}
              onConfirmEmailChange={(value) => updateFormData('confirm_email', value)}
              onPrevious={handlePrevious}
              onNext={handleNext}
              errors={errors}
              progressPercentage={(3 / 5) * 100}
            />
          );

        case 4:
          return (
            <PasswordSecurityPage
              password={formData.password}
              confirmPassword={formData.confirm_password}
              onPasswordChange={(value) => updateFormData('password', value)}
              onConfirmPasswordChange={(value) => updateFormData('confirm_password', value)}
              onPrevious={handlePrevious}
              onNext={handleNext}
              errors={errors}
              progressPercentage={(4 / 5) * 100}
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
              progressPercentage={(5 / 5) * 100}
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

    // Apply transition animation if transitioning
    const transitionClass = isPageTransitioning ? styles.pageFlipSignupTransition : '';

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
