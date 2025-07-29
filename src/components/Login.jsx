import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      // Handle login directly with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      
      console.log('✅ Firebase login successful');
      console.log('📧 Email verification status:', userCredential.user.emailVerified);
      console.log('🆔 User UID:', userCredential.user.uid);
      
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        await sendEmailVerification(userCredential.user);
        await signOut(auth);
        setError('Please verify your email address before logging in.');
        navigate('/verify-email', {
          state: {
            email: formData.email,
            message: 'Please verify your email address before logging in. A new verification email has been sent.'
          }
        });
        return;
      }
      
      console.log('🔍 Getting user data from Firestore...');
      // Get user data from Firestore
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();
      
      console.log('✅ User data retrieved from Firestore:', userData);
      
      // Update last login timestamp
      await setDoc(doc(db, "users", userCredential.user.uid), {
        lastLogin: serverTimestamp(),
        status: true,
        emailVerified: true
      }, { merge: true });
      
      console.log('✅ Last login timestamp updated in Firestore.');
      
      // Success - user will be redirected by App component
      
    } catch (err) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.code === 'auth/wrong-password') {
        errorMessage = 'Email or Password is incorrect.';
      } else if (err.code === 'auth/invalid-credential') {
        errorMessage = 'Email or Password is incorrect.';
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'Email or Password is incorrect.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled. Please contact support.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else {
        errorMessage = `Login failed: ${err.message || 'Unknown error occurred'}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <h2>Login</h2>

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
            disabled={loading}
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