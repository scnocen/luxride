const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const db = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname)));

// Home route -> index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Fallback cars if database fails
const fallbackCars = [
  {
    id: 1,
    name: "BMW M4",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80",
    price_per_day: 120,
    transmission: "Automatic",
    fuel: "Petrol",
    seats: 4,
    category: "Sport"
  },
  {
    id: 2,
    name: "Mercedes C-Class",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    price_per_day: 100,
    transmission: "Automatic",
    fuel: "Petrol",
    seats: 5,
    category: "Luxury"
  },
  {
    id: 3,
    name: "Audi A6",
    image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80",
    price_per_day: 110,
    transmission: "Automatic",
    fuel: "Petrol",
    seats: 5,
    category: "Luxury"
  }
];

// Get all cars
app.get("/api/cars", (req, res) => {
  db.query("SELECT * FROM cars", (err, results) => {
    if (err) {
      console.error("DB error on /api/cars:", err.message);
      return res.json(fallbackCars);
    }
    res.json(results);
  });
});

// Get single car by name
app.get("/api/cars/:name", (req, res) => {
  const carName = req.params.name.replace(/-/g, " ");

  db.query(
    "SELECT * FROM cars WHERE LOWER(name) = LOWER(?)",
    [carName],
    (err, results) => {
      if (err) {
        console.error("DB error on /api/cars/:name:", err.message);

        const car = fallbackCars.find(
          (c) => c.name.toLowerCase() === carName.toLowerCase()
        );

        if (!car) {
          return res.status(404).json({ error: "Car not found" });
        }

        return res.json(car);
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Car not found" });
      }

      res.json(results[0]);
    }
  );
});

// Save booking
app.post("/api/bookings", (req, res) => {
  const { car_name, customer_name, phone, pickup_date, return_date } = req.body;

  if (!car_name || !customer_name || !phone || !pickup_date || !return_date) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const sql = `
    INSERT INTO bookings (car_name, customer_name, phone, pickup_date, return_date)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [car_name, customer_name, phone, pickup_date, return_date],
    (err, result) => {
      if (err) {
        console.error("DB error on /api/bookings:", err.message);
        return res.json({
          message: "Booking received in demo mode",
          bookingId: Math.floor(Math.random() * 100000)
        });
      }

      res.json({
        message: "Booking saved successfully",
        bookingId: result.insertId
      });
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});