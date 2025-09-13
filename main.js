import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const roomsList = document.getElementById("room-list");

async function loadRooms() {
  try {
    const querySnapshot = await getDocs(collection(db, "rooms"));
    roomsList.innerHTML = "";
    querySnapshot.forEach((doc) => {
      const room = doc.data();
      roomsList.innerHTML += `
        <div class="room-card">
          <h3>${room.name}</h3>
          <p>${room.description}</p>
          <p>Price: ${room.price}</p>
          <a class="btn" href="room.html?id=${doc.id}">View Details</a>
        </div>
      `;
    });
  } catch (error) {
    console.error("Error loading rooms:", error);
  }
}

loadRooms();
