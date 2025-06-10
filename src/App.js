// src/App.js
import { BrowserRouter , Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx'
import Home from './components/Home.jsx';
import Plans from './components/Plans.jsx';
import FAQ from './components/FAQ.jsx';
import About from './components/About.jsx';
import React from 'react';
//import Register from './components/Register.jsx';

console.log({Navbar,Home,Plans,FAQ,About})

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;