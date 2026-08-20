from datetime import datetime
from app import db
import json

class DoctorSummary(db.Model):
    __tablename__ = 'doctor_summaries'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    conversation_id = db.Column(db.Integer, db.ForeignKey('conversations.id'), nullable=True)
    summary_text = db.Column(db.Text, nullable=False)
    report_ids = db.Column(db.JSON)
    export_format = db.Column(db.String(50))
    share_token = db.Column(db.String(100), unique=True, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Synonym for backward compatibility
    content = db.synonym('summary_text')
    
    def to_dict(self):
        r_ids = self.report_ids
        if isinstance(r_ids, str):
            try:
                r_ids = json.loads(r_ids)
            except Exception:
                pass
                
        text = self.summary_text
        try:
            if isinstance(text, str) and (text.startswith('{') or text.startswith('[')):
                text_parsed = json.loads(text)
            else:
                text_parsed = text
        except Exception:
            text_parsed = text
            
        return {
            'id': self.id,
            'user_id': self.user_id,
            'conversation_id': self.conversation_id,
            'summary_text': text,
            'content': text_parsed,
            'report_ids': r_ids,
            'export_format': self.export_format,
            'share_token': self.share_token,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

