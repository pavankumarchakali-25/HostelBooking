import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { 
  doc, getDoc, collection, getDocs, updateDoc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const ROOMS_COLLECTION = "room"; // change if plural
let allBookings = []; // store all bookings for searching

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

    // Store all bookings
    allBookings = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    // Sort checkout requests first
    allBookings.sort((a, b) => {
      if (a.status === "checkout-requested" && b.status !== "checkout-requested") return -1;
      if (a.status !== "checkout-requested" && b.status === "checkout-requested") return 1;
      return 0;
    });

    renderBookings(allBookings);
  } else {
    alert("Access Denied");
    window.location.href = "index.html";
  }
});

function renderBookings(bookings) {
  const container = document.getElementById("admin-bookings");
  container.innerHTML = ""; // clear old list

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

    // ✅ Approve checkout button
    if (booking.status === "checkout-requested") {
      const btn = document.createElement("button");
      btn.innerText = "Approve Checkout ✅";
      btn.onclick = async () => {
        btn.disabled = true;
        btn.innerText = "Processing...";
        try {
          const bookingRef = doc(db, "bookings", booking.id);
          await updateDoc(bookingRef, { status: "checked-out" });

          if (booking.roomId) {
            const roomRef = doc(db, ROOMS_COLLECTION, booking.roomId);
            await updateDoc(roomRef, { available: true });
          }

          const statusEl = div.querySelector("p strong");
          if (statusEl) statusEl.textContent = "checked-out";
          btn.remove();

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
        div.remove();
        alert("Booking deleted");
      }
    };
    div.appendChild(deleteBtn);

    container.appendChild(div);
  });
}

// ✅ Search Function
document.getElementById("search-btn").addEventListener("click", () => {
  const query = document.getElementById("search-input").value.trim().toLowerCase();

  if (!query) {
    renderBookings(allBookings); // show all if empty
    return;
  }

  const filtered = allBookings.filter(b =>
    (b.userName || b.userEmail || "")
      .toLowerCase()
      .includes(query)
  );

  renderBookings(filtered);
});
