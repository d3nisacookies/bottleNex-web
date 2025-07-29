import React, { useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import '../css/PaymentModal.css';

const PaymentModal = ({ isOpen, onClose, plan, currentUser, onSuccess }) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Card number validation (basic)
    if (!formData.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }
    
    // Expiry date validation
    if (!formData.expiryDate.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
      newErrors.expiryDate = 'Please enter expiry date in MM/YY format';
    }
    
    // CVV validation
    if (!formData.cvv.match(/^\d{3,4}$/)) {
      newErrors.cvv = 'Please enter a valid CVV (3-4 digits)';
    }
    
    // Cardholder name validation
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Please enter the cardholder name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsProcessing(true);
    
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store payment info in Firebase
      const paymentData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        planTitle: plan.title,
        planPrice: plan.price,
        planBilling: plan.billing,
        cardNumber: formData.cardNumber.replace(/\s/g, '').slice(-4), // Store only last 4 digits
        cardholderName: formData.cardholderName,
        paymentDate: serverTimestamp(),
        status: 'completed'
      };
      
      // Save payment info
      await setDoc(doc(db, 'users', currentUser.uid, 'payments', `payment_${Date.now()}`), paymentData);
      
      // Update user status to Premium
      await setDoc(doc(db, 'users', currentUser.uid), {
        userType: 'Premium',
        lastPayment: serverTimestamp(),
        currentPlan: plan.title
      }, { merge: true });
      
      // Log successful subscription
      await setDoc(doc(db, 'subscription_attempts', `success_${Date.now()}`), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : currentUser.email,
        planTitle: plan.title,
        planPrice: plan.price,
        planBilling: plan.billing,
        timestamp: serverTimestamp(),
        status: 'completed'
      });
      
      console.log('✅ Payment processed successfully');
      
      // Call success callback
      onSuccess();
      
      // Close modal
      onClose();
      
    } catch (error) {
      console.error('❌ Payment processing error:', error);
      setErrors({ general: 'Payment processing failed. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <div className="payment-modal-header">
          <h2>Complete Your Subscription</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        
        <div className="payment-modal-content">
          <div className="plan-summary">
            <h3>{plan.title} Plan</h3>
            <p className="plan-price">{plan.price} {plan.billing}</p>
          </div>
          
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="payment-form">
            <div className="form-group">
              <label htmlFor="cardNumber">Card Number</label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={(e) => handleChange({ target: { name: 'cardNumber', value: formatCardNumber(e.target.value) } })}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                className={errors.cardNumber ? "error" : ""}
              />
              {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="expiryDate">Expiry Date</label>
                <input
                  type="text"
                  id="expiryDate"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={(e) => handleChange({ target: { name: 'expiryDate', value: formatExpiryDate(e.target.value) } })}
                  placeholder="MM/YY"
                  maxLength="5"
                  className={errors.expiryDate ? "error" : ""}
                />
                {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="cvv">CVV</label>
                <input
                  type="text"
                  id="cvv"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleChange}
                  placeholder="123"
                  maxLength="4"
                  className={errors.cvv ? "error" : ""}
                />
                {errors.cvv && <span className="error-message">{errors.cvv}</span>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="cardholderName">Cardholder Name</label>
              <input
                type="text"
                id="cardholderName"
                name="cardholderName"
                value={formData.cardholderName}
                onChange={handleChange}
                placeholder="John Doe"
                className={errors.cardholderName ? "error" : ""}
              />
              {errors.cardholderName && <span className="error-message">{errors.cardholderName}</span>}
            </div>
            
            <button 
              type="submit" 
              className="pay-button"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="spinner"></span>
                  Processing Payment...
                </>
              ) : (
                `Pay ${plan.price}`
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;