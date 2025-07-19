import React from 'react';
import { useLandingPage } from '../context/LandingPageContext';
import '../css/FAQ.css';

const FAQ = () => {
  const { faqContent, loading } = useLandingPage();

  if (loading) {
    return (
      <div className="faq-container">
        <div className="loading">Loading FAQ...</div>
      </div>
    );
  }

  return (
    <div className="faq-container">
      <h1>FAQ</h1>
      {faqContent.map((item) => (
        <div key={item.id} className="faq-item">
          <h2>#{item.id} {item.question}</h2>
          <p>{item.answer}</p>
        </div>
      ))}
    </div>
  );
};

export default FAQ;
