from app import db
from models.report import Report
from utils.helpers import paginate_query
from utils.safety import filter_response, add_disclaimer
import json
import os

def process_report(file_path, file_type, report_type, user_id, filename=None):
    """Orchestrate parsing and AI explanation."""
    text_content = ""
    if not filename:
        filename = os.path.basename(file_path)
        if filename.startswith(f"{user_id}_"):
            filename = filename[len(f"{user_id}_"):]

    try:
        if file_type == 'pdf':
            from report_parser.pdf_parser import extract_text_from_pdf
            text_content = extract_text_from_pdf(file_path)
        else:
            from report_parser.ocr_parser import extract_text_from_image
            text_content = extract_text_from_image(file_path)
            
        from report_parser.text_cleaner import clean_text
        cleaned_text = clean_text(text_content) if text_content else ""
        
        from report_parser.entity_extractor import extract_medical_values
        extracted_values = extract_medical_values(cleaned_text) if cleaned_text else []
        
        from report_parser.reference_ranges import check_range, get_range_info
        processed_values = []
        for val in extracted_values:
            status = check_range(val['parameter'], val['value'])
            normalized_status = 'low' if status == 'below' else ('high' if status == 'above' else status)
            range_info = get_range_info(val['parameter'])
            range_str = f"{range_info['min']} - {range_info['max']} {range_info['unit']}" if range_info else "N/A"
            processed_values.append({
                'name': val['parameter'],
                'parameter': val['parameter'],
                'value': val['value'],
                'unit': val.get('unit', ''),
                'status': normalized_status,
                'raw_status': status,
                'reference_range': range_str,
                'range_info': range_info,
                'raw_text': val.get('raw_text', '')
            })
            
        explanation = ""
        try:
            from rag.chain import get_llm
            from rag.prompts import REPORT_ANALYSIS_PROMPT
            
            llm = get_llm()
            prompt = REPORT_ANALYSIS_PROMPT.format(
                report_values=json.dumps(processed_values) if processed_values else (cleaned_text[:600] if cleaned_text else "No extractable text")
            )
            response = llm.invoke(prompt)
            explanation_raw = response.content if hasattr(response, 'content') else str(response)
            
            explanation = filter_response(explanation_raw)
            explanation = add_disclaimer(explanation)
        except Exception as llm_err:
            print(f"LLM explanation error: {llm_err}")
            abnormal_items = [v for v in processed_values if v.get('status') in ['low', 'high', 'below', 'above']]
            if abnormal_items:
                items_desc = ", ".join([f"{v['name']} ({v['value']} {v['unit']}, status: {v['status']})" for v in abnormal_items])
                explanation = f"Analysis identified {len(processed_values)} parameters. Findings requiring attention: {items_desc}. Please consult your physician for detailed clinical evaluation."
            elif processed_values:
                explanation = f"All {len(processed_values)} extracted parameters appear within standard reference ranges. Please consult your physician to verify these results in the context of your overall health."
            else:
                explanation = "The document was processed, but no specific standard laboratory parameters were matched. Please share the complete report with your healthcare provider for clinical evaluation."
            explanation = add_disclaimer(explanation)
        
        new_report = Report(
            user_id=user_id,
            filename=filename,
            file_path=file_path,
            file_type=file_type,
            report_type=report_type,
            extracted_values=json.dumps(processed_values),
            reference_ranges=json.dumps({v['name']: v.get('reference_range') for v in processed_values}),
            ai_explanation=explanation
        )
        
        db.session.add(new_report)
        db.session.commit()
        
        return new_report.to_dict()
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise e

def get_user_reports(user_id, page, per_page):
    """Paginated list of reports."""
    query = Report.query.filter_by(user_id=user_id).order_by(Report.uploaded_at.desc())
    return paginate_query(query, page, per_page)

def get_report(report_id, user_id):
    """Verify ownership and return report."""
    report = Report.query.filter_by(id=report_id, user_id=user_id).first()
    if not report:
        return None
    return report.to_dict()

def delete_report(report_id, user_id):
    """Verify ownership, delete DB record and file."""
    report = Report.query.filter_by(id=report_id, user_id=user_id).first()
    if not report:
        return False
        
    try:
        if os.path.exists(report.file_path):
            os.remove(report.file_path)
    except Exception as e:
        print(f"Error deleting file {report.file_path}: {e}")
        
    db.session.delete(report)
    db.session.commit()
    return True
