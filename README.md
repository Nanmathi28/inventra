# Inventra

Inventra is a Smart Pharmacy Inventory Management System designed to help pharmacies efficiently manage medicines, inventory, suppliers, stock levels, and expiry monitoring.

The system provides a modern web interface for inventory management along with a FastAPI-powered backend and PostgreSQL database.

## Features

### Authentication & User Management

* User Registration and Login
* JWT Authentication
* Role-Based Access Control

  * Admin
  * Pharmacist
  * Customer

### Inventory Management

* Medicine Inventory Tracking
* Stock Monitoring
* Reorder Level Management
* Low Stock Alerts

### Medicine Management

* Add, Update, Delete Medicines
* Batch Tracking
* Manufacturer Details
* Expiry Date Monitoring

### Supplier Management

* Manage Supplier Information
* Contact Details Tracking
* Supplier Database

### Alerts & Notifications

* Low Stock Alerts
* Critical Stock Alerts
* Expiry Alerts

### Dashboard Analytics

* Total Medicines
* Inventory Overview
* Supplier Statistics
* Expiry Monitoring Summary

---

## Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* React Router

### Backend

* FastAPI
* SQLAlchemy
* PostgreSQL
* Alembic
* JWT Authentication

---

## Project Structure

inventra-v2/

├── inventra_frontend/

├── inventra_backend/

└── README.md

---

## Installation

### Backend Setup

```bash
cd inventra_backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend runs on:

http://127.0.0.1:8000

Swagger Documentation:

http://127.0.0.1:8000/docs

---

### Frontend Setup

```bash
cd inventra_frontend

npm install

npm run dev
```

Frontend runs on:

http://localhost:5173

---

## Database

Database: PostgreSQL

Update the `.env` file in the backend folder:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/inventra_db
SECRET_KEY=your_secret_key
```

---

## Future Enhancements

* Demand Forecasting using Machine Learning
* Automated Restocking Recommendations
* Advanced Inventory Analytics
* Sales Trend Analysis
* Pharmacy Performance Reports

---

## Authors

Arya Pandaram
Nanmathi Balachandran

