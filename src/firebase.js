import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider 
} from "firebase/auth";
import { getFirestore, serverTimestamp } from "firebase/firestore";

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

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

// Timestamp function
const timestamp = serverTimestamp;

// Auth providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { 
  auth, 
  db, 
  timestamp,
  googleProvider,
  facebookProvider 
};