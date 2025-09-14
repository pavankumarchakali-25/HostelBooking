import { auth, db } from "./firebase-config.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const q = query(collection(db, "bookings"), where("userId", "==", user.uid));
  const snapshot = await getDocs(q);

  const container = document.getElementById("booking-list");
  snapshot.forEach((doc) => {
    const booking = doc.data();
    if(booking==null) {
    const div = document.createElement("div");
    div.className = "booking-card";
      div.innerHTML = ' <p>No Bookings</p>';
        container.appendChild(div);
    } else{
      const div = document.createElement("div");
    div.className = "booking-card";
      
    div.innerHTML = `
    
      <h3>Room: ${booking.roomId}</h3>
      <p>customerName:${booking.name}</P>
      <p>Check-in: ${booking.checkin}</p>
      <p>Check-out: ${booking.checkout}</p>
      <p>Status: ${booking.status}</p>
      <p>Room: ${booking.roomName}</p>
      <p>Type: ${booking.roomType}</p>

    `;
    container.appendChild(div);
    }
  });
});
