from datetime import datetime
from app import db
import json

class Report(db.Model):
    __tablename__ = 'reports'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(512), nullable=False)
    file_type = db.Column(db.String(50))
    report_type = db.Column(db.String(100))
    extracted_values = db.Column(db.JSON)
    ai_explanation = db.Column(db.Text)
    reference_ranges = db.Column(db.JSON)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Synonyms for backward compatibility
    created_at = db.synonym('uploaded_at')
    extracted_data = db.synonym('extracted_values')
    
    def to_dict(self):
        values = self.extracted_values
        if isinstance(values, str):
            try:
                values = json.loads(values)
            except Exception:
                pass
                
        ranges = self.reference_ranges
        if isinstance(ranges, str):
            try:
                ranges = json.loads(ranges)
            except Exception:
                pass
                
        return {
            'id': self.id,
            'user_id': self.user_id,
            'filename': self.filename,
            'file_path': self.file_path,
            'file_type': self.file_type,
            'report_type': self.report_type,
            'extracted_values': values,
            'extracted_data': values,
            'ai_explanation': self.ai_explanation,
            'reference_ranges': ranges,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None,
            'created_at': self.uploaded_at.isoformat() if self.uploaded_at else None
        }

