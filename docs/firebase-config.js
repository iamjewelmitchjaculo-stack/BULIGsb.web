import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";
import { getFunctions } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-functions.js";

const firebaseConfig = {
  apiKey: "AIzaSyC8OqrIXB2a0KCiBNfjTRFunUKcYNd2IB4",
  authDomain: "tulong-santa-barbara.firebaseapp.com",
  projectId: "tulong-santa-barbara",
  storageBucket: "tulong-santa-barbara.firebasestorage.app",
  messagingSenderId: "743546427048",
  appId: "1:743546427048:web:bbf8bfcf226ff28c73549d",
  measurementId: "G-8528B4DLR0"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
