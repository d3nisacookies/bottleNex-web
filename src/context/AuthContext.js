// src/context/AuthContext.js
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userDataRef = useRef(null);

  // Auth state observer
  useEffect(() => {
    let unsubscribe;
    try {
      unsubscribe = onAuthStateChanged(
        auth,
        async (user) => {
          if (user) {
            // Check if email is verified
            if (!user.emailVerified) {
              console.log('🔄 Unverified user detected, signing out...');
              await signOut(auth);
              setCurrentUser(null);
              userDataRef.current = null;
              setLoading(false);
              return;
            }
            
            // Only fetch user data if we don't already have it or if the user ID changed
            if (!userDataRef.current || userDataRef.current.uid !== user.uid) {
              // Get additional user data from Firestore
              const userDocRef = doc(db, "users", user.uid);
              getDoc(userDocRef).then((docSnap) => {
                const userData = {
                  ...user,
                  isVerified: user.emailVerified,
                  firstName: docSnap.data()?.firstName,
                  lastName: docSnap.data()?.lastName,
                  role: docSnap.data()?.role,
                  userType: docSnap.data()?.userType || "Free"
                };
                userDataRef.current = userData;
                setCurrentUser(userData);
              });
            }
          } else {
            setCurrentUser(null);
            userDataRef.current = null;
          }
          setLoading(false);
          setError(null);
        },
        (authError) => {
          console.error("Auth state error:", authError);
          setError(authError);
          setLoading(false);
        }
      );
    } catch (initError) {
      console.error("Auth initialization error:", initError);
      setError(initError);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Register new user
  async function register(email, password, userData) {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Store additional user data in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: email,
        emailVerified: false,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        role: userData.role || "user"
      });

      await sendEmailVerification(userCredential.user);
      return userCredential;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Login with email/password
  async function login(email, password) {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        // Send verification email again
        await sendEmailVerification(userCredential.user);
        
        // Sign out the user if email is not verified
        await signOut(auth);
        throw new Error('Please verify your email address before logging in.');
      }
      
      // Get user data from Firestore to check role
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();
      
      // Update last login timestamp and set status to true (verified)
      await setDoc(doc(db, "users", userCredential.user.uid), {
        lastLogin: serverTimestamp(),
        status: true,
        emailVerified: true
      }, { merge: true });
      
      // Update currentUser state immediately with the new data
      const userDataWithRole = {
        ...userCredential.user,
        isVerified: userCredential.user.emailVerified,
        firstName: userData?.firstName,
        lastName: userData?.lastName,
        role: userData?.role || "user",
        userType: userData?.userType || "Free"
      };
      userDataRef.current = userDataWithRole;
      setCurrentUser(userDataWithRole);
      
      // Return user data including role
      return {
        ...userCredential,
        userData: {
          ...userData,
          role: userData?.role || "user"
        }
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Logout
  async function logout() {
    try {
      setLoading(true);
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Refresh current user data from Firestore
  async function refreshUserData() {
    if (!currentUser) return;
    
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();
      
      const updatedUserData = {
        ...currentUser,
        firstName: userData?.firstName,
        lastName: userData?.lastName,
        role: userData?.role || "user",
        userType: userData?.userType || "Free"
      };
      
      userDataRef.current = updatedUserData;
      setCurrentUser(updatedUserData);
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  }

  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    refreshUserData,
    reloadUser: () => auth.currentUser?.reload()
  };

  return (
    <AuthContext.Provider value={value}>
      {error ? (
        <div className="auth-error">
          <h2>Authentication Error</h2>
          <p>{error.message}</p>
          <button onClick={() => window.location.reload()}>Refresh Page</button>
        </div>
      ) : loading ? (
        <div className="auth-loading">
          <div className="spinner"></div>
          <p>Loading authentication...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}