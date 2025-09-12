import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const container = document.getElementById("room-list");

const querySnapshot = await getDocs(collection(db, "rooms"));
querySnapshot.forEach((doc) => {
  const room = doc.data();
  const div = document.createElement("div");
  div.className = "room-card";
  div.innerHTML = `
    <h3>${room.hostel} - ${room.room_type}</h3>
    <p>Price: ₹${room.price_per_night}</p>
    <p>Facilities: ${room.facilities.join(", ")}</p>
    <a href="room.html?id=${doc.id}">View Details</a>
  `;
  container.appendChild(div);
});
