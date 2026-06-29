<<<<<<< HEAD
💊 Inventra – AI-Powered Smart Pharmacy Inventory Management System
=======
# 💊 Inventra – AI-Powered Smart Pharmacy Inventory Management System
>>>>>>> 4d17238d4bf93ad332b486515aad277bbd5f4a78

Inventra is a full-stack Smart Pharmacy Inventory Management System designed to help pharmacies efficiently manage medicines, inventory, suppliers, stock levels, expiry monitoring, and AI-powered demand forecasting.

The application provides a modern React-based web interface, a FastAPI backend, PostgreSQL database, and machine learning capabilities for smarter inventory decisions.
<<<<<<< HEAD

---

🚀 Live Demo

Frontend

https://inventra-nanmathi.vercel.app

Backend API

https://inventra-api-n1ae.onrender.com

API Documentation (Swagger)

https://inventra-api-n1ae.onrender.com/docs

---

✨ Features

🔐 Authentication & User Management

- User Registration & Login
- JWT Authentication
- Secure Password Hashing
- Role-Based Access Control

Roles:

- Admin
- Pharmacist
- Customer

---

💊 Medicine Management

- Add Medicines
- Update Medicines
- Delete Medicines
- Medicine Categories
- Manufacturer Details
- Medicine Form
- Batch Tracking
- Price Management
- Expiry Date Monitoring

---

📦 Inventory Management

- Real-Time Inventory Tracking
- Current Stock Monitoring
- Safety Stock Management
- Reorder Level Management
- Stock Status Monitoring
- Batch-wise Inventory

---

🚚 Supplier Management

- Supplier Database
- Contact Information
- Supplier Reliability Score
- Supplier Details Management

---

📢 Alerts & Notifications

- Low Stock Alerts
- Critical Stock Alerts
- Expiry Alerts
- Inventory Notifications

---

🛒 Order Management

- Customer Orders
- Order Tracking
- Order Status Management
- Order History

---

📊 Dashboard & Analytics

- Total Medicines
- Inventory Overview
- Supplier Statistics
- Stock Distribution
- Expiry Monitoring Summary

---

🤖 AI & Machine Learning

- Demand Forecasting
- Future Stock Prediction
- Smart Inventory Recommendations
- Forecast Dashboard
- Historical Demand Analysis

---

📄 Prescription Management

- Upload Prescriptions
- Prescription Records
- Medicine Request Tracking

---

🛠️ Tech Stack

Frontend

- React.js
- Vite
- Tailwind CSS
- React Router
- JavaScript

---

Backend

- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic
- JWT Authentication
- Pydantic

---

Machine Learning

- Scikit-learn
- Pandas
- NumPy

---

Deployment

- Frontend: Vercel
- Backend: Render
- Database: PostgreSQL

---

📁 Project Structure

=======

---

# 🚀 Live Demo

### Frontend

**https://inventra-nanmathi.vercel.app**

### Backend API

**https://inventra-api-n1ae.onrender.com**

### API Documentation (Swagger)

**https://inventra-api-n1ae.onrender.com/docs**

---

# ✨ Features

## 🔐 Authentication & User Management

* User Registration & Login
* JWT Authentication
* Secure Password Hashing
* Role-Based Access Control

Roles:

* Admin
* Pharmacist
* Customer

---

## 💊 Medicine Management

* Add Medicines
* Update Medicines
* Delete Medicines
* Medicine Categories
* Manufacturer Details
* Medicine Form
* Batch Tracking
* Price Management
* Expiry Date Monitoring

---

## 📦 Inventory Management

* Real-Time Inventory Tracking
* Current Stock Monitoring
* Safety Stock Management
* Reorder Level Management
* Stock Status Monitoring
* Batch-wise Inventory

---

## 🚚 Supplier Management

* Supplier Database
* Contact Information
* Supplier Reliability Score
* Supplier Details Management

---

## 📢 Alerts & Notifications

* Low Stock Alerts
* Critical Stock Alerts
* Expiry Alerts
* Inventory Notifications

---

## 🛒 Order Management

* Customer Orders
* Order Tracking
* Order Status Management
* Order History

---

## 📊 Dashboard & Analytics

* Total Medicines
* Inventory Overview
* Supplier Statistics
* Stock Distribution
* Expiry Monitoring Summary

---

## 🤖 AI & Machine Learning

* Demand Forecasting
* Future Stock Prediction
* Smart Inventory Recommendations
* Forecast Dashboard
* Historical Demand Analysis

---

## 📄 Prescription Management

* Upload Prescriptions
* Prescription Records
* Medicine Request Tracking

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Vite
* Tailwind CSS
* React Router
* JavaScript

---

## Backend

* FastAPI
* SQLAlchemy
* PostgreSQL
* Alembic
* JWT Authentication
* Pydantic

---

## Machine Learning

* Scikit-learn
* Pandas
* NumPy

---

## Deployment

* Frontend: Vercel
* Backend: Render
* Database: PostgreSQL

---

# 📁 Project Structure

```text
>>>>>>> 4d17238d4bf93ad332b486515aad277bbd5f4a78
inventra/
│
├── inventra_frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── inventra_backend/
│   ├── alembic/
│   ├── app/
│   ├── data/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── requirements.txt
│   └── main.py
│
└── README.md
```

---

<<<<<<< HEAD
⚙️ Installation

Clone Repository

git clone https://github.com/Nanmathi28/inventra.git

cd inventra

---

Backend Setup
=======
# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/Nanmathi28/inventra.git

cd inventra
```

---

# Backend Setup
>>>>>>> 4d17238d4bf93ad332b486515aad277bbd5f4a78

cd inventra_backend

python -m venv venv

# Windows
venv\Scripts\activate

# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt

alembic upgrade head
<<<<<<< HEAD

uvicorn main:app --reload

=======

uvicorn main:app --reload
```

>>>>>>> 4d17238d4bf93ad332b486515aad277bbd5f4a78
Backend runs at:

```
http://127.0.0.1:8000
```

Swagger API Documentation:

```
http://127.0.0.1:8000/docs
```

---

<<<<<<< HEAD
Frontend Setup
=======
# Frontend Setup
>>>>>>> 4d17238d4bf93ad332b486515aad277bbd5f4a78

cd inventra_frontend

npm install

npm run dev

Frontend runs at:

```
http://localhost:5173
<<<<<<< HEAD

---

Database Configuration

Create a ".env" file inside inventra_backend

DATABASE_URL=postgresql://username:password@localhost:5432/inventra_db

SECRET_KEY=your_secret_key

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=60

---

🔮 Future Enhancements

- Barcode Scanner Integration
- OCR Prescription Recognition
- Email Notifications
- SMS Alerts
- Mobile Application
- Supplier Performance Analytics
- Advanced AI Forecasting
- Sales Analytics Dashboard
- Multi-Branch Pharmacy Support

---

👥 Team

- Nanmathi Balachandran
- Arya Pandaram
=======
```

---

# Database Configuration

Create a `.env` file inside **inventra_backend**

```env
DATABASE_URL=postgresql://username:password@localhost:5432/inventra_db

SECRET_KEY=your_secret_key

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=60
```

---

# 🔮 Future Enhancements

* Barcode Scanner Integration
* OCR Prescription Recognition
* Email Notifications
* SMS Alerts
* Mobile Application
* Supplier Performance Analytics
* Advanced AI Forecasting
* Sales Analytics Dashboard
* Multi-Branch Pharmacy Support

---

# 👥 Team

* **Nanmathi Balachandran**
* **Arya Pandaram**

---

# 📄 License

This project was developed for educational, academic, and learning purposes.

---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub!


>>>>>>> 4d17238d4bf93ad332b486515aad277bbd5f4a78

---

📄 License

This project was developed for educational, academic, and learning purposes.

---

⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub!
