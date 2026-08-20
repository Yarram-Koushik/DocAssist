from app import db
from models.medicine import Medicine
from utils.helpers import paginate_query
import json

def search_medicine(query, user_id):
    """Search openFDA, format results, save log."""
    try:
        from medicine.openfda_client import search_drug
        from medicine.formatter import format_medicine_info
        
        raw_results = search_drug(query)
        formatted_results = format_medicine_info(raw_results)
        
        # Save search log
        search_log = Medicine(
            user_id=user_id,
            search_query=query,
            generic_name=formatted_results.get('generic_name', 'Unknown'),
            result_data=json.dumps(formatted_results)
        )
        db.session.add(search_log)
        db.session.commit()
        
        return formatted_results
    except Exception as e:
        print(f"Error searching medicine: {e}")
        raise ValueError("Failed to retrieve medicine information")

def get_search_history(user_id, page, per_page):
    """Paginated search history."""
    query = Medicine.query.filter_by(user_id=user_id).order_by(Medicine.searched_at.desc())
    return paginate_query(query, page, per_page)
