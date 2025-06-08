import { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function Register() {
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      // Prepare user data for Firestore
      const userData = {
        FIRST_NAME: formData.firstName,
        LAST_NAME: formData.lastName,
        EMAIL: formData.email,
        PASSWORD: formData.password, // Note: In production, don't store raw passwords!
        PHONE_NUMBER: Number(formData.phoneNumber),
        POSTAL_CODE: Number(formData.postalCode),
        DATE_OF_BIRTH: new Date(formData.dateOfBirth),
        SIGNUP_DATE: serverTimestamp(), // Firebase server timestamp
        STATUS: true,
        USER_TYPE: "Free",
        USER_ID: Math.floor(Math.random() * 1000000) // Generate random ID (replace with your logic)
      };

      // Save to Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), userData);
      
      alert("Registration successful!");
    } catch (error) {
      console.error("Error registering:", error);
      alert(`Registration failed: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="firstName"
        placeholder="First Name"
        value={formData.firstName}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="lastName"
        placeholder="Last Name"
        value={formData.lastName}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
      />
      <input
        type="tel"
        name="phoneNumber"
        placeholder="Phone Number"
        value={formData.phoneNumber}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="postalCode"
        placeholder="Postal Code"
        value={formData.postalCode}
        onChange={handleChange}
        required
      />
      <input
        type="date"
        name="dateOfBirth"
        placeholder="Date of Birth"
        value={formData.dateOfBirth}
        onChange={handleChange}
        required
      />
      <button type="submit">Register</button>
    </form>
  );
}