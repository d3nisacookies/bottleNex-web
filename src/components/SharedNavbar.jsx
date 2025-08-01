import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/LandingPage.css';

const SharedNavbar = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  // Handle download
  const handleDownload = () => {
    console.log('Download initiated');
    // Add your download logic here
  };

  // Handle logout
  const handleLogout = async () => {
    console.log('🔄 Logout initiated');
    try {
      await logout();
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  return (
    <>
      {/* Welcome banner for logged-in users */}
      {currentUser && (
        <div className="welcome-banner">
          Welcome, {currentUser.firstName || currentUser.email.split('@')[0]}!
        </div>
      )}

      {/* Fixed Navigation Bar */}
      <nav className="landing-navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <img src="/logo192.png" alt="BottleNex" className="logo-img" />
            <span className="logo-text">BottleNex</span>
          </div>
          
          <div className="nav-links">
            <button onClick={() => navigate('/')} className="nav-link">Home</button>
            <button onClick={() => navigate('/#plans')} className="nav-link">Subscription Plans</button>
            <button onClick={() => navigate('/#review')} className="nav-link">Review</button>
            <button onClick={() => navigate('/#faq')} className="nav-link">FAQ</button>
            <button onClick={() => navigate('/#about')} className="nav-link">About Us</button>
            {currentUser && currentUser.role === "admin" && (
              <button onClick={() => navigate('/admin')} className="nav-link admin-link">Admin Dashboard</button>
            )}
          </div>
          
          <div className="nav-buttons">
            {currentUser ? (
              <>
                <button onClick={handleDownload} className="download-btn">Download</button>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/register')} className="register-btn">Register and Download</button>
                <button onClick={() => navigate('/login')} className="login-btn">Login</button>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default SharedNavbar;