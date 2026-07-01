// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const { Pool } = require("pg");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use("/uploads", express.static("uploads"));

// // ── Validate env ──
// if (!process.env.DATABASE_URL) {
//   console.error("❌ DATABASE_URL is missing from .env file!");
//   process.exit(1);
// }

// // ── Pool ──
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false },
//   connectionTimeoutMillis: 10000,
//   idleTimeoutMillis: 30000,
//   max: 10,
// });

// // ── Test connection on startup ──
// pool.connect((err, client, release) => {
//   if (err) {
//     console.error("❌ Database Connection Error:", err.message);
//     console.error("   Check your DATABASE_URL in .env");
//   } else {
//     console.log("✅ Database Connected Successfully");
//     release();
//   }
// });

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const dir = "uploads";

//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir);
//     }

//     cb(null, dir);
//   },

//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const upload = multer({ storage });


// // ── Create all tables ──
// async function initDB() {
//   try {
//     await pool.query(`
//       CREATE TABLE IF NOT EXISTS admissions (
//         id SERIAL PRIMARY KEY,
//         application_id VARCHAR(50),
//         name VARCHAR(100),
//         gender VARCHAR(20),
//         dob DATE,
//         course VARCHAR(100),
//         email VARCHAR(100),
//         phone VARCHAR(20),
//         stream VARCHAR(50),
//         address TEXT,
//         status VARCHAR(20),
//         message TEXT,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `);

//     await pool.query(`
//       ALTER TABLE admissions
//         ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
//         ADD COLUMN IF NOT EXISTS dob DATE,
//         ADD COLUMN IF NOT EXISTS course VARCHAR(100),
//         ADD COLUMN IF NOT EXISTS address TEXT,
//         ADD COLUMN IF NOT EXISTS status VARCHAR(20)
//     `);

//     await pool.query(`
//       CREATE TABLE IF NOT EXISTS students (
//         id SERIAL PRIMARY KEY,
//         roll_no VARCHAR(50) UNIQUE NOT NULL,
//         student_name VARCHAR(200),
//         father_name VARCHAR(200),
//         gender VARCHAR(20),
//         dob DATE,
//         class VARCHAR(50),
//         stream VARCHAR(100),
//         photo_url TEXT,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `);
//     pool.query(`
// CREATE TABLE IF NOT EXISTS gallery(
//     id SERIAL PRIMARY KEY,
//     image_url TEXT NOT NULL,
//     uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// )
// `);

//     await pool.query(`
//       ALTER TABLE students
//         ADD COLUMN IF NOT EXISTS father_name VARCHAR(200),
//         ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
//         ADD COLUMN IF NOT EXISTS dob DATE
//     `);

//     await pool.query(`
//       CREATE TABLE IF NOT EXISTS marks (
//         id SERIAL PRIMARY KEY,
//         roll_no VARCHAR(50) NOT NULL,
//         exam_name VARCHAR(100),
//         subject VARCHAR(150),
//         marks INTEGER,
//         max_marks INTEGER DEFAULT 100,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `);


//     console.log("✅ All tables ready");
//   } catch (err) {
//     console.error("❌ Table init error:", err.message);
//   }
// }

// initDB();

// // ═══════════════════════════════════════
// //  ROUTES
// // ═══════════════════════════════════════

// // Health check
// app.get("/", (req, res) => res.send("Server running ✅"));
// app.get("/api/gallery", async (req, res) => {

//     const result = await pool.query(

//         "SELECT * FROM gallery ORDER BY id DESC"

//     );

//     res.json(result.rows);

// });
// // ── POST admission ──
// app.post("/api/admission", async (req, res) => {
//   const { name, gender, dob, course, stream, phone, email, address, status, message } = req.body;
//   const applicationId = "ADM" + Math.floor(100000 + Math.random() * 900000);
//   try {
//     await pool.query(
//       `INSERT INTO admissions
//         (application_id, name, gender, dob, course, email, phone, stream, address, status, message)
//        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
//       [applicationId, name, gender, dob || null, course, email, phone, stream, address, status, message]
//     );
//     res.status(200).json({ message: "Saved successfully", applicationId });
//   } catch (err) {
//     console.error("DB Error:", err.message);
//     res.status(500).json({ error: "Database error" });
//   }
// });

// // ── GET admissions ──
// app.get("/api/admissions", async (req, res) => {
//   try {
//     const result = await pool.query("SELECT * FROM admissions ORDER BY id DESC");
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ error: "Database error" });
//   }
// });

// // ── DELETE admission ──
// app.delete("/api/admissions/:id", async (req, res) => {
//   try {
//     await pool.query("DELETE FROM admissions WHERE id = $1", [req.params.id]);
//     res.json({ message: "Deleted successfully" });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ error: "Database error" });
//   }
// });

// // ── POST student (upsert) ──
// app.post("/api/students", async (req, res) => {
//   const { rollno, name, father_name, gender, dob, class: cls, stream, photo } = req.body;
//   if (!rollno || !name) return res.status(400).json({ error: "rollno and name are required" });
//   try {
//     await pool.query(
//       `INSERT INTO students (roll_no, student_name, father_name, gender, dob, class, stream, photo_url)
//        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
//        ON CONFLICT (roll_no) DO UPDATE SET
//          student_name = EXCLUDED.student_name,
//          father_name  = EXCLUDED.father_name,
//          gender       = EXCLUDED.gender,
//          dob          = EXCLUDED.dob,
//          class        = EXCLUDED.class,
//          stream       = EXCLUDED.stream,
//          photo_url    = EXCLUDED.photo_url`,
//       [rollno, name, father_name || null, gender || null, dob || null, cls || null, stream || null, photo || null]
//     );
//     res.json({ success: true });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ error: "Database error" });
//   }
// });

// // ── GET student by roll number ──
// app.get("/api/students/:rollno", async (req, res) => {
//   const roll = req.params.rollno.trim();
//   try {
//     const result = await pool.query(
//       `SELECT roll_no AS roll_no, student_name AS student_name, father_name, gender, dob::text AS dob, class AS class_name, stream, photo_url
//        FROM students WHERE roll_no = $1`,
//       [roll]
//     );
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "Student not found" });
//     }
//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ error: "Database error" });
//   }
// });

// // ── GET all students ──
// app.get("/api/students", async (req, res) => {
//   try {
//     const result = await pool.query(
//       "SELECT roll_no AS rollno, student_name AS name, class, stream, photo_url AS photo FROM students ORDER BY roll_no"
//     );
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ error: "Database error" });
//   }
// });
// app.delete("/api/gallery/:id", async (req, res) => {

//     await pool.query(

//         "DELETE FROM gallery WHERE id=$1",

//         [req.params.id]

//     );

//     res.json({

//         success: true

//     });

// });
// // ── DELETE student ──
// app.delete("/api/students/:rollno", async (req, res) => {
//   try {
//     await pool.query("DELETE FROM students WHERE roll_no = $1", [req.params.rollno]);
//     res.json({ message: "Student deleted" });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ error: "Database error" });
//   }
// });

// // ── POST marks (bulk upsert by roll + exam + subject) ──
// app.post("/api/marks", async (req, res) => {
//   const { rollno, exam, subjects } = req.body;
//   if (!rollno || !Array.isArray(subjects) || subjects.length === 0) {
//     return res.status(400).json({ error: "rollno and subjects[] are required" });
//   }
//   const client = await pool.connect();
//   try {
//     await client.query("BEGIN");
//     // Delete existing marks for this roll + exam first (clean overwrite)
//     await client.query(
//       "DELETE FROM marks WHERE roll_no = $1 AND exam_name = $2",
//       [rollno, exam || null]
//     );
//     for (const s of subjects) {
//       await client.query(
//         `INSERT INTO marks (roll_no, exam_name, subject, marks, max_marks)
//          VALUES ($1,$2,$3,$4,$5)`,
//         [rollno, exam || null, s.subject || "", parseInt(s.marks) || 0, parseInt(s.maxMarks || s.max_marks) || 100]
//       );
//     }
//     await client.query("COMMIT");
//     res.json({ success: true });
//   } catch (err) {
//     await client.query("ROLLBACK");
//     console.error(err.message);
//     res.status(500).json({ error: "Database error" });
//   } finally {
//     client.release();
//   }
// });

// // ── GET marks by roll number ──
// app.get("/api/marks/:rollno", async (req, res) => {
//   try {
//     const result = await pool.query(
//       `SELECT roll_no AS rollno, exam_name AS exam, subject, marks, max_marks
//        FROM marks WHERE roll_no = $1 ORDER BY exam_name, subject`,
//       [req.params.rollno]
//     );
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ error: "Database error" });
//   }
// });

// // ── GET student info + marks by roll (for Results page) ──
// app.get("/api/results/:rollno", async (req, res) => {
//   const roll = req.params.rollno.trim();
//   try {
//     const studentRes = await pool.query(
//       "SELECT roll_no AS rollno, student_name AS name, class, stream, photo_url AS photo FROM students WHERE roll_no = $1",
//       [roll]
//     );
//     if (studentRes.rows.length === 0) {
//       return res.status(404).json({ error: "Student not found" });
//     }
//     const marksRes = await pool.query(
//       "SELECT exam_name AS exam, subject, marks, max_marks FROM marks WHERE roll_no = $1 ORDER BY exam_name, subject",
//       [roll]
//     );
//     res.json({ student: studentRes.rows[0], marks: marksRes.rows });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ error: "Database error" });
//   }
// });


// app.post("/api/gallery", upload.single("image"), async (req, res) => {

//     try {

//         const imageUrl =
//             `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

//         const result = await pool.query(

//             "INSERT INTO gallery(image_url) VALUES($1) RETURNING *",

//             [imageUrl]

//         );

//         res.json(result.rows[0]);

//     } catch (err) {

//         console.error(err);

//         res.status(500).json({
//             error: err.message
//         });

//     }

// });

// const PORT = process.env.PORT || 5137;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const dir = "uploads";

//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir);
//     }

//     cb(null, dir);
//   },

//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   }
// });

// const upload = multer({ storage });


require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ── Validate env ──
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is missing from .env file!");
  process.exit(1);
}

// ── Pool ──
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
});

// ── Multer Configuration ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ── Test connection on startup ──
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Database Connection Error:", err.message);
    console.error("   Check your DATABASE_URL in .env");
  } else {
    console.log("✅ Database Connected Successfully");
    release();
  }
});

// ── Create all tables ──
async function initDB() {
  try {
    await pool.query(`
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

    await pool.query(`
      ALTER TABLE admissions
        ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
        ADD COLUMN IF NOT EXISTS dob DATE,
        ADD COLUMN IF NOT EXISTS course VARCHAR(100),
        ADD COLUMN IF NOT EXISTS address TEXT,
        ADD COLUMN IF NOT EXISTS status VARCHAR(20)
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        roll_no VARCHAR(50) UNIQUE NOT NULL,
        student_name VARCHAR(200),
        father_name VARCHAR(200),
        gender VARCHAR(20),
        dob DATE,
        class VARCHAR(50),
        stream VARCHAR(100),
        photo_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      ALTER TABLE students
        ADD COLUMN IF NOT EXISTS father_name VARCHAR(200),
        ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
        ADD COLUMN IF NOT EXISTS dob DATE
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS marks (
        id SERIAL PRIMARY KEY,
        roll_no VARCHAR(50) NOT NULL,
        exam_name VARCHAR(100),
        subject VARCHAR(150),
        marks INTEGER,
        max_marks INTEGER DEFAULT 100,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gallery (
        id SERIAL PRIMARY KEY,
        image_url TEXT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ All tables ready");
  } catch (err) {
    console.error("❌ Table init error:", err.message);
  }
}

initDB();

// ═══════════════════════════════════════
//  ROUTES
// ═══════════════════════════════════════

// Health check
app.get("/", (req, res) => res.send("Server running ✅"));

// ── POST admission ──
app.post("/api/admission", async (req, res) => {
  const { name, gender, dob, course, stream, phone, email, address, status, message } = req.body;
  const applicationId = "ADM" + Math.floor(100000 + Math.random() * 900000);
  try {
    await pool.query(
      `INSERT INTO admissions
        (application_id, name, gender, dob, course, email, phone, stream, address, status, message)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [applicationId, name, gender, dob || null, course, email, phone, stream, address, status, message]
    );
    res.status(200).json({ message: "Saved successfully", applicationId });
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// ── GET admissions ──
app.get("/api/admissions", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM admissions ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// ── DELETE admission ──
app.delete("/api/admissions/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM admissions WHERE id = $1", [req.params.id]);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// ── POST student (upsert) ──
app.post("/api/students", async (req, res) => {
  const { rollno, name, father_name, gender, dob, class: cls, stream, photo } = req.body;
  if (!rollno || !name) return res.status(400).json({ error: "rollno and name are required" });
  try {
    await pool.query(
      `INSERT INTO students (roll_no, student_name, father_name, gender, dob, class, stream, photo_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (roll_no) DO UPDATE SET
         student_name = EXCLUDED.student_name,
         father_name  = EXCLUDED.father_name,
         gender       = EXCLUDED.gender,
         dob          = EXCLUDED.dob,
         class        = EXCLUDED.class,
         stream       = EXCLUDED.stream,
         photo_url    = EXCLUDED.photo_url`,
      [rollno, name, father_name || null, gender || null, dob || null, cls || null, stream || null, photo || null]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// ── GET student by roll number ──
app.get("/api/students/:rollno", async (req, res) => {
  const roll = req.params.rollno.trim();
  try {
    const result = await pool.query(
      `SELECT roll_no AS roll_no, student_name AS student_name, father_name, gender, dob::text AS dob, class AS class_name, stream, photo_url
       FROM students WHERE roll_no = $1`,
      [roll]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// ── GET all students ──
app.get("/api/students", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT roll_no AS rollno, student_name AS name, class, stream, photo_url AS photo FROM students ORDER BY roll_no"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// ── DELETE student ──
app.delete("/api/students/:rollno", async (req, res) => {
  try {
    await pool.query("DELETE FROM students WHERE roll_no = $1", [req.params.rollno]);
    res.json({ message: "Student deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// ── POST marks (bulk upsert by roll + exam + subject) ──
app.post("/api/marks", async (req, res) => {
  const { rollno, exam, subjects } = req.body;
  if (!rollno || !Array.isArray(subjects) || subjects.length === 0) {
    return res.status(400).json({ error: "rollno and subjects[] are required" });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      "DELETE FROM marks WHERE roll_no = $1 AND exam_name = $2",
      [rollno, exam || null]
    );
    for (const s of subjects) {
      await client.query(
        `INSERT INTO marks (roll_no, exam_name, subject, marks, max_marks)
         VALUES ($1,$2,$3,$4,$5)`,
        [rollno, exam || null, s.subject || "", parseInt(s.marks) || 0, parseInt(s.maxMarks || s.max_marks) || 100]
      );
    }
    await client.query("COMMIT");
    res.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err.message);
    res.status(500).json({ error: "Database error" });
  } finally {
    client.release();
  }
});

// ── GET marks by roll number ──
app.get("/api/marks/:rollno", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT roll_no AS rollno, exam_name AS exam, subject, marks, max_marks
       FROM marks WHERE roll_no = $1 ORDER BY exam_name, subject`,
      [req.params.rollno]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// ── GET student info + marks by roll (for Results page) ──
app.get("/api/results/:rollno", async (req, res) => {
  const roll = req.params.rollno.trim();
  try {
    const studentRes = await pool.query(
      "SELECT roll_no AS rollno, student_name AS name, class, stream, photo_url AS photo FROM students WHERE roll_no = $1",
      [roll]
    );
    if (studentRes.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    const marksRes = await pool.query(
      "SELECT exam_name AS exam, subject, marks, max_marks FROM marks WHERE roll_no = $1 ORDER BY exam_name, subject",
      [roll]
    );
    res.json({ student: studentRes.rows[0], marks: marksRes.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// ── POST gallery image upload ──
app.post("/api/gallery", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    const result = await pool.query(
      "INSERT INTO gallery(image_url) VALUES($1) RETURNING *",
      [imageUrl]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET gallery images ──
app.get("/api/gallery", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM gallery ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// ── DELETE gallery image ──
app.delete("/api/gallery/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM gallery WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Database error" });
  }
});

const PORT = process.env.PORT || 5137;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));