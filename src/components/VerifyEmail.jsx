import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { sendEmailVerification } from 'firebase/auth';
import { Link } from 'react-router-dom';
import SharedNavbar from './SharedNavbar.jsx';
import '../css/VerifyEmail.css';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (location.state) {
      setEmail(location.state.email || '');
      setMessage(location.state.message || 'Please verify your email address.');
    }
  }, [location.state]);

  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const handleResendVerification = async () => {
    if (resendCountdown > 0) return;
    
    setIsResending(true);
    try {
      // Get the current user (they should be logged in briefly after registration)
      const currentUser = auth.currentUser;
      if (currentUser) {
        await sendEmailVerification(currentUser);
        setMessage('Verification email sent! Please check your inbox.');
        setResendCountdown(60); // 60 second cooldown
      } else {
        // If user is not logged in, we can't resend verification
        // This would require them to log in again or we'd need to implement
        // a different approach (like storing the user temporarily)
        setMessage('Please try logging in again to resend verification email.');
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      setMessage('Failed to send verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="verify-email-page">
      <SharedNavbar />
      <div className="verify-email-container">
        <div className="verify-email-card">
          <div className="verify-email-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 6L12 13L2 6" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 6C2 4.9 2.9 4 4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6Z" stroke="#4CAF50" strokeWidth="2"/>
            </svg>
          </div>
          
          <h2>Verify Your Email</h2>
          
          <p className="verify-message">{message}</p>
          
          {email && (
            <div className="email-display">
              <strong>Email:</strong> {email}
            </div>
          )}
          
          <div className="verification-steps">
            <h3>Next Steps:</h3>
            <ol>
              <li>Check your email inbox (and spam folder)</li>
              <li>Click the verification link in the email</li>
              <li>Once verified, you can <Link to="/login">log in to your account</Link></li>
            </ol>
          </div>
          
          <div className="action-buttons">
            <button 
              onClick={handleResendVerification}
              disabled={isResending || resendCountdown > 0}
              className="resend-btn"
            >
              {isResending 
                ? 'Sending...' 
                : resendCountdown > 0 
                  ? `Resend in ${resendCountdown}s` 
                  : 'Resend Verification Email'
              }
            </button>
            
            <button 
              onClick={handleLoginClick}
              className="login-btn"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
