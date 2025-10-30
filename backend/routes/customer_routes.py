from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from models import db, Customer
from datetime import datetime

customer_bp = Blueprint('customer', __name__)

def admin_required():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    return None

@customer_bp.route('', methods=['GET'])
@jwt_required()
def get_customers():
    customers = Customer.query.all()
    return jsonify([{
        'id': c.id,
        'name': c.name,
        'contact': c.contact,
        'is_abo_holder': c.is_abo_holder,
        'abo_start': c.abo_start.isoformat() if c.abo_start else None,
        'abo_end': c.abo_end.isoformat() if c.abo_end else None,
        'created_at': c.created_at.isoformat()
    } for c in customers]), 200

@customer_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_customer(id):
    customer = Customer.query.get_or_404(id)
    return jsonify({
        'id': customer.id,
        'name': customer.name,
        'contact': customer.contact,
        'is_abo_holder': customer.is_abo_holder,
        'abo_start': customer.abo_start.isoformat() if customer.abo_start else None,
        'abo_end': customer.abo_end.isoformat() if customer.abo_end else None,
        'created_at': customer.created_at.isoformat()
    }), 200

@customer_bp.route('', methods=['POST'])
@jwt_required()
def create_customer():
    error = admin_required()
    if error:
        return error
    
    data = request.get_json()
    
    customer = Customer(
        name=data.get('name'),
        contact=data.get('contact'),
        is_abo_holder=data.get('is_abo_holder', False),
        abo_start=datetime.fromisoformat(data['abo_start']) if data.get('abo_start') else None,
        abo_end=datetime.fromisoformat(data['abo_end']) if data.get('abo_end') else None
    )
    
    db.session.add(customer)
    db.session.commit()
    
    return jsonify({
        'id': customer.id,
        'name': customer.name,
        'contact': customer.contact,
        'is_abo_holder': customer.is_abo_holder,
        'abo_start': customer.abo_start.isoformat() if customer.abo_start else None,
        'abo_end': customer.abo_end.isoformat() if customer.abo_end else None
    }), 201

@customer_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_customer(id):
    error = admin_required()
    if error:
        return error
    
    customer = Customer.query.get_or_404(id)
    data = request.get_json()
    
    customer.name = data.get('name', customer.name)
    customer.contact = data.get('contact', customer.contact)
    customer.is_abo_holder = data.get('is_abo_holder', customer.is_abo_holder)
    
    if data.get('abo_start'):
        customer.abo_start = datetime.fromisoformat(data['abo_start'])
    if data.get('abo_end'):
        customer.abo_end = datetime.fromisoformat(data['abo_end'])
    
    db.session.commit()
    
    return jsonify({
        'id': customer.id,
        'name': customer.name,
        'contact': customer.contact,
        'is_abo_holder': customer.is_abo_holder,
        'abo_start': customer.abo_start.isoformat() if customer.abo_start else None,
        'abo_end': customer.abo_end.isoformat() if customer.abo_end else None
    }), 200

@customer_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_customer(id):
    error = admin_required()
    if error:
        return error
    
    customer = Customer.query.get_or_404(id)
    db.session.delete(customer)
    db.session.commit()
    
    return jsonify({'message': 'Customer deleted'}), 200