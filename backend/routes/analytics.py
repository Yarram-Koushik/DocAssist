from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.analytics_service import track_event, get_user_analytics

analytics_bp = Blueprint('analytics_bp', __name__, url_prefix='/api/analytics')

@analytics_bp.route('/track', methods=['POST'])
@jwt_required()
def track():
    """Track an analytics event."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        event_type = data.get('event_type')
        event_data = data.get('event_data', {})
        
        if not event_type:
            return jsonify({'success': False, 'message': 'Event type is required'}), 400
            
        track_event(event_type, user_id, event_data)
        
        return jsonify({
            'success': True,
            'data': None,
            'message': 'Event tracked'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@analytics_bp.route('/user', methods=['GET'])
@jwt_required()
def get_user_stats():
    """User's own analytics summary."""
    try:
        user_id = get_jwt_identity()
        stats = get_user_analytics(user_id)
        
        return jsonify({
            'success': True,
            'data': stats,
            'message': 'User analytics retrieved'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
