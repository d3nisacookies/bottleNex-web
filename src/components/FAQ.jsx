import React from 'react';
import '../css/FAQ.css';

const FAQ = () => {
  return (
    <div className="faq-container">
      <h1>FAQ</h1>
      <div className="faq-item">
        <h2>#1 Do You Collect Location?</h2>
        <p>No, we value your privacy.</p>
      </div>
      <div className="faq-item">
        <h2>#2 What is a locked road?</h2>
        <p>
          A locked segment cannot be edited by an editor with a lower Editing rank than the current lock number of the segment. Generally, segments should not be locked unless specific conditions exist.
        </p>
      </div>
      <div className="faq-item">
        <h2>#3 How does BottleneX determine my home state or country?</h2>
        <p>BottleneX automatically matches you to the state or country based on where you have earned the most points in the last week.</p>
      </div>
    </div>
  );
};

export default FAQ;
