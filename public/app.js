const API_URL = '/api';
let authToken = localStorage.getItem('token') || null;
let currentUser = JSON.parse(localStorage.getItem('user')) || null;

// DOM Elements
const authNav = document.getElementById('authNav');
const listingsGrid = document.getElementById('listingsGrid');
const historySection = document.getElementById('historySection');
const historyTableBody = document.getElementById('historyTableBody');

// Auth UI State Update
function updateUI() {
  if (authToken && currentUser) {
    authNav.innerHTML = `
      <span style="font-weight:700; align-self:center;">Hello, ${currentUser.name}</span>
      <button class="btn btn-secondary" onclick="logout()">Logout</button>
    `;
    historySection.style.display = 'block';
    loadHistory();
  } else {
    authNav.innerHTML = `
      <button class="btn btn-secondary" onclick="openModal('loginModal')">Login</button>
      <button class="btn btn-primary" onclick="openModal('registerModal')">Sign Up</button>
    `;
    historySection.style.display = 'none';
  }
}

// Fetch & Search Listings
async function executeSearch() {
  const type = document.getElementById('searchType').value;
  const location = document.getElementById('searchLocation').value;

  const res = await fetch(`${API_URL}/search?type=${type}&location=${location}`);
  const data = await res.json();

  listingsGrid.innerHTML = '';
  if (data.length === 0) {
    listingsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align:center;">No flights or hotels found.</p>`;
    return;
  }

  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${item.image}" class="card-img" alt="${item.title}">
      <div class="card-body">
        <span class="badge">${item.type}</span>
        <h3 class="card-title">${item.title}</h3>
        <p style="font-size:0.8rem; color: var(--text-muted);"><i class="fa-solid fa-location-dot"></i> ${item.location}</p>
        <div class="card-price">$${item.price}</div>
        <button class="btn btn-primary full-width" onclick="startBooking('${item._id}', '${item.title}', ${item.price})">Book Now</button>
      </div>
    `;
    listingsGrid.appendChild(card);
  });
}

// Booking Modal Handler
function startBooking(id, title, price) {
  if (!authToken) {
    alert('Please login first to make a reservation.');
    openModal('loginModal');
    return;
  }
  document.getElementById('checkoutListingId').value = id;
  document.getElementById('checkoutTitle').value = title;
  document.getElementById('checkoutPrice').value = price;
  document.getElementById('checkoutTotal').innerText = `$${price}`;
  openModal('checkoutModal');
}

// Submit Checkout Form
document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    listingId: document.getElementById('checkoutListingId').value,
    bookingDate: document.getElementById('checkoutDate').value,
    totalAmount: Number(document.getElementById('checkoutPrice').value),
    cardNumber: document.getElementById('cardNumber').value
  };

  const res = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (res.ok) {
    alert('Payment Successful & Booking Confirmed!');
    closeModal('checkoutModal');
    loadHistory();
  } else {
    alert(data.message);
  }
});

// Load History
async function loadHistory() {
  const res = await fetch(`${API_URL}/bookings/my-history`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  const data = await res.json();

  historyTableBody.innerHTML = '';
  data.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><b>${item.listingId ? item.listingId.title : 'N/A'}</b></td>
      <td><span class="badge">${item.listingId ? item.listingId.type : ''}</span></td>
      <td>${item.bookingDate}</td>
      <td>$${item.totalAmount}</td>
      <td><span style="color:var(--emerald); font-weight:700;">${item.paymentStatus}</span></td>
    `;
    historyTableBody.appendChild(row);
  });
}

// Register & Login Logic
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;

  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json();
  alert(data.message);
  if (res.ok) closeModal('registerModal');
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (res.ok) {
    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(currentUser));
    updateUI();
    closeModal('loginModal');
  } else {
    alert(data.message);
  }
});

function logout() {
  localStorage.clear();
  authToken = null;
  currentUser = null;
  updateUI();
}

// Modal Toggle Helpers
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

// Init
updateUI();
executeSearch();