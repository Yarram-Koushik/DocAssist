import json
from app import db
from models.summary import DoctorSummary
from models.chat import ChatHistory
from models.report import Report
from utils.helpers import paginate_query, generate_share_token

def generate_summary(user_id, conversation_id, report_ids):
    """Gather context, call LLM, save summary."""
    try:
        conv_id = int(conversation_id) if conversation_id else None
        # Gather conversation
        messages = []
        if conv_id:
            messages = ChatHistory.query.filter_by(conversation_id=conv_id).order_by(ChatHistory.created_at.asc()).all()
            
        chat_text = "\n".join([f"{msg.role}: {msg.message}" for msg in messages]) if messages else "General medical consultation"
        
        # Gather reports
        report_text = ""
        clean_rep_ids = []
        if report_ids:
            for r_id in report_ids:
                try:
                    clean_rep_ids.append(int(r_id))
                except (ValueError, TypeError):
                    pass
                    
            if clean_rep_ids:
                reports = Report.query.filter(Report.id.in_(clean_rep_ids), Report.user_id == user_id).all()
                for r in reports:
                    report_text += f"Report Type: {r.report_type}\nFindings: {r.extracted_data or r.extracted_values}\n\n"
                
        from summary.generator import generate_doctor_summary
        summary_content = generate_doctor_summary(chat_text, report_text)
        
        new_summary = DoctorSummary(
            user_id=user_id,
            conversation_id=conv_id,
            summary_text=json.dumps(summary_content) if isinstance(summary_content, dict) else str(summary_content),
            report_ids=clean_rep_ids if clean_rep_ids else None
        )
        db.session.add(new_summary)
        db.session.commit()
        
        return new_summary.to_dict()
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise ValueError(f"Failed to generate summary: {str(e)}")



def get_user_summaries(user_id, page, per_page):
    """Paginated list of summaries."""
    query = DoctorSummary.query.filter_by(user_id=user_id).order_by(DoctorSummary.created_at.desc())
    return paginate_query(query, page, per_page)

def get_summary(summary_id, user_id):
    """Verify ownership, return summary."""
    summary = DoctorSummary.query.filter_by(id=summary_id, user_id=user_id).first()
    if not summary:
        return None
    return summary.to_dict()

def get_shared_summary(share_token):
    """Lookup by token."""
    summary = DoctorSummary.query.filter_by(share_token=share_token).first()
    if not summary:
        return None
    return summary.to_dict()

def export_summary(summary_id, user_id, format):
    """Generate PDF or TXT bytes."""
    summary = DoctorSummary.query.filter_by(id=summary_id, user_id=user_id).first()
    if not summary:
        return None, None, None
        
    try:
        if format == 'pdf':
            from summary.exporter import export_to_pdf
            file_bytes = export_to_pdf(summary.summary_text)
            return file_bytes, f"summary_{summary_id}.pdf", "application/pdf"
        else:
            from summary.exporter import export_to_txt
            text_str = export_to_txt(summary.summary_text)
            file_bytes = text_str.encode('utf-8') if isinstance(text_str, str) else text_str
            return file_bytes, f"summary_{summary_id}.txt", "text/plain"

    except Exception as e:
        print(f"Export error: {e}")
        raise ValueError(f"Failed to export to {format}")

def create_share_link(summary_id, user_id):
    """Generate and save share token."""
    summary = DoctorSummary.query.filter_by(id=summary_id, user_id=user_id).first()
    if not summary:
        return None
        
    token = generate_share_token()
    summary.share_token = token
    db.session.commit()
    
    return token
