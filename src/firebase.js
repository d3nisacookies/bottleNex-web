// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCi0X8CMPiYHgV70uM_X7SswJfRBrqZDH0",
  authDomain: "bottlenex-43fa5.firebaseapp.com",
  projectId: "bottlenex-43fa5",
  storageBucket: "bottlenex-43fa5.appspot.com",
  messagingSenderId: "403269302904",
  appId: "1:403269302904:web:ae7013b3f01235bdf0cb8d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export default app;

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);