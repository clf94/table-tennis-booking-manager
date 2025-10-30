from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from models import db, User

user_bp = Blueprint('user', __name__)

def admin_required():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    return None

@user_bp.route('', methods=['GET'])
@jwt_required()
def get_users():
    error = admin_required()
    if error:
        return error
    
    users = User.query.all()
    return jsonify([{
        'id': u.id,
        'username': u.username,
        'role': u.role,
        'trainer_id': u.trainer_id
    } for u in users]), 200

@user_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_user(id):
    error = admin_required()
    if error:
        return error
    
    user = User.query.get_or_404(id)
    return jsonify({
        'id': user.id,
        'username': user.username,
        'role': user.role,
        'trainer_id': user.trainer_id
    }), 200

@user_bp.route('', methods=['POST'])
@jwt_required()
def create_user():
    error = admin_required()
    if error:
        return error
    
    data = request.get_json()
    
    # Check if username already exists
    existing_user = User.query.filter_by(username=data.get('username')).first()
    if existing_user:
        return jsonify({'error': 'Username already exists'}), 400
    
    user = User(
        username=data.get('username'),
        role=data.get('role', 'trainer'),
        trainer_id=data.get('trainer_id')
    )
    user.set_password(data.get('password'))
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'id': user.id,
        'username': user.username,
        'role': user.role,
        'trainer_id': user.trainer_id
    }), 201

@user_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_user(id):
    error = admin_required()
    if error:
        return error
    
    user = User.query.get_or_404(id)
    data = request.get_json()
    
    # Don't allow changing admin username
    if user.role == 'admin' and data.get('username') != user.username:
        return jsonify({'error': 'Cannot change admin username'}), 400
    
    # Check if new username already exists
    if data.get('username') != user.username:
        existing_user = User.query.filter_by(username=data.get('username')).first()
        if existing_user:
            return jsonify({'error': 'Username already exists'}), 400
    
    user.username = data.get('username', user.username)
    
    # Don't allow changing admin role
    if user.role != 'admin':
        user.role = data.get('role', user.role)
    
    user.trainer_id = data.get('trainer_id')
    
    # Only update password if provided
    if data.get('password'):
        user.set_password(data.get('password'))
    
    db.session.commit()
    
    return jsonify({
        'id': user.id,
        'username': user.username,
        'role': user.role,
        'trainer_id': user.trainer_id
    }), 200

@user_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_user(id):
    error = admin_required()
    if error:
        return error
    
    user = User.query.get_or_404(id)
    
    # Don't allow deleting admin user
    if user.role == 'admin':
        return jsonify({'error': 'Cannot delete admin user'}), 400
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({'message': 'User deleted'}), 200