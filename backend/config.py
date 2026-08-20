import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}
    
    # AI Configuration
    LLM_PROVIDER = os.getenv('LLM_PROVIDER', 'groq')
    GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')
    
    # Vector DB
    FAISS_INDEX_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'vector_store')
    
    cors_raw = os.getenv('CORS_ORIGINS', '*')
    CORS_ORIGINS = [o.strip() for o in cors_raw.split(',') if o.strip()] if cors_raw != '*' else '*'

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///' + os.path.join(os.path.dirname(os.path.abspath(__file__)), 'docassist.db'))

class ProductionConfig(Config):
    DEBUG = False
    _db_url = os.getenv('DATABASE_URL')
    if _db_url and _db_url.startswith('postgres://'):
        _db_url = _db_url.replace('postgres://', 'postgresql://', 1)
    SQLALCHEMY_DATABASE_URI = _db_url or ('sqlite:///' + os.path.join(os.path.dirname(os.path.abspath(__file__)), 'docassist.db'))

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

