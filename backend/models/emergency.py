from datetime import datetime
from app import db

class EmergencyAlert(db.Model):
    __tablename__ = 'emergency_alerts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    trigger_message = db.Column(db.Text, nullable=False)
    severity = db.Column(db.String(20), nullable=False) # 'high' or 'critical'
    emergency_type = db.Column(db.String(100))
    response_given = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'trigger_message': self.trigger_message,
            'severity': self.severity,
            'emergency_type': self.emergency_type,
            'response_given': self.response_given,
            'created_at': self.created_at.isoformat()
        }
