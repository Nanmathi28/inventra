"""Add restock_requests table

Revision ID: 006_restock_req
Revises: 005_fix_meds
Create Date: 2026-06-24 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '006_restock_req'
down_revision = '005_fix_meds'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create restock_requests table
    op.create_table('restock_requests',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('medicine_id', sa.Integer(), nullable=False),
        sa.Column('supplier_id', sa.Integer(), nullable=True),
        sa.Column('requested_quantity', sa.Integer(), nullable=False),
        sa.Column('notes', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=False, server_default='pending'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), onupdate=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['medicine_id'], ['medicines.id'], name='restock_requests_medicine_id_fkey'),
        sa.ForeignKeyConstraint(['supplier_id'], ['suppliers.id'], name='restock_requests_supplier_id_fkey')
    )
    op.create_index('ix_restock_requests_id', 'restock_requests', ['id'])


def downgrade() -> None:
    op.drop_index('ix_restock_requests_id', table_name='restock_requests')
    op.drop_table('restock_requests')
