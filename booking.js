import { auth, db } from "./firebase-config.js";
import { addDoc, collection,updateDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("id");

document.getElementById("booking-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const checkin = document.getElementById("checkin").value;
  const checkout = document.getElementById("checkout").value;

  const user = auth.currentUser;
  if (!user) {
    alert("Please login to book.");
    window.location.href = "login.html";
    return;
  }

  try {
    // ✅ Fetch the room first
    const roomRef = doc(db, "room", roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      alert("❌ Room not found!");
      return;
    }

    const room = roomSnap.data();

    // ✅ Add booking with room details
    await addDoc(collection(db, "bookings"), {
      userId: user.uid,
      userName: user.displayName || user.email.split("@")[0], // fallback if no displayName
  userEmail: user.email,
      roomId,
      roomName: room.name || "Unnamed Room",
      roomType: room.type || "N/A",
      checkin,
      checkout,
      status: "confirmed",
      createdAt: new Date()
    });

    await updateDoc(roomRef, {
      available: false
    });

    alert(`✅ Booking confirmed for ${room.name}`);
    window.location.href = "dashboard.html";

  } catch (err) {
    console.error("🔥 Error booking room:", err);
    alert("⚠️ Error booking room. Check console.");
  }
});
