from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, medicines, inventory, suppliers, expiry, alerts, dashboard, forecast, restocking, analytics, portal, export
from app.config.settings import settings
from app.database.connection import engine, Base
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Create database tables when the app starts.
# In production, prefer Alembic migrations rather than seeding fake users.
Base.metadata.create_all(bind=engine)
logger.info("Database tables created/verified")

app = FastAPI(
    title="Inventra API",
    description="Inventory Management System API",
    version="1.0.0"
)

# CORS middleware configuration
logger.info(f"CORS Origins: {settings.BACKEND_ORIGINS}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(medicines.router)
app.include_router(inventory.router)
app.include_router(suppliers.router)
app.include_router(expiry.router)
app.include_router(alerts.router)
app.include_router(dashboard.router)
app.include_router(forecast.router)
app.include_router(restocking.router)
app.include_router(analytics.router)
app.include_router(portal.router)
app.include_router(export.router)


@app.get("/")
def root():
    logger.info("Root endpoint accessed")
    return {
        "message": "Welcome to Inventra API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    logger.info("Health check endpoint accessed")
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    logger.info("Starting uvicorn server on host 0.0.0.0 port 8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
