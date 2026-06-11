import { useLocation, useNavigate } from 'react-router-dom';
import LoginBookFlow from './LoginBookFlow';
import SignupBookFlow from './SignupBookFlow';
import styles from './Auth3DBook.module.css';

/**
 * Auth3DBook — Container for 3D book-turning authentication interface
 * Routes between login and signup flows based on current route
 */
function Auth3DBook() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine which flow to render based on current path
  const isLoginFlow = location.pathname === '/login';
  const isSignupFlow = location.pathname === '/register';

  // If neither login nor signup route, redirect to login
  if (!isLoginFlow && !isSignupFlow) {
    navigate('/login');
    return null;
  }

  return (
    <div className={styles.auth3DBookContainer}>
      <div className={styles.bookViewport}>
        {isLoginFlow && <LoginBookFlow />}
        {isSignupFlow && <SignupBookFlow />}
      </div>
    </div>
  );
}

export default Auth3DBook;
