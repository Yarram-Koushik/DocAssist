from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.medicine_service import search_medicine, get_search_history
from medicine.interaction_checker import check_drug_interactions
from utils.validators import sanitize_input

medicine_bp = Blueprint('medicine_bp', __name__, url_prefix='/api/medicine')

@medicine_bp.route('/search', methods=['POST'])
@jwt_required()
def search():
    """Search medicine via openFDA."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or not data.get('query'):
            return jsonify({'success': False, 'message': 'Search query is required'}), 400
            
        query = sanitize_input(data.get('query'))
        
        results = search_medicine(query, user_id)
        
        return jsonify({
            'success': True,
            'data': results,
            'message': 'Search completed successfully'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@medicine_bp.route('/interactions', methods=['POST'])
@jwt_required()
def check_interactions():
    """Check multi-drug interactions."""
    try:
        data = request.get_json() or {}
        medications = data.get('medications', [])
        
        if not isinstance(medications, list) or len(medications) < 2:
            return jsonify({
                'success': False, 
                'message': 'Please provide at least two medications to check for interactions.'
            }), 400
            
        clean_meds = [sanitize_input(str(m)) for m in medications if m]
        result = check_drug_interactions(clean_meds)
        
        return jsonify({
            'success': True,
            'data': result,
            'message': 'Interaction analysis complete'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@medicine_bp.route('/history', methods=['GET'])
@jwt_required()
def history():
    """Get user's medicine search history."""
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        history_data = get_search_history(user_id, page, per_page)
        
        return jsonify({
            'success': True,
            'data': history_data,
            'message': 'Search history retrieved'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

