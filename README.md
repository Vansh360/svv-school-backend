# 🎓 SVV School Backend API

Backend API for the Sarvodaya Vidyalaya Junior Science College Website.

Built using **Node.js, Express.js, PostgreSQL (Neon Database), and Render**.

---

## 🚀 Features

* Admission Form API
* PostgreSQL Database Integration
* Store Student Admissions
* Fetch All Admission Records
* Delete Admission Records
* RESTful API Architecture
* CORS Enabled
* Environment Variable Support
* Render Deployment Ready

---

## 🛠️ Tech Stack

* Node.js
* Express.js
* PostgreSQL
* Neon Database
* Render
* dotenv
* cors
* pg

---

## 📁 Project Structure

```text
backend/
│
├── server.js
├── package.json
├── .env
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the backend folder.

```env
DATABASE_URL=your_neon_database_connection_string
PORT=5000
```

---

## 📦 Installation

Clone the repository:

```bash
git clone https://github.com/your-username/your-repository.git
```

Move to backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

---

## ▶️ Run Locally

Start the server:

```bash
node server.js
```

Server will run on:

```text
http://localhost:5000
```

---

## 🌐 Live Backend URL

```text
https://svv-school-backend.onrender.com
```

---

## 📋 API Endpoints

### Health Check

```http
GET /
```

Response:

```json
{
  "message": "Server running"
}
```

---

### Submit Admission Form

```http
POST /api/admission
```

Request Body:

```json
{
  "name": "Rahul Sharma",
  "email": "rahul@gmail.com",
  "phone": "9876543210",
  "message": "Admission enquiry"
}
```

Response:

```json
{
  "message": "Saved successfully"
}
```

---

### Get All Admissions

```http
GET /api/admissions
```

Response:

```json
[
  {
    "id": 1,
    "name": "Rahul Sharma",
    "email": "rahul@gmail.com",
    "phone": "9876543210",
    "message": "Admission enquiry"
  }
]
```

---

### Delete Admission

```http
DELETE /api/admissions/:id
```

Response:

```json
{
  "message": "Deleted successfully"
}
```

---

## 🚀 Deployment on Render

1. Push backend folder to GitHub.
2. Create a new Web Service on Render.
3. Connect GitHub repository.
4. Add Environment Variable:

```text
DATABASE_URL
```

5. Deploy.

---

## 👨‍💻 Developer

**Vansh Badgayya**

Full Stack Developer

---

## 📄 License

This project is developed for educational and portfolio purposes.
