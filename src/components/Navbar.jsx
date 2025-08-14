import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Bottlenex from "../images/Bottlenex.png";
import { openDownloadLink } from '../config/download';
import '../css/Navbar.css';

const Navbar = () => {
  const { currentUser, logout } = useAuth();

  const handleTestNavigation = (pageName) => {
    console.log(`Navigating to ${pageName}`);
  };

  const handleDownload = () => {
    console.log('Download initiated - opening Google Drive link');
    
    openDownloadLink();
    
    console.log('Google Drive link opened');
  };

  return (
    <nav className="navbar">
      {/* Welcome banner for logged-in users */}
      {currentUser && (
        <div className="welcome-banner">
          Welcome, {currentUser.firstName || currentUser.email.split('@')[0]}!
        </div>
      )}
      
      <div className="navbar-container">
        {/* Left-side Navigation Links */}
        <ul className="nav-menu nav-menu-left">
          <li className="nav-item">
            <Link 
              to="/" 
              className="nav-links"
              onClick={() => handleTestNavigation('Home')}
            >
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/plans" 
              className="nav-links"
              onClick={() => handleTestNavigation('Subscription Plans')}
            >
              Subscription Plans
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/review" 
              className="nav-links"
              onClick={() => handleTestNavigation('Review')}
            >
              Review
            </Link>
          </li>
          {currentUser && currentUser.role === "admin" && (
            <li className="nav-item">
              <Link 
                to="/admin" 
                className="nav-links"
                onClick={() => handleTestNavigation('Admin Dashboard')}
              >
                Admin Dashboard
              </Link>
            </li>
          )}
        </ul>

        {/* Centered Logo */}
        <div className="navbar-logo-container">
          <Link 
            to="/" 
            className="navbar-logo"
            onClick={() => handleTestNavigation('Home')}
          >
            <img src={Bottlenex} alt="App Logo" />
          </Link>
        </div>

        {/* Right-side Navigation Links */}
        <ul className="nav-menu nav-menu-right">
          <li className="nav-item">
            <Link 
              to="/faq" 
              className="nav-links"
              onClick={() => handleTestNavigation('FAQ')}
            >
              FAQ
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/about" 
              className="nav-links"
              onClick={() => handleTestNavigation('About Us')}
            >
              About Us
            </Link>
          </li>
          <li className="nav-item">
            {currentUser ? (
              <>
                <button 
                  onClick={handleDownload} 
                  className="nav-links download-btn"
                >
                  Download
                </button>
                <button 
                  onClick={logout} 
                  className="nav-links logout-btn"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/register" 
                  className="nav-links register-btn"
                  onClick={() => handleTestNavigation('Register')}
                >
                  Register and Download
                </Link>
                <Link 
                  to="/login" 
                  className="nav-links login-btn"
                  onClick={() => handleTestNavigation('Login')}
                >
                  Login
                </Link>
              </>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;