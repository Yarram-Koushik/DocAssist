from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models.feedback import Feedback
from utils.decorators import admin_required
from utils.helpers import paginate_query

feedback_bp = Blueprint('feedback_bp', __name__, url_prefix='/api/feedback')

@feedback_bp.route('/', methods=['POST'])
@jwt_required()
def submit_feedback():
    """Save user feedback."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        rating = data.get('rating')
        if not rating or not (1 <= rating <= 5):
            return jsonify({'success': False, 'message': 'Rating between 1 and 5 is required'}), 400
            
        new_feedback = Feedback(
            user_id=user_id,
            chat_id=data.get('chat_id'),
            rating=rating,
            comment=data.get('comment', '')
        )
        
        db.session.add(new_feedback)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': new_feedback.to_dict(),
            'message': 'Feedback submitted successfully'
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@feedback_bp.route('/', methods=['GET'])
@jwt_required()
@admin_required
def list_feedback():
    """List all feedback with pagination (Admin only)."""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        query = Feedback.query.order_by(Feedback.created_at.desc())
        results = paginate_query(query, page, per_page)
        
        return jsonify({
            'success': True,
            'data': results,
            'message': 'Feedback retrieved'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
