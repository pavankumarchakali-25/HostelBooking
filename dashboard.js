import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const q = query(collection(db, "bookings"), where("userId", "==", user.uid));
  const snapshot = await getDocs(q);

  const container = document.getElementById("booking-list");

  if (snapshot.empty) {
    container.innerHTML = "<p>No bookings found</p>";
    return;
  }

  snapshot.forEach((doc) => {
    const booking = doc.data();
    const div = document.createElement("div");
    div.className = "booking-card";

    div.innerHTML = `
      <h3>Room: ${booking.roomName}</h3>
      <p>Customer: ${booking.userName}</p>
      <p>Check-in: ${booking.checkin}</p>
      <p>Check-out: ${booking.checkout}</p>
      <p>Status: ${booking.status}</p>
      <p>Type: ${booking.roomType}</p>
    `;

    container.appendChild(div);
  });
});
