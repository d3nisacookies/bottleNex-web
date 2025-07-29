import { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import SharedNavbar from "./SharedNavbar.jsx";
import "../css/Register.css";

export default function Register({ role = "user" }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    postalCode: "",
    dateOfBirth: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required";
    if (!formData.postalCode) newErrors.postalCode = "Postal code is required";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
      
      // Prepare user data for Firestore (without storing raw password)
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        postalCode: formData.postalCode,
        dateOfBirth: formData.dateOfBirth,
        signUpDate: serverTimestamp(),
        status: false, // Set to false until email is verified
        userType: "Free",
        lastLogin: serverTimestamp(),
        role, // Use the prop value
        emailVerified: false
      };

      // Store user data in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), userData);
      
      console.log("✅ User registered successfully:", userCredential.user.uid);
      
      // Navigate to verify email page
      navigate("/verify-email", {
        state: {
          email: formData.email,
          message: "Registration successful! Please verify your email address to complete your account setup."
        }
      });
      
    } catch (error) {
      console.error("❌ Registration error:", error);
      
      // Handle specific Firebase Auth errors
      if (error.code === "auth/email-already-in-use") {
        setErrors({ email: "An account with this email already exists" });
      } else if (error.code === "auth/weak-password") {
        setErrors({ password: "Password is too weak" });
      } else if (error.code === "auth/invalid-email") {
        setErrors({ email: "Invalid email address" });
      } else {
        setErrors({ general: "Registration failed. Please try again." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <SharedNavbar />
      <div className="register-container">
        <div className="register-card">
          <h2>Create Account</h2>
          <p className="register-subtitle">Join BottleNex today and start optimizing your commute!</p>
          
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? "error" : ""}
                  placeholder="Enter your first name"
                />
                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? "error" : ""}
                  placeholder="Enter your last name"
                />
                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "error" : ""}
                placeholder="Enter your email address"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "error" : ""}
                  placeholder="Create a password"
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? "error" : ""}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number *</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={errors.phoneNumber ? "error" : ""}
                  placeholder="Enter your phone number"
                />
                {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="postalCode">Postal Code *</label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className={errors.postalCode ? "error" : ""}
                  placeholder="Enter your postal code"
                />
                {errors.postalCode && <span className="error-message">{errors.postalCode}</span>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth *</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={errors.dateOfBirth ? "error" : ""}
              />
              {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
            </div>
            
            <button 
              type="submit" 
              className="register-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>
          
          <div className="login-link">
            Already have an account? <Link to="/login">Log in here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to create an admin user (call from console or test button)
export async function createAdminUser({ email, password, firstName, lastName }) {
  const { createUserWithEmailAndPassword } = await import("firebase/auth");
  const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
  const { auth, db } = await import("../firebase");

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "users", userCredential.user.uid), {
    firstName,
    lastName,
    email,
    signUpDate: serverTimestamp(),
    status: true,
    userType: "Admin",
    lastLogin: serverTimestamp(),
    role: "admin"
  });
  return userCredential;
}

// Helper function to delete a user (for testing purposes)
export async function deleteUserByEmail(email) {
  const { signInWithEmailAndPassword, deleteUser } = await import("firebase/auth");
  const { doc, deleteDoc } = await import("firebase/firestore");
  const { auth, db } = await import("../firebase");

  try {
    // You'll need to know the password to sign in and delete
    // This is just for testing - in production, use Firebase Admin SDK
    console.log("This function requires the user's password to work properly.");
    console.log("For production, use Firebase Admin SDK instead.");
    
    // Example usage (you'll need to provide the password):
    // await deleteUserByEmail("test@example.com", "password123");
    
    return { success: false, message: "This function requires password. Use Firebase Console instead." };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: error.message };
  }
}

if (typeof window !== "undefined") {
  window.createAdminUser = createAdminUser;
  window.deleteUserByEmail = deleteUserByEmail;
}