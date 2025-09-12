import { db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const roomDetails = document.getElementById("room-details");
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("id");

async function loadRoom() {
  const roomRef = doc(db, "rooms", roomId);
  const roomSnap = await getDoc(roomRef);

  if (roomSnap.exists()) {
    const room = roomSnap.data();
    roomDetails.innerHTML = `
      <h2>${room.name}</h2>
      <p>Type: ${room.type}</p>
      <p>Price: ₹${room.price}</p>
      <p>Capacity: ${room.capacity}</p>
      <p>Status: ${room.available ? "✅ Available" : "❌ Booked"}</p>
      <a class="btn" href="booking.html?id=${roomId}">Book Now</a>
      <a class="back-btn" href="index.html">⬅ Back</a>
    `;
  } else {
    roomDetails.innerHTML = "<p>Room not found.</p>";
  }
}

loadRoom();
