import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Navbar.css';

const Navbar = () => {
  const handleTestNavigation = (pageName) => {
    console.log(`Navigating to ${pageName}`);
    alert(`This would navigate to ${pageName} in a real app`);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* App Icon (Left-aligned) */}
        <Link 
          to="/" 
          className="navbar-logo"
          onClick={() => handleTestNavigation('Home')}
        >
          <img 
            src="https://via.placeholder.com/40x40?text=Logo" 
            alt="App Logo" 
          />
        </Link>

        {/* Navigation Links (Center-aligned) */}
        <ul className="nav-menu">
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
        </ul>

        {/* Review App Button (Right-aligned) */}
        <button 
          className="review-btn"
          onClick={() => {
            handleTestNavigation('Home (via Review)');
            window.location.href = '/'; // Simulate redirect
          }}
        >
          Review App
        </button>
      </div>
    </nav>
  );
};

export default Navbar;