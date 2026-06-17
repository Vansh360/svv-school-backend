// import express from "express";
// import cors from "cors";
// import { db } from "./db.js";

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Test API
// app.get("/", (req, res) => {
//   res.send("Backend is running");
// });

// // Admission form API
// app.post("/api/admission", (req, res) => {
//   console.log("Received body:", req.body);

//   const { name, email, phone, message } = req.body;

//   const sql =
//     "INSERT INTO admissions (name, email, phone, message) VALUES (?, ?, ?, ?)";

//   db.query(sql, [name, email, phone, message], (err, result) => {
//     if (err) {
//       console.error("DB Error:", err);
//       return res.status(500).json({ error: err });
//     }
//     res.status(200).json({ success: true });
//   });
// });

// // Admin: get all admissions
// app.get("/api/admissions", (req, res) => {
//   db.query("SELECT * FROM admissions", (err, data) => {
//     if (err) return res.status(500).json(err);
//     res.json(data);
//   });
// });

// app.listen(5000, () => {
//   console.log("Server running on port 5000");
// });

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

// 🔴 Paste your Neon connection string here
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.connect()
  .then(() => console.log("Database Connected ✅"))
  .catch(err => console.error("Database Connection Error ❌", err));

// Test route
app.get("/", (req, res) => {
  res.send("Server running ✅");
});

// Create table automatically (first time only)
pool.query(`
  CREATE TABLE IF NOT EXISTS admissions (
  id SERIAL PRIMARY KEY,
  application_id VARCHAR(50),
  name VARCHAR(100),
  gender VARCHAR(20),
  dob DATE,
  course VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  stream VARCHAR(50),
  address TEXT,
  status VARCHAR(20),
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`);

// Ensure existing table has the new columns
pool.query(`
  ALTER TABLE admissions
    ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
    ADD COLUMN IF NOT EXISTS dob DATE,
    ADD COLUMN IF NOT EXISTS course VARCHAR(100),
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS status VARCHAR(20);
`);

// POST admission
app.post("/api/admission", async (req, res) => {
  const {
    name,
    gender,
    dob,
    course,
    stream,
    phone,
    email,
    address,
    status,
    message
  } = req.body;

  const applicationId =
    "ADM" + Math.floor(100000 + Math.random() * 900000);

  try {
    await pool.query(
      `INSERT INTO admissions
       (application_id, name, gender, dob, course, email, phone, stream, address, status, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [applicationId, name, gender, dob, course, email, phone, stream, address, status, message]
    );

    res.status(200).json({
      message: "Saved successfully",
      applicationId,
    });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// GET admissions (for admin)
app.get("/api/admissions", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM admissions ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// DELETE admission by id
app.delete("/api/admissions/:id", async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM admissions WHERE id = $1",
      [req.params.id]
    );

    res.json({ message: "Admission deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});