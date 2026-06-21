# Inventra Backend API

A comprehensive inventory management system backend built with FastAPI, PostgreSQL, and SQLAlchemy. This system provides RESTful APIs for managing medicines, inventory, suppliers, alerts, and more.

## Tech Stack

- **Python 3.11+**
- **FastAPI** - Modern, fast web framework for building APIs
- **PostgreSQL** - Relational database
- **SQLAlchemy** - SQL toolkit and ORM
- **Alembic** - Database migration tool
- **Pydantic** - Data validation using Python type annotations
- **JWT Authentication** - Secure token-based authentication
- **Passlib** - Password hashing
- **Uvicorn** - ASGI server

## Project Structure

```
inventra_backend/
├── app/
│   ├── api/              # API endpoints
│   │   ├── auth.py       # Authentication endpoints
│   │   ├── medicines.py  # Medicine CRUD endpoints
│   │   ├── inventory.py  # Inventory management endpoints
│   │   ├── suppliers.py  # Supplier management endpoints
│   │   ├── expiry.py     # Expiry monitoring endpoints
│   │   ├── alerts.py     # Alert management endpoints
│   │   └── dashboard.py # Dashboard summary endpoint
│   ├── models/           # SQLAlchemy models
│   │   ├── user.py
│   │   ├── medicine.py
│   │   ├── inventory.py
│   │   ├── supplier.py
│   │   └── alert.py
│   ├── schemas/          # Pydantic schemas
│   │   ├── user.py
│   │   ├── medicine.py
│   │   ├── inventory.py
│   │   ├── supplier.py
│   │   ├── alert.py
│   │   └── dashboard.py
│   ├── services/         # Business logic layer
│   │   ├── inventory_service.py
│   │   └── alert_service.py
│   ├── database/         # Database configuration
│   │   └── connection.py
│   ├── auth/             # Authentication utilities
│   │   ├── jwt_handler.py
│   │   ├── password_handler.py
│   │   └── dependencies.py
│   ├── utils/            # Utility functions
│   │   └── helpers.py
│   └── config/           # Configuration settings
│       └── settings.py
├── alembic/              # Database migrations
│   ├── versions/
│   ├── env.py
│   └── script.py.mako
├── tests/                # Test files
├── .env.example          # Environment variables template
├── requirements.txt      # Python dependencies
├── alembic.ini          # Alembic configuration
└── main.py              # Application entry point
```

## Features

### Authentication
- User registration with role-based access (Admin, Pharmacist, Customer)
- JWT token-based authentication
- Password hashing with bcrypt
- Protected endpoints with role-based access control

### Medicine Management
- CRUD operations for medicines
- Track medicine details (name, category, manufacturer, batch number, expiry date)
- Search and filter medicines

### Inventory Management
- Track stock levels for each medicine
- Automatic stock status assignment (GREEN, YELLOW, RED)
- Configurable reorder levels and safety stock
- Stock monitoring and alerts

### Supplier Management
- CRUD operations for suppliers
- Track supplier contact information
- Manage supplier relationships

### Expiry Monitoring
- Track medicine expiry dates
- Categorize expiry status:
  - **Critical**: 0-30 days to expiry
  - **Warning**: 31-90 days to expiry
  - **Safe**: 90+ days to expiry
- Automated expiry alerts

### Alert System
- Automatic alert generation for:
  - Low stock levels
  - Critical stock levels
  - Near-expiry medicines
- Alert status management (Active, Resolved, Dismissed)
- Manual alert creation and updates

### Dashboard
- Summary statistics:
  - Total medicines
  - Total inventory items
  - Low stock items
  - Critical stock items
  - Near-expiry items
  - Total suppliers

## Installation

### Prerequisites
- Python 3.11 or higher
- PostgreSQL 17/18
- pip (Python package manager)

### Setup Steps

1. **Clone the repository**
   ```bash
   cd inventra-v2/inventra_backend
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**
   
   On Windows:
   ```bash
   venv\Scripts\activate
   ```
   
   On macOS/Linux:
   ```bash
   source venv/bin/activate
   ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your database credentials:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/inventra_db
   SECRET_KEY=your-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

6. **Create the database**
   ```bash
   Create a PostgreSQL database named inventra_db using pgAdmin or SQL Shell.
   ```

7. **Run database migrations**
   ```bash
   alembic upgrade head
   ```

8. **Start the server**
   ```bash
   python main.py
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get access token
- `GET /auth/profile` - Get current user profile (requires authentication)

### Medicines
- `GET /medicines` - Get all medicines
- `GET /medicines/{id}` - Get a specific medicine
- `POST /medicines` - Create a new medicine (requires authentication)
- `PUT /medicines/{id}` - Update a medicine (requires authentication)
- `DELETE /medicines/{id}` - Delete a medicine (requires authentication)

### Inventory
- `GET /inventory` - Get all inventory items
- `GET /inventory/{id}` - Get a specific inventory item
- `POST /inventory` - Create a new inventory item (requires authentication)
- `PUT /inventory/{id}` - Update an inventory item (requires authentication)
- `DELETE /inventory/{id}` - Delete an inventory item (requires authentication)

### Suppliers
- `GET /suppliers` - Get all suppliers
- `POST /suppliers` - Create a new supplier (requires authentication)
- `PUT /suppliers/{id}` - Update a supplier (requires authentication)
- `DELETE /suppliers/{id}` - Delete a supplier (requires authentication)

### Expiry
- `GET /expiry` - Get all medicines with expiry information
- `GET /expiry/critical` - Get medicines expiring within 30 days
- `GET /expiry/warning` - Get medicines expiring within 31-90 days
- `GET /expiry/safe` - Get medicines with expiry > 90 days

### Alerts
- `GET /alerts` - Get all alerts
- `POST /alerts` - Create a new alert (requires authentication)
- `PUT /alerts/{id}` - Update an alert (requires authentication)
- `POST /alerts/generate` - Generate system alerts automatically (requires authentication)

### Dashboard
- `GET /dashboard/summary` - Get dashboard summary statistics

## Stock Status Rules

The inventory system automatically assigns stock status based on the following rules:

- **GREEN**: `current_stock > reorder_level`
- **YELLOW**: `current_stock <= reorder_level`
- **RED**: `current_stock <= safety_stock`

## Database Migrations

### Create a new migration
```bash
alembic revision --autogenerate -m "description of changes"
```

### Apply migrations
```bash
alembic upgrade head
```

### Rollback migrations
```bash
alembic downgrade -1
```

## Testing

Run tests using pytest:
```bash
pytest tests/
```

## Development

### Adding new models
1. Create the model in `app/models/`
2. Create corresponding schema in `app/schemas/`
3. Create API endpoints in `app/api/`
4. Generate and apply database migrations

### Adding new services
1. Create service class in `app/services/`
2. Implement business logic
3. Use services in API endpoints

## Future Enhancements

This backend is designed to support future ML integration for:
- Demand forecasting
- Stock optimization
- Automated reorder suggestions
- Predictive analytics

Placeholders and comments are included in the codebase where ML features can be integrated.

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- CORS middleware configured
- Environment variables for sensitive data
- SQL injection prevention through SQLAlchemy ORM

## License

This project is part of the Inventra Inventory Management System.

## Support

For issues and questions, please refer to the project documentation or contact the development team.
