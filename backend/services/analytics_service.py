from app import db
from models.user import User
from models.chat import Conversation
from models.chat import ChatHistory
from models.report import Report
from models.medicine import Medicine
from models.summary import DoctorSummary
from models.feedback import Feedback
from models.analytics import Analytics
import datetime
from sqlalchemy import func
import json

def get_overview_stats():
    """Aggregate counts for admin dashboard."""
    total_users = User.query.count()
    
    seven_days_ago = datetime.datetime.utcnow() - datetime.timedelta(days=7)
    active_users_7d = db.session.query(Analytics.user_id).filter(
        Analytics.created_at >= seven_days_ago
    ).distinct().count()
    
    total_chats = Conversation.query.count()
    total_reports = Report.query.count()
    emergency_count = ChatHistory.query.filter_by(emergency_flag=True).count()
    
    avg_rating = db.session.query(func.avg(Feedback.rating)).scalar() or 0
    total_medicines = Medicine.query.count()
    total_summaries = DoctorSummary.query.count()
    
    return {
        'total_users': total_users,
        'active_users_7d': active_users_7d,
        'total_chats': total_chats,
        'total_reports': total_reports,
        'emergency_count': emergency_count,
        'avg_feedback_rating': float(round(avg_rating, 2)),
        'total_medicines': total_medicines,
        'total_summaries': total_summaries
    }

def get_chat_analytics(days):
    """Chat volume over time."""
    since_date = datetime.datetime.utcnow() - datetime.timedelta(days=days)
    results = db.session.query(
        func.date(Conversation.created_at).label('date'),
        func.count(Conversation.id).label('count')
    ).filter(Conversation.created_at >= since_date).group_by(func.date(Conversation.created_at)).all()
    
    return [{'date': str(r.date), 'count': r.count} for r in results]

def get_report_analytics():
    """Report type distribution."""
    results = db.session.query(
        Report.report_type,
        func.count(Report.id).label('count')
    ).group_by(Report.report_type).all()
    
    return [{'report_type': r.report_type, 'count': r.count} for r in results]

def get_emergency_analytics():
    """Emergency alerts count."""
    count = ChatHistory.query.filter_by(emergency_flag=True).count()
    # Can be extended to group by time/type if needed
    return {'total_emergencies': count}

def get_feedback_analytics():
    """Feedback distribution by rating."""
    results = db.session.query(
        Feedback.rating,
        func.count(Feedback.id).label('count')
    ).group_by(Feedback.rating).all()
    
    return [{'rating': r.rating, 'count': r.count} for r in results]

def get_medicine_analytics():
    """Top searched medicines."""
    results = db.session.query(
        Medicine.search_query,
        func.count(Medicine.id).label('count')
    ).group_by(Medicine.search_query).order_by(func.count(Medicine.id).desc()).limit(10).all()
    
    return [{'medicine': r[0] if isinstance(r, tuple) else getattr(r, 'search_query', str(r)), 'count': r[1] if isinstance(r, tuple) else getattr(r, 'count', 0)} for r in results]


def get_user_analytics(user_id):
    """Single user stats."""
    chat_count = Conversation.query.filter_by(user_id=user_id).count()
    report_count = Report.query.filter_by(user_id=user_id).count()
    medicine_count = Medicine.query.filter_by(user_id=user_id).count()
    summary_count = DoctorSummary.query.filter_by(user_id=user_id).count()
    alert_count = ChatHistory.query.filter_by(user_id=user_id, emergency_flag=True).count()
    
    return {
        'total_conversations': chat_count,
        'total_reports': report_count,
        'total_medicine_searches': medicine_count,
        'total_summaries': summary_count,
        'total_alerts': alert_count
    }

def get_users_list(page, per_page):
    """Paginated users with computed stats."""
    from utils.helpers import paginate_query
    query = User.query.order_by(User.created_at.desc())
    paginated = paginate_query(query, page, per_page)
    
    # Enhance items with stats
    for item in paginated['items']:
        uid = item['id']
        item['chat_count'] = Conversation.query.filter_by(user_id=uid).count()
        item['report_count'] = Report.query.filter_by(user_id=uid).count()
        last_event = Analytics.query.filter_by(user_id=uid).order_by(Analytics.created_at.desc()).first()
        item['last_active'] = str(last_event.created_at) if last_event else str(item['created_at'])
        
    return paginated

def track_event(event_type, user_id, event_data):
    """Save analytics event."""
    event = Analytics(
        user_id=user_id,
        event_type=event_type,
        event_data=json.dumps(event_data)
    )
    db.session.add(event)
    db.session.commit()
    return True
