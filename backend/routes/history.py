from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.chat import ChatHistory
from models.chat import Conversation
from models.report import Report
from models.medicine import Medicine
from models.summary import DoctorSummary
from app import db
import datetime

history_bp = Blueprint('history_bp', __name__, url_prefix='/api/history')

@history_bp.route('/chats', methods=['GET'])
@jwt_required()
def get_recent_chats():
    """Recent chat messages across all conversations."""
    try:
        user_id = get_jwt_identity()
        days = request.args.get('days', 7, type=int)
        
        since_date = datetime.datetime.utcnow() - datetime.timedelta(days=days)
        
        messages = db.session.query(ChatHistory).join(Conversation).filter(
            Conversation.user_id == user_id,
            ChatHistory.created_at >= since_date
        ).order_by(ChatHistory.created_at.desc()).limit(50).all()
        
        return jsonify({
            'success': True,
            'data': [msg.to_dict() for msg in messages],
            'message': 'Recent chats retrieved'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@history_bp.route('/reports', methods=['GET'])
@jwt_required()
def get_recent_reports():
    """Recent reports."""
    try:
        user_id = get_jwt_identity()
        reports = Report.query.filter_by(user_id=user_id).order_by(Report.created_at.desc()).limit(10).all()
        
        return jsonify({
            'success': True,
            'data': [r.to_dict() for r in reports],
            'message': 'Recent reports retrieved'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@history_bp.route('/medicines', methods=['GET'])
@jwt_required()
def get_recent_medicines():
    """Recent medicine searches."""
    try:
        user_id = get_jwt_identity()
        searches = Medicine.query.filter_by(user_id=user_id).order_by(Medicine.created_at.desc()).limit(10).all()
        
        return jsonify({
            'success': True,
            'data': [s.to_dict() for s in searches],
            'message': 'Recent searches retrieved'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@history_bp.route('/summaries', methods=['GET'])
@jwt_required()
def get_recent_summaries():
    """Recent summaries."""
    try:
        user_id = get_jwt_identity()
        summaries = DoctorSummary.query.filter_by(user_id=user_id).order_by(DoctorSummary.created_at.desc()).limit(10).all()
        
        return jsonify({
            'success': True,
            'data': [s.to_dict() for s in summaries],
            'message': 'Recent summaries retrieved'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@history_bp.route('/overview', methods=['GET'])
@jwt_required()
def get_overview():
    """Combined overview."""
    try:
        user_id = get_jwt_identity()
        
        chat_count = Conversation.query.filter_by(user_id=user_id).count()
        report_count = Report.query.filter_by(user_id=user_id).count()
        medicine_count = Medicine.query.filter_by(user_id=user_id).count()
        summary_count = DoctorSummary.query.filter_by(user_id=user_id).count()
        
        return jsonify({
            'success': True,
            'data': {
                'counts': {
                    'chats': chat_count,
                    'reports': report_count,
                    'medicines': medicine_count,
                    'summaries': summary_count
                }
            },
            'message': 'Overview retrieved'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
