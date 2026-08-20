import hmac
import logging
import bcrypt
from app import db
from models.user import User
from werkzeug.security import check_password_hash as werkzeug_check_hash
from flask_jwt_extended import create_access_token, create_refresh_token
from utils.rate_limiter import security_manager

logger = logging.getLogger('auth_service')
BCRYPT_ROUNDS = 12

def hash_password(password: str) -> str:
    """Hash password using bcrypt with salt rounds of at least 12."""
    salt = bcrypt.gensalt(rounds=BCRYPT_ROUNDS)
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(stored_hash: str, password: str) -> tuple[bool, bool]:
    """
    Verify password using constant-time comparison.
    Supports bcrypt and legacy hashes for seamless auto-migration.
    Returns (is_valid, needs_rehash).
    """
    if not stored_hash or not password:
        return False, False
        
    # Check if stored hash is a standard bcrypt hash
    if stored_hash.startswith(('$2b$', '$2a$', '$2y$')):
        try:
            is_valid = bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))
            # Check cost factor: if less than 12, flag for rehash
            parts = stored_hash.split('$')
            cost = int(parts[2]) if len(parts) > 2 and parts[2].isdigit() else BCRYPT_ROUNDS
            needs_rehash = (cost < BCRYPT_ROUNDS)
            return is_valid, (is_valid and needs_rehash)
        except Exception as e:
            logger.error(f"Bcrypt verification error: {e}")
            return False, False

    # Check legacy Werkzeug scrypt/pbkdf2/md5/sha1 hashes
    try:
        if werkzeug_check_hash(stored_hash, password):
            return True, True
    except Exception:
        pass

    # Check legacy plain-text password using constant-time comparison
    try:
        if hmac.compare_digest(stored_hash.encode('utf-8'), password.encode('utf-8')):
            return True, True
    except Exception:
        pass

    return False, False


def register_user(email: str, username: str, password: str, full_name: str):
    """
    Create a new user with bcrypt-hashed password (rounds=12) and return user and tokens.
    """
    # Check existence
    if User.query.filter_by(email=email).first():
        raise ValueError("An account with these details cannot be created.")
        
    if User.query.filter_by(username=username).first():
        raise ValueError("An account with these details cannot be created.")
        
    hashed_password = hash_password(password)
    new_user = User(
        email=email,
        username=username,
        password_hash=hashed_password,
        full_name=full_name
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    access_token = create_access_token(identity=str(new_user.id))
    refresh_token = create_refresh_token(identity=str(new_user.id))
    
    return new_user, {'access_token': access_token, 'refresh_token': refresh_token}


def authenticate_user(email: str, password: str, client_ip: str = "Unknown"):
    """
    Authenticate user with lockout checks, bcrypt verification, and auto-migration rehash.
    Returns auth data dict or None.
    """
    email_clean = email.strip().lower()
    
    # 1. Check account lockout state
    is_locked, remaining_seconds = security_manager.is_account_locked(email_clean)
    if is_locked:
        logger.warning(f"[BLOCKED LOGIN ATTEMPT - ACCOUNT LOCKED] Email={email_clean} IP={client_ip} RemainingSec={remaining_seconds}")
        # Always return None without exposing lockout reason to client
        return None

    # 2. Query user
    user = User.query.filter_by(email=email_clean).first()
    if not user:
        security_manager.record_login_failure(email_clean, client_ip)
        return None
        
    # 3. Verify password
    is_valid, needs_rehash = verify_password(user.password_hash, password)
    if not is_valid:
        security_manager.record_login_failure(email_clean, client_ip)
        return None

    # 4. Successful login -> reset failed attempts
    security_manager.record_login_success(email_clean, client_ip)

    # 5. Transparent auto-migration rehash if legacy or weak hash was used
    if needs_rehash:
        logger.info(f"[AUTO-MIGRATION] Re-hashing password to bcrypt (rounds={BCRYPT_ROUNDS}) for User ID={user.id}")
        user.password_hash = hash_password(password)
        db.session.commit()

    # 6. Generate JWT tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return {
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }


def get_user_by_id(user_id):
    """Return user by ID."""
    return db.session.get(User, user_id)


def update_user_profile(user_id, data):
    """Update profile fields."""
    user = db.session.get(User, user_id)
    if not user:
        raise ValueError("User not found")
        
    for key, value in data.items():
        if hasattr(user, key):
            setattr(user, key, value)
            
    db.session.commit()
    return user


def change_password(user_id, current_password: str, new_password: str):
    """Verify current password and set new bcrypt-hashed password."""
    user = db.session.get(User, user_id)
    if not user:
        raise ValueError("User not found")
        
    is_valid, _ = verify_password(user.password_hash, current_password)
    if is_valid:
        user.password_hash = hash_password(new_password)
        db.session.commit()
        return True
    return False

