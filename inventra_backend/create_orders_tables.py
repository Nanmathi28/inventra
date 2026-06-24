import os
import sys
from sqlalchemy import create_engine, text
from app.config.settings import settings

# Create database connection
engine = create_engine(settings.DATABASE_URL)

try:
    with engine.connect() as conn:
        # Drop existing objects
        print("Dropping existing objects...")
        try:
            conn.execute(text("DROP TABLE IF EXISTS order_items CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS orders CASCADE"))
            conn.execute(text("DROP TYPE IF EXISTS orderstatus CASCADE"))
            conn.commit()
        except Exception as e:
            print(f"Warning during drop: {e}")
            conn.rollback()
        
        # Create enum
        print("Creating orderstatus enum...")
        conn.execute(text("CREATE TYPE orderstatus AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')"))
        conn.commit()
        
        # Create orders table
        print("Creating orders table...")
        conn.execute(text("""
            CREATE TABLE orders (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                order_number VARCHAR(255) UNIQUE NOT NULL,
                total_amount FLOAT NOT NULL DEFAULT 0.0,
                status orderstatus NOT NULL DEFAULT 'pending',
                shipping_address VARCHAR(255),
                phone VARCHAR(255),
                notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        """))
        conn.commit()
        
        # Create indexes for orders
        print("Creating orders indexes...")
        conn.execute(text("CREATE INDEX ix_orders_id ON orders(id)"))
        conn.execute(text("CREATE INDEX ix_orders_order_number ON orders(order_number)"))
        conn.execute(text("CREATE INDEX ix_orders_user_id ON orders(user_id)"))
        conn.commit()
        
        # Create order_items table
        print("Creating order_items table...")
        conn.execute(text("""
            CREATE TABLE order_items (
                id SERIAL PRIMARY KEY,
                order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                medicine_id INTEGER NOT NULL REFERENCES medicines(id),
                quantity INTEGER NOT NULL,
                price FLOAT NOT NULL,
                subtotal FLOAT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        """))
        conn.commit()
        
        # Create index for order_items
        print("Creating order_items indexes...")
        conn.execute(text("CREATE INDEX ix_order_items_id ON order_items(id)"))
        conn.execute(text("CREATE INDEX ix_order_items_order_id ON order_items(order_id)"))
        conn.execute(text("CREATE INDEX ix_order_items_medicine_id ON order_items(medicine_id)"))
        conn.commit()
        
        # Create trigger function
        print("Creating trigger function...")
        conn.execute(text("""
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ language 'plpgsql'
        """))
        conn.commit()
        
        # Create trigger
        print("Creating trigger...")
        conn.execute(text("""
            CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
        """))
        conn.commit()
        
    print("Orders tables created successfully!")
except Exception as e:
    print(f"Error creating orders tables: {e}")
    sys.exit(1)
