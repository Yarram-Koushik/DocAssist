from models.chat import Conversation
from models.report import Report
from models.medicine import Medicine
from models.chat import ChatHistory

def get_user_dashboard(user_id):
    """Return dashboard summary for user."""
    recent_chats = Conversation.query.filter_by(user_id=user_id).order_by(Conversation.updated_at.desc()).limit(3).all()
    recent_reports = Report.query.filter_by(user_id=user_id).order_by(Report.created_at.desc()).limit(3).all()
    recent_medicines = Medicine.query.filter_by(user_id=user_id).order_by(Medicine.created_at.desc()).limit(3).all()
    
    total_chats = Conversation.query.filter_by(user_id=user_id).count()
    total_reports = Report.query.filter_by(user_id=user_id).count()
    total_searches = Medicine.query.filter_by(user_id=user_id).count()
    
    # Check if there are any emergency alerts for this user's conversations
    user_conversations = [c.id for c in Conversation.query.filter_by(user_id=user_id).all()]
    emergency_alerts = 0
    if user_conversations:
        emergency_alerts = ChatHistory.query.filter(
            ChatHistory.conversation_id.in_(user_conversations),
            ChatHistory.emergency_flag == True
        ).count()
        
    return {
        'recent_chats': [c.to_dict() for c in recent_chats],
        'recent_reports': [r.to_dict() for r in recent_reports],
        'recent_medicines': [m.to_dict() for m in recent_medicines],
        'stats': {
            'total_chats': total_chats,
            'total_reports': total_reports,
            'total_searches': total_searches,
            'emergency_alerts': emergency_alerts
        }
    }
