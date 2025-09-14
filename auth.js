import { auth, db } from "./firebase-config.js";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider, 
  signInWithPopup 
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

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
