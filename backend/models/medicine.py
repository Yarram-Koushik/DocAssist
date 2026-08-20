from datetime import datetime
from app import db
import json

class Medicine(db.Model):
    __tablename__ = 'medicines'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    search_query = db.Column(db.String(255), nullable=False)
    generic_name = db.Column(db.String(255))
    result_data = db.Column(db.JSON)
    searched_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Synonyms for backward compatibility
    created_at = db.synonym('searched_at')
    query_text = db.synonym('search_query')
    
    def to_dict(self):
        data = self.result_data
        if isinstance(data, str):
            try:
                data = json.loads(data)
            except Exception:
                pass
        return {
            'id': self.id,
            'user_id': self.user_id,
            'search_query': self.search_query,
            'query_text': self.search_query,
            'generic_name': self.generic_name,
            'result_data': data,
            'searched_at': self.searched_at.isoformat() if self.searched_at else None,
            'created_at': self.searched_at.isoformat() if self.searched_at else None
        }

