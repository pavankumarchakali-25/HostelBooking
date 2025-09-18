import { auth, db } from "./firebase-config.js";
import { doc, getDoc, addDoc, collection, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// Get data passed from the booking page via the URL
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("id");
const checkin = urlParams.get("checkin");
const checkout = urlParams.get("checkout");

const summaryContainer = document.getElementById("payment-summary");

// --- 1. Load Room Details and Calculate Price ---
async function loadPaymentSummary() {
  if (!roomId || !checkin || !checkout) {
    summaryContainer.innerHTML = "<p>Error: Missing booking details.</p>";
    return;
  }

  try {
    const roomRef = doc(db, "room", roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      summaryContainer.innerHTML = "<p>Error: Room not found.</p>";
      return;
    }

    const room = roomSnap.data();

    // Calculate number of nights
    const date1 = new Date(checkin);
    const date2 = new Date(checkout);
    const diffTime = Math.abs(date2 - date1);
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calculate costs
    const basePrice = room.price * nights;
    const tax = basePrice * 0.18; // 18% tax
    const totalPrice = basePrice + tax;

    // Display summary on the page
    summaryContainer.innerHTML = `
      <div class="summary-card">
        <h2>Booking Summary</h2>
        <p><strong>Room:</strong> ${room.name}</p>
        <p><strong>Check-in:</strong> ${checkin}</p>
        <p><strong>Check-out:</strong> ${checkout}</p>
        <hr style="margin: 20px 0; border-color: var(--border-color);">
        <div class="price-details">
          <p><span>Price for ${nights} night(s)</span> <span>₹${basePrice.toFixed(2)}</span></p>
          <p><span>GST (18%)</span> <span>₹${tax.toFixed(2)}</span></p>
          <p class="total"><span>Total Amount</span> <span>₹${totalPrice.toFixed(2)}</span></p>
        </div>
        <button id="pay-btn">Pay Now & Confirm Booking</button>
      </div>
    `;

    // Add event listener to the "Pay Now" button AFTER it's created
    document.getElementById("pay-btn").addEventListener("click", () => confirmBooking(room));

  } catch (error) {
    console.error("Error loading summary:", error);
    summaryContainer.innerHTML = "<p>Could not load payment details. Please try again.</p>";
  }
}

// --- 2. Confirm Booking after 'Payment' ---
async function confirmBooking(room) {
  const payBtn = document.getElementById("pay-btn");
  payBtn.disabled = true;
  payBtn.textContent = "Processing...";

  const user = auth.currentUser;
  if (!user) {
    alert("Please login to book.");
    window.location.href = "login.html";
    return;
  }

  try {
    // Add booking to the 'bookings' collection
    await addDoc(collection(db, "bookings"), {
      userId: user.uid,
      userName: user.displayName || user.email.split("@")[0],
      userEmail: user.email,
      roomId,
      roomName: room.name,
      roomType: room.type,
      checkin,
      checkout,
      status: "confirmed",
      createdAt: new Date()
    });

    // Mark the room as unavailable
    const roomRef = doc(db, "room", roomId);
    await updateDoc(roomRef, {
      available: false
    });

    alert(`✅ Booking confirmed for ${room.name}`);
    window.location.href = "dashboard.html";

  } catch (err) {
    console.error("🔥 Error confirming booking:", err);
    alert("⚠️ Error booking room. Please try again.");
    payBtn.disabled = false;
    payBtn.textContent = "Pay Now & Confirm Booking";
  }
}

// Load the summary when the page opens
loadPaymentSummary();
