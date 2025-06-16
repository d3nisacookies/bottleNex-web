// src/App.js
import { BrowserRouter , Routes, Route } from 'react-router-dom';
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

// console.log({Navbar,Home,Plans,FAQ,About})

function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
    <div className= "app-layout">
      <Navbar />
      <div className="page-content">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/about" element={<About />} />
        <Route path="/review" element={<Review />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      </div>
    </div>
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App;