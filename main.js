import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const roomList = document.getElementById("room-list");

async function loadRooms() {
  const querySnapshot = await getDocs(collection(db, "rooms"));
  roomList.innerHTML = "";
  querySnapshot.forEach((doc) => {
    const room = doc.data();
    roomList.innerHTML += `
      <div class="room-card">
        <h3>${room.name} - ${room.type}</h3>
        <p>Price: ₹${room.price} per night</p>
        <p>Capacity: ${room.capacity} persons</p>
        <p>Status: ${room.available ? "✅ Available" : "❌ Booked"}</p>
        <a class="btn" href="room.html?id=${doc.id}">View Details</a>
      </div>
    `;
  });
}

loadRooms();
