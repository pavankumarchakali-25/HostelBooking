import { auth, db } from "./firebase-config.js";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider, 
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, setDoc,getdoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// Google Login
if (document.getElementById("google-login-btn")) {
  document.getElementById("google-login-btn").addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Save user in Firestore if new
      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName,
        email: user.email,
        role: "user",
        createdAt: new Date()
      }, { merge: true });  // merge avoids overwriting

      alert("✅ Logged in with Google!");
      window.location.href = "index.html";
    } catch (err) {
      console.error("🔥 Google login error:", err);
      alert("❌ " + err.message);
    }
  });
}


const authBtn = document.getElementById("auth-btn");
const welcomeText = document.getElementById("welcome-text");

if (authBtn && welcomeText) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // ✅ User logged in
      let userName = user.displayName; // from Google login
      if (!userName) {
        // if signed up with email, fetch from Firestore
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          userName = userSnap.data().name;
        }
      }

      welcomeText.textContent = `Welcome, ${userName || "User"}`;

      authBtn.textContent = "Logout";
      authBtn.href = "#"; // disable link
      authBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        await signOut(auth);
        window.location.href = "login.html";
      });
    } else {
      // ❌ User not logged in
      welcomeText.textContent = "";
      authBtn.textContent = "Login";
      authBtn.href = "login.html";
    }
  });
}
