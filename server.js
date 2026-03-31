const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("🔥 LuxRide backend is running");
});

// Get all cars
app.get("/api/cars", (req, res) => {
  db.query("SELECT * FROM cars", (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    } else {
      res.json(results);
    }
  });
});

// 🔥 Get single car by name (NEW)
app.get("/api/cars/:name", (req, res) => {
  const carName = req.params.name.replace(/-/g, " ");

  db.query(
    "SELECT * FROM cars WHERE LOWER(name) = LOWER(?)",
    [carName],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Car not found" });
      }

      res.json(results[0]);
    }
  );
});

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
        console.error(err);
        return res.status(500).json({ error: "Database error" });
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
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});