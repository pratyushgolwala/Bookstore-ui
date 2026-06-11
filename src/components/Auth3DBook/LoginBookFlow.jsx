import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmailValidationPage from './pages/EmailValidationPage';
import PasswordEntryPage from './pages/PasswordEntryPage';
import PageTurnAnimation from './animations/PageTurnAnimation';
import styles from './Auth3DBook.module.css';

/**
 * LoginBookFlow — Manages login flow with email validation → animation → password entry
 * State: page tracking, form data, errors, loading state
 */
function LoginBookFlow() {
  const navigate = useNavigate();
  const [page, setPage] = useState('email'); // 'email' | 'animating' | 'password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Validate email format
   */
  const validateEmail = (emailValue) => {
    if (!emailValue.trim()) {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  /**
   * Handle email input change
   */
  const handleEmailChange = (value) => {
    setEmail(value);
    // Clear email error as user types
    if (errors.email) {
      setErrors((prev) => ({
        ...prev,
        email: '',
      }));
    }
  };

  /**
   * Handle Next button from email page
   */
  const handleEmailNext = () => {
    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }
    // Trigger animation
    setPage('animating');
  };

  /**
   * Handle animation completion
   */
  const handleAnimationComplete = () => {
    setPage('password');
  };

  /**
   * Handle password input change
   */
  const handlePasswordChange = (value) => {
    setPassword(value);
    // Clear password error as user types
    if (errors.password) {
      setErrors((prev) => ({
        ...prev,
        password: '',
      }));
    }
  };

  /**
   * Submit login form to API
   */
  const handlePasswordSubmit = async () => {
    if (!password) {
      setErrors({ password: 'Password is required' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || 'Login failed');
      }

      // Success — store user data and navigate
      localStorage.setItem('user', JSON.stringify(data.data));

      // Role-based redirect
      const userRole = data.data.role;
      if (userRole === 'ADMIN') {
        navigate('/admin');
      } else if (userRole === 'AUTHOR') {
        navigate('/profile');
      } else {
        navigate('/books');
      }
    } catch (error) {
      setErrors({ submit: error.message || 'An error occurred during login' });
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBook}>
        {page === 'email' && (
          <EmailValidationPage
            email={email}
            onEmailChange={handleEmailChange}
            onNext={handleEmailNext}
            error={errors.email}
            submitError={errors.submit}
            isLoading={isLoading}
          />
        )}

        {page === 'password' && (
          <PasswordEntryPage
            password={password}
            onPasswordChange={handlePasswordChange}
            onSubmit={handlePasswordSubmit}
            error={errors.password}
            submitError={errors.submit}
            isLoading={isLoading}
          />
        )}
      </div>

      {page === 'animating' && (
        <PageTurnAnimation
          onComplete={handleAnimationComplete}
          pageCount={8}
          duration={900}
          isSignup={false}
        />
      )}
    </div>
  );
}

export default LoginBookFlow;
