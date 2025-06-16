import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import '../css/Login.css';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      
      // Attempt login
      await login(formData.email, formData.password);
      
      // Success case
      console.log('✅ Login successful for user:', formData.email);
      console.log('🔄 Redirecting to:', location.state?.from || '/home');
      navigate(location.state?.from || '/');
      
    } catch (err) {
      console.error('❌ Login error:', err);
      
      let errorMessage = 'Login failed';
      if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);
        
        if (newRetryCount < maxRetries) {
          console.log(`🔄 Retry attempt ${newRetryCount} of ${maxRetries}`);
          errorMessage += ` (${maxRetries - newRetryCount} attempts remaining)`;
        } else {
          console.log('⛔ Maximum retry attempts reached');
          errorMessage = 'Too many failed attempts. Please try again later.';
        }
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Reset retry count when email changes
  useEffect(() => {
    setRetryCount(0);
  }, [formData.email]);

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>
        
        {error && (
          <div className="error-message">
            {error}
            {error.includes('Incorrect password') && retryCount < maxRetries && (
              <button 
                onClick={handleSubmit}
                className="retry-button"
              >
                Try Again
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading || retryCount >= maxRetries}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : 'Login'}
          </button>
        </form>

        <div className="login-links">
          <Link to="/forgot-password">Forgot password?</Link>
          <span>•</span>
          <Link to="/register">Create account</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;