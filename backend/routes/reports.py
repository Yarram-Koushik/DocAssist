from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
from werkzeug.utils import secure_filename
from services.report_service import process_report, get_user_reports, get_report, delete_report
from utils.validators import allowed_file

reports_bp = Blueprint('reports_bp', __name__, url_prefix='/api/reports')

UPLOAD_FOLDER = os.path.join('data', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@reports_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_report():
    """Accept file upload and process report."""
    try:
        user_id = get_jwt_identity()
        
        if 'file' not in request.files:
            return jsonify({'success': False, 'message': 'No file part in request'}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No selected file'}), 400
            
        from flask import current_app
        if not allowed_file(file.filename, current_app.config.get('ALLOWED_EXTENSIONS', {'pdf', 'png', 'jpg', 'jpeg'})):
            return jsonify({'success': False, 'message': 'File type not allowed. Please upload a PDF or image (PNG, JPG).'}), 400
            
        report_type = request.form.get('report_type', 'General Report')
        
        filename = secure_filename(file.filename)
        saved_filename = f"{user_id}_{filename}"
        file_path = os.path.join(UPLOAD_FOLDER, saved_filename)
        file.save(file_path)
        
        file_extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
        file_type = 'pdf' if file_extension == 'pdf' else 'image'
        
        report_data = process_report(file_path, file_type, report_type, user_id, filename=filename)
        
        return jsonify({
            'success': True,
            'data': report_data,
            'message': 'Report processed successfully'
        }), 201
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e) or 'Failed to process report'}), 500


@reports_bp.route('/', methods=['GET'])
@jwt_required()
def list_reports():
    """List user's reports with pagination."""
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        reports = get_user_reports(user_id, page, per_page)
        return jsonify({
            'success': True,
            'data': reports,
            'message': 'Reports retrieved'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@reports_bp.route('/<report_id>', methods=['GET'])
@jwt_required()
def get_report_details(report_id):
    """Get report details."""
    try:
        user_id = get_jwt_identity()
        report = get_report(report_id, user_id)
        if not report:
            return jsonify({'success': False, 'message': 'Report not found'}), 404
            
        return jsonify({
            'success': True,
            'data': report,
            'message': 'Report details retrieved'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@reports_bp.route('/<report_id>', methods=['DELETE'])
@jwt_required()
def remove_report(report_id):
    """Delete report."""
    try:
        user_id = get_jwt_identity()
        success = delete_report(report_id, user_id)
        if not success:
            return jsonify({'success': False, 'message': 'Report not found or access denied'}), 404
            
        return jsonify({
            'success': True,
            'data': None,
            'message': 'Report deleted'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
