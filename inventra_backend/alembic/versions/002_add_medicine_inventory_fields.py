"""Add medicine_form and price to medicines, batch_number and expiry_date to inventory

Revision ID: 002_add_fields
Revises: 001_initial_schema
Create Date: 2026-06-22 14:58:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002_add_fields'
down_revision = '001_initial_schema'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add medicine_form and price to medicines table
    op.add_column('medicines', sa.Column('medicine_form', sa.String(), nullable=True))
    op.add_column('medicines', sa.Column('price', sa.Float(), nullable=True))
    
    # Add batch_number and expiry_date to inventory table
    op.add_column('inventory', sa.Column('batch_number', sa.String(), nullable=True))
    op.add_column('inventory', sa.Column('expiry_date', sa.DateTime(), nullable=True))


def downgrade() -> None:
    # Remove columns from inventory table
    op.drop_column('inventory', 'expiry_date')
    op.drop_column('inventory', 'batch_number')
    
    # Remove columns from medicines table
    op.drop_column('medicines', 'price')
    op.drop_column('medicines', 'medicine_form')
