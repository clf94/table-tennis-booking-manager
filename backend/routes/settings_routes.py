from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from models import db, Settings

settings_bp = Blueprint('settings', __name__)

def admin_required():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    return None

@settings_bp.route('', methods=['GET'])
@jwt_required()
def get_settings():
    settings = Settings.query.first()
    
    if not settings:
        return jsonify({'error': 'Settings not found'}), 404
    
    return jsonify({
        'id': settings.id,
        'pricing_matrix': settings.get_pricing_matrix(),
        'monthly_rate': settings.monthly_rate,
        'language': settings.language,
        'updated_at': settings.updated_at.isoformat()
    }), 200

@settings_bp.route('', methods=['PUT'])
@jwt_required()
def update_settings():
    error = admin_required()
    if error:
        return error
    
    settings = Settings.query.first()
    
    if not settings:
        return jsonify({'error': 'Settings not found'}), 404
    
    data = request.get_json()
    
    if 'pricing_matrix' in data:
        settings.set_pricing_matrix(data['pricing_matrix'])
    
    if 'monthly_rate' in data:
        settings.monthly_rate = data['monthly_rate']
    
    if 'language' in data:
        settings.language = data['language']
    
    db.session.commit()
    
    return jsonify({
        'id': settings.id,
        'pricing_matrix': settings.get_pricing_matrix(),
        'monthly_rate': settings.monthly_rate,
        'language': settings.language,
        'updated_at': settings.updated_at.isoformat()
    }), 200