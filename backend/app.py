import os
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_name='default'):
    app = Flask(__name__)
    
    from config import config
    app.config.from_object(config[config_name])
    
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Enable universal CORS for cloud deployment (Vercel -> Render)
    CORS(app, resources={r"/*": {"origins": "*"}})
    
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
        
    # Explicitly import all SQLAlchemy models so db.metadata registers all tables
    import models.user
    import models.chat
    import models.report
    import models.medicine
    import models.summary
    import models.emergency
    import models.feedback
    import models.analytics
    import models.medical_source

    from routes.auth import auth_bp
    from routes.chat import chat_bp
    from routes.reports import reports_bp
    from routes.medicine import medicine_bp
    from routes.summary import summary_bp
    from routes.analytics import analytics_bp
    from routes.admin import admin_bp
    from routes.history import history_bp
    from routes.feedback import feedback_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    app.register_blueprint(medicine_bp, url_prefix='/api/medicine')
    app.register_blueprint(summary_bp, url_prefix='/api/summary')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(history_bp, url_prefix='/api/history')
    app.register_blueprint(feedback_bp, url_prefix='/api/feedback')

    # Auto-initialize database tables on startup (after all models are registered)
    with app.app_context():
        try:
            db.create_all()
        except Exception as e:
            app.logger.warning(f"Database init warning: {e}")


    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({'status': 'healthy', 'service': 'DocAssist AI API'}), 200


    @app.errorhandler(400)
    def bad_request(e):
        return jsonify(error=str(e)), 400
        
    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify(error=str(e)), 401
        
    @app.errorhandler(403)
    def forbidden(e):
        return jsonify(error=str(e)), 403

    @app.errorhandler(404)
    def not_found(e):
        return jsonify(error=str(e)), 404
        
    @app.errorhandler(500)
    def internal_error(e):
        return jsonify(error=str(e)), 500

    return app
