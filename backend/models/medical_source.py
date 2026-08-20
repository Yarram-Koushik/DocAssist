from datetime import datetime
from app import db

class MedicalSource(db.Model):
    __tablename__ = 'medical_sources'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    source_type = db.Column(db.String(100), nullable=False)
    url = db.Column(db.String(512), nullable=True)
    content_hash = db.Column(db.Text, nullable=True)
    ingested_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'source_type': self.source_type,
            'url': self.url,
            'content_hash': self.content_hash,
            'ingested_at': self.ingested_at.isoformat()
        }
