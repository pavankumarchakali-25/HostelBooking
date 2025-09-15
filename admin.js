import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { 
  doc, getDoc, collection, getDocs, updateDoc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// set this to your actual rooms collection name: "room" or "rooms"
const ROOMS_COLLECTION = "room"; // <-- change to "rooms" if needed

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

      // ✅ Checkout approval button
      if (booking.status === "checkout-requested") {
        const btn = document.createElement("button");
        btn.innerText = "Approve Checkout ✅";

        btn.onclick = async () => {
          btn.disabled = true;
          btn.innerText = "Processing...";

          try {
            // Booking ref
            const bookingRef = doc(db, "bookings", booking.id);

            // Room ref
            if (!booking.roomId) throw new Error("No roomId in booking");
            const roomRef = doc(db, ROOMS_COLLECTION, booking.roomId);

            // Update booking status
            await updateDoc(bookingRef, { status: "checked-out" });

            // Update room availability
            await updateDoc(roomRef, { available: true });

            // Update UI instantly
            const statusEl = div.querySelector("p strong");
            if (statusEl) statusEl.textContent = "checked-out";

            btn.remove(); // remove approve button
            alert(`✅ Checkout approved for ${booking.userName || booking.userEmail}`);
          } catch (err) {
            console.error("Checkout approval error:", err);
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
          div.remove(); // remove from UI instantly
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
