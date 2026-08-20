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
            # Fallback to direct LLM without RAG
            from rag.chain import get_llm
            from rag.prompts import SYSTEM_PROMPT
            llm = get_llm()
            # We must return the JSON structure expected by the frontend
            prompt = f"{SYSTEM_PROMPT}\n\nRecent Conversation History:\n{history_str}\n\nUser Question:\n{message}\n\nPlease format your response as a JSON object with 'answer' (your response), 'sources' (empty list), 'confidence' ('low'), 'related_topics' (empty list), 'follow_up_questions' (empty list), and 'disclaimer' (a short medical disclaimer). Do not use markdown backticks."
            response = llm.predict(prompt)
            import json
            if response.startswith("```json"):
                response = response[7:-3].strip()
            elif response.startswith("```"):
                response = response[3:-3].strip()
            result_json = json.loads(response)
            
            conf = result_json.get('confidence', 0.5)
            if isinstance(conf, str):
                conf_map = {'low': 0.3, 'medium': 0.7, 'high': 0.9}
                conf = conf_map.get(conf.lower(), 0.5)
            result_json['confidence'] = float(conf)
            return result_json
        except Exception as inner_e:
            print(f"Fallback LLM error: {inner_e}")
            return {
                'answer': 'I am an AI assistant. I cannot access my medical knowledge base right now, but I can help you with general questions. Remember to always consult a doctor for medical advice.',
                'sources': [],
                'confidence': 0.1,
                'related_topics': [],
                'follow_up_questions': []
            }
