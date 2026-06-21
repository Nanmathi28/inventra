# Inventra Frontend

The Inventra Frontend is a React-based user interface for the Smart Pharmacy Inventory Management System.

It provides a responsive and user-friendly dashboard for managing medicines, inventory, suppliers, and pharmacy operations.

## Features

### Authentication

* User Login
* User Registration
* JWT-Based Authentication

### Dashboard

* Inventory Overview
* Stock Statistics
* Alert Monitoring
* Pharmacy Analytics

### Inventory Management

* View Inventory Records
* Update Stock Levels
* Monitor Reorder Levels

### Medicine Management

* Add Medicines
* Edit Medicines
* Delete Medicines
* Search Medicines

### Supplier Management

* Supplier Directory
* Supplier Information Tracking

### Alerts

* Low Stock Alerts
* Expiry Alerts
* Critical Notifications

---

## Tech Stack

* React.js
* Vite
* Tailwind CSS
* React Router
* Context API
* Fetch API

---

## Project Structure

src/

├── assets/

├── components/

├── context/

├── data/

├── pages/

├── services/

├── App.jsx

└── main.jsx

---

## Installation

```bash
npm install
```

Run Development Server:

```bash
npm run dev
```

Application will be available at:

http://localhost:5173

---

## Backend Connection

The frontend communicates with the FastAPI backend running at:

http://127.0.0.1:8000

Ensure the backend server is running before using the application.

---

## Build for Production

```bash
npm run build
```

Preview Production Build:

```bash
npm run preview
```

---

## Main Modules

* Authentication
* Dashboard
* Medicines
* Inventory
* Suppliers
* Alerts

---

## Developed For

Inventra – Smart Pharmacy Inventory Management System

