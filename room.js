import { db } from "./firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("id");

const roomDoc = await getDoc(doc(db, "rooms", roomId));

if (roomDoc.exists()) {
  const room = roomDoc.data();
  const detailsDiv = document.getElementById("room-details");
  detailsDiv.innerHTML = `
    <h2>${room.hostel} (${room.room_type})</h2>
    <p>Location: ${room.location}</p>
    <p>Price: ₹${room.price_per_night}</p>
    <p>Facilities: ${room.facilities.join(", ")}</p>
    <a href="booking.html?roomId=${roomDoc.id}">Book Now</a>
  `;
}
