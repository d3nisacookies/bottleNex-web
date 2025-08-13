// src/App.js
import { BrowserRouter , Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import LandingPage from './components/LandingPage.jsx';
import React, { useEffect } from 'react';
import Register from './components/Register.jsx';
import Login from './components/Login.jsx';
import VerifyEmail from './components/VerifyEmail.jsx';
import ForgotPassword from './components/ForgotPassword.jsx';
import "./App.css"
import { AuthProvider } from './context/AuthContext.js';
import { LandingPageProvider } from './context/LandingPageContext.js';
import AdminDashboard from './components/AdminDashboard.jsx';
import { useAuth } from './context/AuthContext.js';

// Wrapper component to access location
function AppContentWrapper() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Handle redirects when user state changes
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === "admin" && location.pathname !== "/admin") {
        console.log('🔄 App: Redirecting admin to /admin from', location.pathname);
        navigate('/admin', { replace: true });
      } else if (currentUser.role !== "admin" && (location.pathname === "/login" || location.pathname === "/register")) {
        console.log('🔄 App: Redirecting regular user to home from', location.pathname);
        navigate('/', { replace: true });
      }
    }
  }, [currentUser, location.pathname, navigate]);
  
  // Redirect admin users from home page to admin dashboard
  const HomeComponent = () => {
    if (currentUser && currentUser.role === "admin") {
      return <Navigate to="/admin" replace />;
    }
    return <LandingPage />;
  };

  // Check if current path is admin dashboard
  const isAdminDashboard = location.pathname === "/admin";

  return (
    <div className="app-layout">
      <div className="page-content">
        <Routes>
          <Route path="/" element={<HomeComponent />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* Admin route - only accessible to admin users */}
          <Route path="/admin" element={
            currentUser && currentUser.role === "admin" ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/" replace />
            )
          } />
        </Routes>
      </div>
    </div>
  );
}

function AppContent() {
  return (
    <BrowserRouter>
      <AppContentWrapper />
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <LandingPageProvider>
        <AppContent />
      </LandingPageProvider>
    </AuthProvider>
  );
}

export default App;