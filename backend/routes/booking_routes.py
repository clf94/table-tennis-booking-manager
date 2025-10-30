from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from models import db, Booking, Customer, Trainer, Table, Settings
from datetime import datetime, timedelta
from utils.price_calculator import calculate_price

booking_bp = Blueprint('booking', __name__)

def admin_required():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    return None

def check_double_booking(table_id, date, time, duration, exclude_booking_id=None):
    """Check if a time slot is already booked"""
    # Parse the booking time
    booking_time = datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M")
    booking_end = booking_time + timedelta(minutes=duration)
    
    # Get all bookings for the same table and date
    bookings = Booking.query.filter_by(table_id=table_id, date=date).all()
    
    for booking in bookings:
        if exclude_booking_id and booking.id == exclude_booking_id:
            continue
        
        existing_time = datetime.strptime(f"{booking.date} {booking.time}", "%Y-%m-%d %H:%M")
        existing_end = existing_time + timedelta(minutes=booking.duration)
        
        # Check for overlap
        if (booking_time < existing_end) and (booking_end > existing_time):
            return True
    
    return False

@booking_bp.route('', methods=['GET'])
@jwt_required()
def get_bookings():
    # Query parameters for filtering
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    table_id = request.args.get('table_id')
    trainer_id = request.args.get('trainer_id')
    
    query = Booking.query
    
    if start_date:
        query = query.filter(Booking.date >= datetime.fromisoformat(start_date).date())
    if end_date:
        query = query.filter(Booking.date <= datetime.fromisoformat(end_date).date())
    if table_id:
        query = query.filter_by(table_id=int(table_id))
    if trainer_id:
        query = query.filter_by(trainer_id=int(trainer_id))
    
    bookings = query.all()
    
    return jsonify([{
        'id': b.id,
        'customer_id': b.customer_id,
        'customer_name': b.customer.name,
        'trainer_id': b.trainer_id,
        'trainer_name': b.trainer.name if b.trainer else None,
        'table_id': b.table_id,
        'table_name': b.table.name,
        'date': b.date.isoformat(),
        'time': b.time,
        'duration': b.duration,
        'price': b.price,
        'info': b.info,
        'is_abo': b.customer.is_abo_holder,
        'created_at': b.created_at.isoformat()
    } for b in bookings]), 200

@booking_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_booking(id):
    booking = Booking.query.get_or_404(id)
    
    return jsonify({
        'id': booking.id,
        'customer_id': booking.customer_id,
        'customer_name': booking.customer.name,
        'trainer_id': booking.trainer_id,
        'trainer_name': booking.trainer.name if booking.trainer else None,
        'table_id': booking.table_id,
        'table_name': booking.table.name,
        'date': booking.date.isoformat(),
        'time': booking.time,
        'duration': booking.duration,
        'price': booking.price,
        'info': booking.info,
        'is_abo': booking.customer.is_abo_holder,
        'created_at': booking.created_at.isoformat()
    }), 200

@booking_bp.route('', methods=['POST'])
@jwt_required()
def create_booking():
    error = admin_required()
    if error:
        return error
    
    data = request.get_json()
    
    customer_id = data.get('customer_id')
    trainer_id = data.get('trainer_id')
    table_id = data.get('table_id')
    date_str = data.get('date')
    time = data.get('time')
    duration = data.get('duration')
    info = data.get('info', '')
    
    # Validate required fields
    if not all([customer_id, table_id, date_str, time, duration]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Parse date
    date = datetime.fromisoformat(date_str).date()
    
    # Check for double booking
    if check_double_booking(table_id, date, time, duration):
        return jsonify({'error': 'Time slot already booked'}), 409
    
    # Get customer and check ABO status
    customer = Customer.query.get_or_404(customer_id)
    is_abo = customer.is_abo_holder
    
    # Calculate price
    settings = Settings.query.first()
    pricing_matrix = settings.get_pricing_matrix()
    price = calculate_price(duration, trainer_id is not None, is_abo, pricing_matrix)
    
    # Create booking
    booking = Booking(
        customer_id=customer_id,
        trainer_id=trainer_id,
        table_id=table_id,
        date=date,
        time=time,
        duration=duration,
        price=price,
        info=info
    )
    
    db.session.add(booking)
    db.session.commit()
    
    return jsonify({
        'id': booking.id,
        'customer_id': booking.customer_id,
        'customer_name': booking.customer.name,
        'trainer_id': booking.trainer_id,
        'trainer_name': booking.trainer.name if booking.trainer else None,
        'table_id': booking.table_id,
        'table_name': booking.table.name,
        'date': booking.date.isoformat(),
        'time': booking.time,
        'duration': booking.duration,
        'price': booking.price,
        'info': booking.info
    }), 201

@booking_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_booking(id):
    error = admin_required()
    if error:
        return error
    
    booking = Booking.query.get_or_404(id)
    data = request.get_json()
    
    # Update fields
    if 'table_id' in data:
        table_id = data['table_id']
    else:
        table_id = booking.table_id
    
    if 'date' in data:
        date = datetime.fromisoformat(data['date']).date()
    else:
        date = booking.date
    
    if 'time' in data:
        time = data['time']
    else:
        time = booking.time
    
    if 'duration' in data:
        duration = data['duration']
    else:
        duration = booking.duration
    
    # Check for double booking (exclude current booking)
    if check_double_booking(table_id, date, time, duration, exclude_booking_id=id):
        return jsonify({'error': 'Time slot already booked'}), 409
    
    # Update booking
    booking.customer_id = data.get('customer_id', booking.customer_id)
    booking.trainer_id = data.get('trainer_id', booking.trainer_id)
    booking.table_id = table_id
    booking.date = date
    booking.time = time
    booking.duration = duration
    booking.info = data.get('info', booking.info)
    
    # Recalculate price if relevant fields changed
    if any(k in data for k in ['customer_id', 'trainer_id', 'duration']):
        customer = Customer.query.get(booking.customer_id)
        settings = Settings.query.first()
        pricing_matrix = settings.get_pricing_matrix()
        booking.price = calculate_price(
            booking.duration,
            booking.trainer_id is not None,
            customer.is_abo_holder,
            pricing_matrix
        )
    
    db.session.commit()
    
    return jsonify({
        'id': booking.id,
        'customer_id': booking.customer_id,
        'customer_name': booking.customer.name,
        'trainer_id': booking.trainer_id,
        'trainer_name': booking.trainer.name if booking.trainer else None,
        'table_id': booking.table_id,
        'table_name': booking.table.name,
        'date': booking.date.isoformat(),
        'time': booking.time,
        'duration': booking.duration,
        'price': booking.price,
        'info': booking.info
    }), 200

@booking_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_booking(id):
    error = admin_required()
    if error:
        return error
    
    booking = Booking.query.get_or_404(id)
    db.session.delete(booking)
    db.session.commit()
    
    return jsonify({'message': 'Booking deleted'}), 200