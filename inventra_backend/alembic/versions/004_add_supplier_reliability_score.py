"""Add reliability_score to suppliers

Revision ID: 004_supplier_rel
Revises: 003_add_orders
Create Date: 2026-06-23 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '004_supplier_rel'
down_revision = '003_add_orders'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('suppliers', sa.Column('reliability_score', sa.Integer(), nullable=False, server_default='80'))
    op.execute("UPDATE suppliers SET reliability_score = 80 WHERE reliability_score IS NULL")


def downgrade() -> None:
    op.drop_column('suppliers', 'reliability_score')
