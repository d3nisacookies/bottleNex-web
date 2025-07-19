// src/App.js
import { BrowserRouter , Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx'
import Home from './components/Home.jsx';
import Plans from './components/Plans.jsx';
import FAQ from './components/FAQ.jsx';
import About from './components/About.jsx';
import Review from './components/Review.jsx';
import React from 'react';
import Register from './components/Register.jsx';
import Login from './components/Login.jsx';
import "./App.css"
import { AuthProvider } from './context/AuthContext.js';
import { LandingPageProvider } from './context/LandingPageContext.js';
import AdminDashboard from './components/AdminDashboard.jsx';
import { useAuth } from './context/AuthContext.js';

// console.log({Navbar,Home,Plans,FAQ,About})

function AppContent() {
  const { currentUser } = useAuth();
  
  // Redirect admin users from home page to admin dashboard
  const HomeComponent = () => {
    if (currentUser && currentUser.role === "admin") {
      return <Navigate to="/admin" replace />;
    }
    return <Home />;
  };

  return (
    <BrowserRouter>
      <div className= "app-layout">
        <Navbar />
        <div className="page-content">
          <Routes>
            <Route path="/" element={<HomeComponent />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/about" element={<About />} />
            <Route path="/review" element={<Review />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
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