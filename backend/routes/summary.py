from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
import io
from services.summary_service import (
    generate_summary, 
    get_user_summaries, 
    get_summary, 
    get_shared_summary,
    export_summary,
    create_share_link
)

summary_bp = Blueprint('summary_bp', __name__, url_prefix='/api/summary')

@summary_bp.route('/generate', methods=['POST'])
@jwt_required()
def create_summary():
    """Generate doctor summary from conversation and reports."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        conversation_id = data.get('conversation_id')
        report_ids = data.get('report_ids', [])
        
        if not conversation_id:
            return jsonify({'success': False, 'message': 'Conversation ID is required'}), 400
            
        summary = generate_summary(user_id, conversation_id, report_ids)
        return jsonify({
            'success': True,
            'data': summary,
            'message': 'DoctorSummary generated successfully'
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@summary_bp.route('/', methods=['GET'])
@jwt_required()
def list_summaries():
    """List user's summaries."""
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        summaries = get_user_summaries(user_id, page, per_page)
        return jsonify({
            'success': True,
            'data': summaries,
            'message': 'Summaries retrieved'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@summary_bp.route('/<summary_id>', methods=['GET'])
@jwt_required()
def get_summary_details(summary_id):
    """Get summary details."""
    try:
        user_id = get_jwt_identity()
        summary = get_summary(summary_id, user_id)
        
        if not summary:
            return jsonify({'success': False, 'message': 'DoctorSummary not found'}), 404
            
        return jsonify({
            'success': True,
            'data': summary,
            'message': 'DoctorSummary retrieved'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@summary_bp.route('/share/<token>', methods=['GET'])
def get_shared(token):
    """NO auth required. Get shared summary by token."""
    try:
        summary = get_shared_summary(token)
        if not summary:
            return jsonify({'success': False, 'message': 'Invalid or expired share token'}), 404
            
        return jsonify({
            'success': True,
            'data': summary,
            'message': 'Shared summary retrieved'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@summary_bp.route('/<summary_id>/export', methods=['GET'])
@jwt_required()
def export(summary_id):
    """Export summary to PDF or TXT."""
    try:
        user_id = get_jwt_identity()
        export_format = request.args.get('format', 'pdf').lower()
        
        if export_format not in ['pdf', 'txt']:
            return jsonify({'success': False, 'message': 'Invalid format. Use pdf or txt'}), 400
            
        file_bytes, filename, mimetype = export_summary(summary_id, user_id, export_format)
        
        if not file_bytes:
            return jsonify({'success': False, 'message': 'DoctorSummary not found'}), 404
            
        return send_file(
            io.BytesIO(file_bytes),
            download_name=filename,
            mimetype=mimetype,
            as_attachment=True
        )
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@summary_bp.route('/<summary_id>/share', methods=['POST'])
@jwt_required()
def share_summary(summary_id):
    """Generate share token for summary."""
    try:
        user_id = get_jwt_identity()
        token = create_share_link(summary_id, user_id)
        
        if not token:
            return jsonify({'success': False, 'message': 'DoctorSummary not found'}), 404
            
        return jsonify({
            'success': True,
            'data': {'share_token': token},
            'message': 'Share link generated'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
