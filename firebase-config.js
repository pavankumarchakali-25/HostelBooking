// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAARKrOGmvkWCcbbgs9uqV4GQXkCEo6d9c",
  authDomain: "hostel-room-booking-site.firebaseapp.com",
  projectId: "hostel-room-booking-site",
  storageBucket: "hostel-room-booking-site.firebasestorage.app",
  messagingSenderId: "105322833808",
  appId: "1:105322833808:web:5b0a7d63677f8f33a8b515",
  measurementId: "G-XE4BFB7RLK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
