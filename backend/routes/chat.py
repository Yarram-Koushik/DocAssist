from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.chat_service import (
    create_conversation,
    get_user_conversations,
    get_conversation_messages,
    delete_conversation,
    save_message,
    get_ai_response
)
from utils.helpers import paginate_query
from utils.safety import add_disclaimer, filter_response
from utils.validators import sanitize_input
from emergency.detector import detect_emergency

chat_bp = Blueprint('chat_bp', __name__, url_prefix='/api/chat')

@chat_bp.route('/conversations', methods=['POST'])
@jwt_required()
def start_conversation():
    """Create new conversation."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        title = data.get('title', 'New Conversation')
        
        title = sanitize_input(title)
        
        conversation = create_conversation(user_id, title)
        return jsonify({
            'success': True,
            'data': conversation.to_dict(),
            'message': 'Conversation created'
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@chat_bp.route('/conversations', methods=['GET'])
@jwt_required()
def list_conversations():
    """List user's conversations with pagination."""
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        paginated_data = get_user_conversations(user_id, page, per_page)
        return jsonify({
            'success': True,
            'data': paginated_data,
            'message': 'Conversations retrieved'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@chat_bp.route('/conversations/<conversation_id>', methods=['GET'])
@jwt_required()
def get_conversation(conversation_id):
    """Get conversation with messages."""
    try:
        user_id = get_jwt_identity()
        conversation = get_conversation_messages(conversation_id, user_id)
        if not conversation:
            return jsonify({'success': False, 'message': 'Conversation not found'}), 404
            
        return jsonify({
            'success': True,
            'data': conversation,
            'message': 'Conversation details retrieved'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@chat_bp.route('/conversations/<conversation_id>', methods=['DELETE'])
@jwt_required()
def remove_conversation(conversation_id):
    """Delete conversation."""
    try:
        user_id = get_jwt_identity()
        success = delete_conversation(conversation_id, user_id)
        if not success:
            return jsonify({'success': False, 'message': 'Conversation not found or access denied'}), 404
            
        return jsonify({
            'success': True,
            'data': None,
            'message': 'Conversation deleted'
        }), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500

@chat_bp.route('/conversations/<conversation_id>/messages', methods=['POST'])
@jwt_required()
def send_message(conversation_id):
    """Send message and get AI response."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        if not data or not data.get('message'):
            return jsonify({'success': False, 'message': 'Message is required'}), 400
            
        user_text = sanitize_input(data.get('message'))
        
        # 1. Save user message
        user_msg = save_message(conversation_id, user_id, 'user', user_text)
        if not user_msg:
             return jsonify({'success': False, 'message': 'Conversation not found'}), 404
        
        # 2. Check emergency
        emergency_data = detect_emergency(user_text)
        
        if emergency_data:
            # 3. Emergency flow
            user_msg.emergency_flag = True
            assistant_text = f"🚨 EMERGENCY DETECTED ({emergency_data['category'].upper()}). Please seek immediate medical attention or call emergency services right away."
            assistant_msg = save_message(
                conversation_id, user_id, 'assistant', assistant_text, emergency_flag=True
            )
            
            return jsonify({
                'success': True,
                'data': {
                    'user_message': user_msg.to_dict(),
                    'assistant_message': assistant_msg.to_dict(),
                    'emergency': True
                },
                'message': 'Emergency detected'
            }), 200
            
        # 4. RAG Flow
        ai_resp_data = get_ai_response(user_text, conversation_id)
        answer = filter_response(ai_resp_data.get('answer', ''))
        answer = add_disclaimer(answer)
        sources = ai_resp_data.get('sources', [])
        confidence = ai_resp_data.get('confidence', 0.0)
        
        # 5. Save assistant message
        follow_ups = ai_resp_data.get('follow_up_questions', [])
        topics = ai_resp_data.get('related_topics', [])
        meta = {
            'follow_up_questions': follow_ups,
            'related_topics': topics
        }
        
        assistant_msg = save_message(
            conversation_id, user_id, 'assistant', answer, 
            sources=sources, confidence=confidence, metadata_info=meta
        )
        
        # 6. Return response
        return jsonify({
            'success': True,
            'data': {
                'user_message': user_msg.to_dict(),
                'assistant_message': assistant_msg.to_dict(),
                'emergency': False,
                'related_topics': topics,
                'follow_up_questions': follow_ups
            },
            'message': 'Response generated'
        }), 200


    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
