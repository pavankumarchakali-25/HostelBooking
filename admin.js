import { auth, db } from "./firebase-config.js";
import { doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (userDoc.exists() && userDoc.data().role === "admin") {
    const snapshot = await getDocs(collection(db, "bookings"));
    const container = document.getElementById("admin-bookings");

    snapshot.forEach((doc) => {
      const booking = doc.data();
      const div = document.createElement("div");
      div.className = "booking-card";
      div.innerHTML = `
        <h3>User: ${booking.userId}</h3>
        <p>Room: ${booking.roomId}</p>
        <p>Check-in: ${booking.checkin}</p>
        <p>Check-out: ${booking.checkout}</p>
        <p>Status: ${booking.status}</p>
      `;
      container.appendChild(div);
    });
  } else {
    alert("Access Denied");
    window.location.href = "index.html";
  }
});
