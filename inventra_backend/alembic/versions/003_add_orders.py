"""Add orders and order_items tables

Revision ID: 003_add_orders
Revises: 002_add_fields
Create Date: 2026-06-22 16:20:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '003_add_orders'
down_revision = '002_add_fields'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create orderstatus enum (drop if exists)
    op.execute("DROP TYPE IF EXISTS orderstatus CASCADE")
    orderstatus_enum = postgresql.ENUM(
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        name='orderstatus',
        create_type=False
    )

    orderstatus_enum.create(op.get_bind(), checkfirst=True)
    
    # Create orders table
    op.create_table('orders',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('order_number', sa.String(), nullable=False),
        sa.Column('total_amount', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('status', orderstatus_enum, nullable=False, server_default='pending'),
        sa.Column('shipping_address', sa.String(), nullable=True),
        sa.Column('phone', sa.String(), nullable=True),
        sa.Column('notes', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), onupdate=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='orders_user_id_fkey'),
        sa.UniqueConstraint('order_number', name='uq_orders_order_number')
    )
    op.create_index('ix_orders_id', 'orders', ['id'])
    op.create_index('ix_orders_order_number', 'orders', ['order_number'])
    
    # Create order_items table
    op.create_table('order_items',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('order_id', sa.Integer(), nullable=False),
        sa.Column('medicine_id', sa.Integer(), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('price', sa.Float(), nullable=False),
        sa.Column('subtotal', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], name='order_items_order_id_fkey', ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['medicine_id'], ['medicines.id'], name='order_items_medicine_id_fkey')
    )
    op.create_index('ix_order_items_id', 'order_items', ['id'])


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_index('ix_order_items_id', table_name='order_items')
    op.drop_table('order_items')
    
    op.drop_index('ix_orders_order_number', table_name='orders')
    op.drop_index('ix_orders_id', table_name='orders')
    op.drop_table('orders')
    
    # Drop orderstatus enum
    postgresql.ENUM(name='orderstatus').drop(op.get_bind(), checkfirst=True)
