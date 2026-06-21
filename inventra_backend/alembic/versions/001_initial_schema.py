"""Initial schema - create all tables

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-06-20 13:18:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Drop userrole enum if it exists (handle existing enum from previous attempts)
    op.execute("DROP TYPE IF EXISTS userrole CASCADE")
    
    # Create userrole enum
    userrole_enum = postgresql.ENUM('ADMIN', 'PHARMACIST', 'CUSTOMER', name='userrole')
    userrole_enum.create(op.get_bind())
    
    # Create users table
    op.create_table('users',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('full_name', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('password_hash', sa.String(), nullable=False),
        sa.Column('role', userrole_enum, nullable=False, server_default='CUSTOMER'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.UniqueConstraint('email', name='uq_users_email')
    )
    op.create_index('ix_users_id', 'users', ['id'])
    op.create_index('ix_users_email', 'users', ['email'])
    
    # Create medicines table
    op.create_table('medicines',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('medicine_name', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('manufacturer', sa.String(), nullable=False),
        sa.Column('batch_number', sa.String(), nullable=False),
        sa.Column('expiry_date', sa.DateTime(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True)
    )
    op.create_index('ix_medicines_id', 'medicines', ['id'])
    
    # Create suppliers table
    op.create_table('suppliers',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('supplier_name', sa.String(), nullable=False),
        sa.Column('contact_person', sa.String(), nullable=False),
        sa.Column('phone', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('address', sa.Text(), nullable=True)
    )
    op.create_index('ix_suppliers_id', 'suppliers', ['id'])
    
    # Create inventory table
    op.create_table('inventory',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('medicine_id', sa.Integer(), nullable=False),
        sa.Column('current_stock', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('reorder_level', sa.Integer(), nullable=False, server_default='10'),
        sa.Column('safety_stock', sa.Integer(), nullable=False, server_default='5'),
        sa.Column('stock_status', sa.String(), nullable=False, server_default='GREEN'),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), onupdate=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['medicine_id'], ['medicines.id'], name='inventory_medicine_id_fkey')
    )
    op.create_index('ix_inventory_id', 'inventory', ['id'])
    
    # Create alerts table
    op.create_table('alerts',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('medicine_id', sa.Integer(), nullable=False),
        sa.Column('alert_type', sa.String(), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('status', sa.String(), nullable=False, server_default='active'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['medicine_id'], ['medicines.id'], name='alerts_medicine_id_fkey')
    )
    op.create_index('ix_alerts_id', 'alerts', ['id'])


def downgrade() -> None:
    # Drop tables in reverse order of creation (due to foreign keys)
    op.drop_index('ix_alerts_id', table_name='alerts')
    op.drop_table('alerts')
    
    op.drop_index('ix_inventory_id', table_name='inventory')
    op.drop_table('inventory')
    
    op.drop_index('ix_suppliers_id', table_name='suppliers')
    op.drop_table('suppliers')
    
    op.drop_index('ix_medicines_id', table_name='medicines')
    op.drop_table('medicines')
    
    op.drop_index('ix_users_email', table_name='users')
    op.drop_index('ix_users_id', table_name='users')
    op.drop_table('users')
    
    # Drop userrole enum
    postgresql.ENUM(name='userrole').drop(op.get_bind(), checkfirst=True)
