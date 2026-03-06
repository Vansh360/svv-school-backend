import mysql from "mysql2";

export const db = mysql.createConnection({
  host: "localhost",      // Render will change this
  user: "root",
  password: "root",
  database: "school_db",
});

db.connect((err) => { 
  if (err) {
    console.error("MySQL Error:", err);
  } else {
    console.log("MySQL Connected");
  }
});