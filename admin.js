import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { 
  doc, getDoc, collection, getDocs, updateDoc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userDoc = await getDoc(doc(db, "users", user.uid));

  if (userDoc.exists() && userDoc.data().role === "admin") {
    const snapshot = await getDocs(collection(db, "bookings"));
    const container = document.getElementById("admin-bookings");

    if (snapshot.empty) {
      container.innerHTML = "<p>No bookings found</p>";
      return;
    }

    // Convert snapshot to array
    const bookings = [];
    snapshot.forEach((docSnap) => {
      bookings.push({ id: docSnap.id, ...docSnap.data() });
    });

    // Sort checkout requests first
    bookings.sort((a, b) => {
      if (a.status === "checkout-requested" && b.status !== "checkout-requested") return -1;
      if (a.status !== "checkout-requested" && b.status === "checkout-requested") return 1;
      return 0;
    });

    // Render bookings
    bookings.forEach((booking) => {
      const div = document.createElement("div");
      div.className = "booking-card";

      div.innerHTML = `
        <h3>User: ${booking.userName || booking.userEmail}</h3>
        <p>Room: ${booking.roomName || booking.roomId}</p>
        <p>Check-in: ${booking.checkin}</p>
        <p>Check-out: ${booking.checkout}</p>
        <p>Status: <strong>${booking.status}</strong></p>
      `;

      // set this to your actual rooms collection name: "room" or "rooms"
const ROOMS_COLLECTION = "room"; // <-- change if needed

if (booking.status === "checkout-requested") {
  const btn = document.createElement("button");
  btn.innerText = "Approve Checkout ✅";
  btn.onclick = async () => {
    btn.disabled = true;
    btn.innerText = "Processing...";

    try {
      console.log("Attempting to approve checkout for booking:", booking.id, "roomId:", booking.roomId);

      // 1) Ensure booking exists
      const bookingRef = doc(db, "bookings", booking.id);
      const bookingSnap = await getDoc(bookingRef);
      if (!bookingSnap.exists()) {
        throw new Error("Booking doc not found");
      }

      // 2) Check room doc exists
      if (!booking.roomId) {
        throw new Error("booking.roomId missing");
      }
      const roomRef = doc(db, ROOMS_COLLECTION, booking.roomId);
      const roomSnap = await getDoc(roomRef);
      if (!roomSnap.exists()) {
        throw new Error(`Room doc not found at ${ROOMS_COLLECTION}/${booking.roomId}`);
      }

      // 3) Update booking status
      await updateDoc(bookingRef, { status: "checked-out" });
      console.log("Booking status updated");

      // 4) Update room availability
      await updateDoc(roomRef, { available: true });
      console.log(`Room ${booking.roomId} set to available: true`);

      // 5) Update UI (no reload)
      alert(`✅ Checkout approved for ${booking.userName || booking.userEmail}`);
      const statusEl = div.querySelector("p strong");
      if (statusEl) statusEl.textContent = "checked-out";
      btn.remove();

    } catch (err) {
      console.error("Approve checkout error:", err);
      alert("Error approving checkout: " + (err.message || err));
      btn.disabled = false;
      btn.innerText = "Approve Checkout ✅";
    }
  };
  div.appendChild(btn);
}

      // ✅ Delete booking button
      const deleteBtn = document.createElement("button");
      deleteBtn.innerText = "Delete Booking ❌";
      deleteBtn.style.marginLeft = "10px";
      deleteBtn.onclick = async () => {
        if (confirm("Are you sure you want to delete this booking?")) {
          await deleteDoc(doc(db, "bookings", booking.id));
          alert("Booking deleted");
          window.location.reload();
        }
      };
      div.appendChild(deleteBtn);

      container.appendChild(div);
    });
  } else {
    alert("Access Denied");
    window.location.href = "index.html";
  }
});
