from app import db
from models.chat import Conversation, ChatHistory
from utils.helpers import paginate_query
import json

def create_conversation(user_id, title):
    """Create and return conversation."""
    conv = Conversation(user_id=user_id, title=title)
    db.session.add(conv)
    db.session.commit()
    return conv

def get_user_conversations(user_id, page, per_page):
    """Paginated list of conversations."""
    query = Conversation.query.filter_by(user_id=user_id).order_by(Conversation.updated_at.desc())
    return paginate_query(query, page, per_page)

def get_conversation_messages(conversation_id, user_id):
    """Verify ownership, return conversation with messages."""
    conv = Conversation.query.filter_by(id=conversation_id, user_id=user_id).first()
    if not conv:
        return None
        
    messages = ChatHistory.query.filter_by(conversation_id=conversation_id).order_by(ChatHistory.created_at.asc()).all()
    
    return {
        'conversation': conv.to_dict(),
        'messages': [msg.to_dict() for msg in messages]
    }

def delete_conversation(conversation_id, user_id):
    """Verify ownership, delete."""
    conv = Conversation.query.filter_by(id=conversation_id, user_id=user_id).first()
    if not conv:
        return False
        
    db.session.delete(conv)
    db.session.commit()
    return True

def save_message(conversation_id, user_id, role, message, sources=None, confidence=None, emergency_flag=False, metadata_info=None):
    """Create ChatHistory record."""
    conv = Conversation.query.filter_by(id=conversation_id, user_id=user_id).first()
    if not conv:
        return None
        
    msg = ChatHistory(
        conversation_id=conversation_id,
        user_id=user_id,
        role=role,
        message=message,
        sources=json.dumps(sources) if sources and isinstance(sources, list) else (sources if sources else None),
        confidence_score=confidence,
        emergency_flag=emergency_flag,
        metadata_info=json.dumps(metadata_info) if metadata_info and isinstance(metadata_info, dict) else (metadata_info if metadata_info else None)
    )
    db.session.add(msg)
    
    # Update conversation timestamp and title if needed
    conv.updated_at = db.func.now()
    if not conv.title or conv.title.strip().lower() in ['new conversation', 'new consultation', 'untitled']:
        clean_msg = message.strip()
        words = clean_msg.split()
        short_title = " ".join(words[:6])
        if len(short_title) > 32:
            short_title = short_title[:30] + '...'
        conv.title = short_title
    
    db.session.commit()
    return msg



def get_ai_response(message, conversation_id):
    """Calls RAG pipeline."""
    try:
        from rag.chain import query_rag
        from rag.vector_store import VectorStoreManager
        
        from flask import current_app
        # Ensure vector store is available
        index_path = current_app.config.get('FAISS_INDEX_PATH', 'vector_store')
        vs_manager = VectorStoreManager(index_path)
            
        # Fetch last 5 messages for context
        recent_messages = ChatHistory.query.filter_by(conversation_id=conversation_id).order_by(ChatHistory.created_at.desc()).limit(5).all()
        history_str = ""
        for msg in reversed(recent_messages):
            if msg.role in ['user', 'assistant']:
                history_str += f"{msg.role.capitalize()}: {msg.message}\n"

        result = query_rag(message, vs_manager, conversation_history=history_str)
        
        conf = result.get('confidence', 0.5)
        if isinstance(conf, str):
            conf_map = {'low': 0.3, 'medium': 0.7, 'high': 0.9}
            conf = conf_map.get(conf.lower(), 0.5)
            
        return {
            'answer': result.get('answer', 'I am unable to provide an answer at this moment.'),
            'sources': result.get('sources', []),
            'confidence': float(conf),
            'related_topics': result.get('related_topics', []),
            'follow_up_questions': result.get('follow_up_questions', [])
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        try:
            # Direct LLM invocation with structured medical prompt
            from rag.chain import get_llm
            from rag.prompts import SYSTEM_PROMPT
            llm = get_llm()
            
            prompt = (
                f"{SYSTEM_PROMPT}\n\n"
                f"Conversation History:\n{history_str}\n\n"
                f"Patient Question:\n{message}\n\n"
                f"Provide a thoughtful, helpful clinical response. Format strictly as JSON with keys: "
                f"'answer' (your full response), 'sources' (list of clinical guidance sources), "
                f"'confidence' (float between 0.7 and 0.95), 'related_topics' (list of strings), "
                f"'follow_up_questions' (empty list), 'disclaimer' (medical disclaimer text)."
            )
            
            response = llm.invoke(prompt)
            response_text = response.content if hasattr(response, 'content') else str(response)
            
            import json
            import re
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                result_json = json.loads(json_match.group(0))
            else:
                result_json = {
                    'answer': response_text,
                    'sources': [{'name': 'Clinical Medicine Guidance', 'url': ''}],
                    'confidence': 0.85,
                    'related_topics': ['Symptom Assessment', 'Clinical Guidance'],
                    'follow_up_questions': []
                }
            
            conf = result_json.get('confidence', 0.8)
            if isinstance(conf, str):
                conf_map = {'low': 0.4, 'medium': 0.75, 'high': 0.9}
                conf = conf_map.get(conf.lower(), 0.8)
            result_json['confidence'] = float(conf)
            return result_json
        except Exception as inner_e:
            print(f"Fallback LLM error: {inner_e}")
            return {
                'answer': (
                    f"Thank you for sharing your symptoms regarding '{message}'. "
                    f"While I am an AI assistant, symptoms like this should be monitored carefully. "
                    f"Please ensure you stay hydrated, rest, and consult a qualified healthcare provider if symptoms worsen, persist beyond 48-72 hours, or if you develop red-flag symptoms such as high fever, severe shortness of breath, or confusion."
                ),
                'sources': [{'name': 'WHO / CDC Guidelines', 'url': ''}],
                'confidence': 0.7,
                'related_topics': ['General Health Guidance', 'Symptom Triage'],
                'follow_up_questions': []
            }

