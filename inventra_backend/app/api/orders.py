from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import random
from app.database.connection import get_db
from app.models.order import Order, OrderItem, OrderStatus
from app.models.medicine import Medicine
from app.models.inventory import Inventory
from app.models.user import User
from app.schemas.order import OrderCreate, OrderUpdate, OrderResponse, OrderItemCreate, OrderListResponse
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/orders", tags=["Orders"])


def generate_order_number() -> str:
    """Generate a unique order number."""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_num = random.randint(1000, 9999)
    return f"ORD-{timestamp}-{random_num}"


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new order with items.
    This will:
    1. Create order record
    2. Create order items
    3. Reduce inventory stock
    4. Calculate total amount
    """
    order_number = generate_order_number()
    total_amount = 0.0
    
    # Validate items and calculate total
    for item_data in order_data.items:
        medicine = db.query(Medicine).filter(Medicine.id == item_data.medicine_id).first()
        if not medicine:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Medicine with id {item_data.medicine_id} not found"
            )
        
        # Check inventory
        inventory = db.query(Inventory).filter(Inventory.medicine_id == item_data.medicine_id).first()
        if not inventory or inventory.current_stock < item_data.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for {medicine.medicine_name}"
            )
        
        # Calculate subtotal
        subtotal = item_data.quantity * item_data.price
        total_amount += subtotal
    
    # Create order
    order = Order(
        user_id=current_user.id,
        order_number=order_number,
        total_amount=total_amount,
        status=OrderStatus.PENDING,
        shipping_address=order_data.shipping_address,
        phone=order_data.phone,
        notes=order_data.notes
    )
    db.add(order)
    db.flush()  # Get order ID without committing
    
    # Create order items and update inventory
    for item_data in order_data.items:
        # Create order item
        subtotal = item_data.quantity * item_data.price
        order_item = OrderItem(
            order_id=order.id,
            medicine_id=item_data.medicine_id,
            quantity=item_data.quantity,
            price=item_data.price,
            subtotal=subtotal
        )
        db.add(order_item)
        
        # Reduce inventory stock
        inventory = db.query(Inventory).filter(Inventory.medicine_id == item_data.medicine_id).first()
        if inventory:
            inventory.current_stock -= item_data.quantity
            # Recalculate stock status
            if inventory.current_stock <= inventory.safety_stock:
                inventory.stock_status = "RED"
            elif inventory.current_stock <= inventory.reorder_level:
                inventory.stock_status = "YELLOW"
            else:
                inventory.stock_status = "GREEN"
    
    db.commit()
    db.refresh(order)
    
    return order


@router.get("", response_model=OrderListResponse)
def get_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get orders for the current user."""
    orders = db.query(Order).filter(Order.user_id == current_user.id).offset(skip).limit(limit).all()
    total = db.query(Order).filter(Order.user_id == current_user.id).count()
    
    return OrderListResponse(orders=orders, total=total)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific order by ID."""
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    return order


@router.put("/{order_id}", response_model=OrderResponse)
def update_order(
    order_id: int,
    order_update: OrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update order status and details."""
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    update_data = order_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(order, field, value)
    
    db.commit()
    db.refresh(order)
    
    return order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancel an order and restore inventory stock."""
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Only allow cancellation of pending orders
    if order.status != OrderStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only cancel pending orders"
        )
    
    # Restore inventory stock
    for order_item in order.order_items:
        inventory = db.query(Inventory).filter(Inventory.medicine_id == order_item.medicine_id).first()
        if inventory:
            inventory.current_stock += order_item.quantity
            # Recalculate stock status
            if inventory.current_stock <= inventory.safety_stock:
                inventory.stock_status = "RED"
            elif inventory.current_stock <= inventory.reorder_level:
                inventory.stock_status = "YELLOW"
            else:
                inventory.stock_status = "GREEN"
    
    # Update order status
    order.status = OrderStatus.CANCELLED
    db.commit()
