from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from models import db, Table

table_bp = Blueprint('table', __name__)

def admin_required():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    return None

@table_bp.route('', methods=['GET'])
@jwt_required()
def get_tables():
    tables = Table.query.all()
    return jsonify([{
        'id': t.id,
        'name': t.name,
        'created_at': t.created_at.isoformat()
    } for t in tables]), 200

@table_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_table(id):
    table = Table.query.get_or_404(id)
    return jsonify({
        'id': table.id,
        'name': table.name,
        'created_at': table.created_at.isoformat()
    }), 200

@table_bp.route('', methods=['POST'])
@jwt_required()
def create_table():
    error = admin_required()
    if error:
        return error
    
    data = request.get_json()
    
    table = Table(name=data.get('name'))
    db.session.add(table)
    db.session.commit()
    
    return jsonify({
        'id': table.id,
        'name': table.name
    }), 201

@table_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_table(id):
    error = admin_required()
    if error:
        return error
    
    table = Table.query.get_or_404(id)
    data = request.get_json()
    
    table.name = data.get('name', table.name)
    db.session.commit()
    
    return jsonify({
        'id': table.id,
        'name': table.name
    }), 200

@table_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_table(id):
    error = admin_required()
    if error:
        return error
    
    table = Table.query.get_or_404(id)
    db.session.delete(table)
    db.session.commit()
    
    return jsonify({'message': 'Table deleted'}), 200