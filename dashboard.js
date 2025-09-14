import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { collection, query, where, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // 🔍 Get all bookings for this user
  const q = query(collection(db, "bookings"), where("userId", "==", user.uid));
  const snapshot = await getDocs(q);

  const container = document.getElementById("booking-list");

  if (snapshot.empty) {
    container.innerHTML = "<p>No bookings found</p>";
    return;
  }

  snapshot.forEach((docSnap) => {
    const booking = docSnap.data();
    const div = document.createElement("div");
    div.className = "booking-card";

    div.innerHTML = `
      <h3>Room: ${booking.roomName || booking.roomId}</h3>
      <p>Customer: ${booking.userName || booking.userEmail}</p>
      <p>Check-in: ${booking.checkin}</p>
      <p>Check-out: ${booking.checkout}</p>
      <p>Status: ${booking.status}</p>
      <p>Type: ${booking.roomType}</p>
    `;

    // ✅ If booking is active → allow checkout request
    if (booking.status === "confirmed") {
      const btn = document.createElement("button");
      btn.innerText = "Request Checkout";
      btn.onclick = async () => {
        await updateDoc(doc(db, "bookings", docSnap.id), {
          status: "checkout-requested"
        });
        alert("✅ Checkout request sent to admin.");
        window.location.reload();
      };
      div.appendChild(btn);
    }

    container.appendChild(div);
  });
});
