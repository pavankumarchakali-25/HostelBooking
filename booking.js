// The NEW booking.js

// This event listener will now redirect to the payment page
document.getElementById("booking-form").addEventListener("submit", (e) => {
  e.preventDefault();

  // Get the room ID from the current URL
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get("id");

  // Get the dates from the form
  const checkin = document.getElementById("checkin").value;
  const checkout = document.getElementById("checkout").value;

  // Validate dates
  if (new Date(checkout) <= new Date(checkin)) {
    alert("Check-out date must be after the check-in date.");
    return;
  }

  // Redirect to the payment page, passing the data in the URL
  window.location.href = `payment.html?id=${roomId}&checkin=${checkin}&checkout=${checkout}`;
});
