const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

let listings = [
  { _id: "1", type: 'flight', title: 'Emirates DXB -> LHR', location: 'London', price: 450, rating: 4.8, image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800' },
  { _id: "2", type: 'flight', title: 'Qatar Airways DOH -> JFK', location: 'New York', price: 620, rating: 4.9, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800' },
  { _id: "3", type: 'hotel', title: 'Grand Hyatt Resort', location: 'Dubai', price: 210, rating: 4.7, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800' },
  { _id: "4", type: 'hotel', title: 'The Ritz-Carlton', location: 'Paris', price: 380, rating: 4.9, image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800' }
];

let bookings = [];

app.get('/api/search', (req, res) => {
  const { type, location } = req.query;
  let filtered = listings;
  if (type && type !== 'all') filtered = filtered.filter(item => item.type === type);
  if (location) filtered = filtered.filter(item => item.location.toLowerCase().includes(location.toLowerCase()));
  res.json(filtered);
});

app.post('/api/auth/register', (req, res) => res.json({ message: 'Registration Successful! Now Login.' }));
app.post('/api/auth/login', (req, res) => {
  res.json({ token: 'mock-jwt-token', user: { name: req.body.email.split('@')[0] || 'User', email: req.body.email } });
});

app.post('/api/bookings', (req, res) => {
  const { listingId, bookingDate, totalAmount } = req.body;
  const found = listings.find(l => l._id === listingId);
  const newBooking = { listingId: found, bookingDate, totalAmount, paymentStatus: 'Paid' };
  bookings.push(newBooking);
  res.json({ message: 'Booking Confirmed!', booking: newBooking });
});

app.get('/api/bookings/my-history', (req, res) => res.json(bookings));

app.listen(5000, () => console.log('Server active on http://localhost:5000'));