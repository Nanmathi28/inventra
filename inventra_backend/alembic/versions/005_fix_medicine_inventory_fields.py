"""Remove batch_number and expiry_date from medicines (moved to inventory)

Revision ID: 005_fix_meds
Revises: 004_supplier_rel
Create Date: 2026-06-24 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '005_fix_meds'
down_revision = '004_supplier_rel'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Remove batch_number and expiry_date from medicines table
    op.drop_column('medicines', 'batch_number')
    op.drop_column('medicines', 'expiry_date')


def downgrade() -> None:
    # Add back batch_number and expiry_date to medicines table
    op.add_column('medicines', sa.Column('batch_number', sa.String(), nullable=False))
    op.add_column('medicines', sa.Column('expiry_date', sa.DateTime(), nullable=False))
