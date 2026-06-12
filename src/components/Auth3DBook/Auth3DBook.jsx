import { useLocation, useNavigate } from 'react-router-dom';
import LoginBookFlow from './LoginBookFlow';
import SignupBookFlow from './SignupBookFlow';
import ToastContainer from '../Toast/ToastContainer';
import useToast from '../../hooks/useToast';
import styles from './Auth3DBook.module.css';

/**
 * Auth3DBook — Container for 3D book-turning authentication interface
 * Routes between login and signup flows based on current route
 */
function Auth3DBook() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toasts, toast, removeToast } = useToast();

  const isLoginFlow = location.pathname === '/login';
  const isSignupFlow = location.pathname === '/register';

  if (!isLoginFlow && !isSignupFlow) {
    navigate('/login');
    return null;
  }

  return (
    <>
      <div className={styles.auth3DBookContainer}>
        <div className={styles.bookViewport}>
          {isLoginFlow && <LoginBookFlow toast={toast} />}
          {isSignupFlow && <SignupBookFlow toast={toast} />}
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}

export default Auth3DBook;
