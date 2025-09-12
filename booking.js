import { auth, db } from "./firebase-config.js";
import { addDoc, collection } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("roomId");

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
    await addDoc(collection(db, "bookings"), {
      userId: user.uid,
      roomId,
      checkin,
      checkout,
      status: "confirmed",
      createdAt: new Date()
    });
    alert("Booking Confirmed!");
    window.location.href = "dashboard.html";
  } catch (err) {
    alert(err.message);
  }
});
