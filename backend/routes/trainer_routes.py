from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from models import db, Trainer

trainer_bp = Blueprint('trainer', __name__)

def admin_required():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    return None

@trainer_bp.route('', methods=['GET'])
@jwt_required()
def get_trainers():
    trainers = Trainer.query.all()
    return jsonify([{
        'id': t.id,
        'name': t.name,
        'email': t.email,
        'hourly_rate': t.hourly_rate,
        'created_at': t.created_at.isoformat()
    } for t in trainers]), 200

@trainer_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_trainer(id):
    trainer = Trainer.query.get_or_404(id)
    return jsonify({
        'id': trainer.id,
        'name': trainer.name,
        'email': trainer.email,
        'hourly_rate': trainer.hourly_rate,
        'created_at': trainer.created_at.isoformat()
    }), 200

@trainer_bp.route('', methods=['POST'])
@jwt_required()
def create_trainer():
    error = admin_required()
    if error:
        return error
    
    data = request.get_json()
    
    trainer = Trainer(
        name=data.get('name'),
        email=data.get('email'),
        hourly_rate=data.get('hourly_rate', 0.0)
    )
    
    db.session.add(trainer)
    db.session.commit()
    
    return jsonify({
        'id': trainer.id,
        'name': trainer.name,
        'email': trainer.email,
        'hourly_rate': trainer.hourly_rate
    }), 201

@trainer_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_trainer(id):
    error = admin_required()
    if error:
        return error
    
    trainer = Trainer.query.get_or_404(id)
    data = request.get_json()
    
    trainer.name = data.get('name', trainer.name)
    trainer.email = data.get('email', trainer.email)
    trainer.hourly_rate = data.get('hourly_rate', trainer.hourly_rate)
    
    db.session.commit()
    
    return jsonify({
        'id': trainer.id,
        'name': trainer.name,
        'email': trainer.email,
        'hourly_rate': trainer.hourly_rate
    }), 200

@trainer_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_trainer(id):
    error = admin_required()
    if error:
        return error
    
    trainer = Trainer.query.get_or_404(id)
    db.session.delete(trainer)
    db.session.commit()
    
    return jsonify({'message': 'Trainer deleted'}), 200