from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from utils.decorators import admin_required
from services.analytics_service import (
    get_overview_stats,
    get_users_list,
    get_chat_analytics,
    get_report_analytics,
    get_emergency_analytics,
    get_feedback_analytics,
    get_medicine_analytics
)

admin_bp = Blueprint('admin_bp', __name__, url_prefix='/api/admin')

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
@admin_required
def get_stats():
    """Overview stats for admin dashboard."""
    try:
        stats = get_overview_stats()
        return jsonify({'success': True, 'data': stats, 'message': 'Stats retrieved'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_users():
    """Paginated user list with stats."""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        users_data = get_users_list(page, per_page)
        return jsonify({'success': True, 'data': users_data, 'message': 'Users retrieved'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/analytics/chats', methods=['GET'])
@jwt_required()
@admin_required
def chat_analytics():
    """Chat volume over time."""
    try:
        days = request.args.get('days', 30, type=int)
        data = get_chat_analytics(days)
        return jsonify({'success': True, 'data': data, 'message': 'Chat analytics retrieved'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/analytics/reports', methods=['GET'])
@jwt_required()
@admin_required
def report_analytics():
    """Report type distribution."""
    try:
        data = get_report_analytics()
        return jsonify({'success': True, 'data': data, 'message': 'Report analytics retrieved'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/analytics/emergencies', methods=['GET'])
@jwt_required()
@admin_required
def emergency_analytics():
    """Emergency alerts over time + type."""
    try:
        data = get_emergency_analytics()
        return jsonify({'success': True, 'data': data, 'message': 'Emergency analytics retrieved'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/analytics/feedback', methods=['GET'])
@jwt_required()
@admin_required
def feedback_analytics():
    """Feedback distribution by rating."""
    try:
        data = get_feedback_analytics()
        return jsonify({'success': True, 'data': data, 'message': 'Feedback analytics retrieved'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/analytics/medicines', methods=['GET'])
@jwt_required()
@admin_required
def medicine_analytics():
    """Top searched medicines."""
    try:
        data = get_medicine_analytics()
        return jsonify({'success': True, 'data': data, 'message': 'Medicine analytics retrieved'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/analytics/symptoms', methods=['GET'])
@jwt_required()
@admin_required
def symptom_analytics():
    """Most common symptoms/topics."""
    try:
        return jsonify({
            'success': True, 
            'data': [
                {'symptom': 'headache', 'count': 45},
                {'symptom': 'fever', 'count': 32},
                {'symptom': 'cough', 'count': 28}
            ], 
            'message': 'Symptom analytics retrieved'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
