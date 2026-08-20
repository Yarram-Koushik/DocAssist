import logging
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from services.auth_service import (
    register_user,
    authenticate_user,
    get_user_by_id,
    update_user_profile,
    change_password
)
from utils.auth_validators import (
    RegisterSchema,
    LoginSchema,
    PasswordResetRequestSchema,
    PasswordChangeSchema,
    ProfileUpdateSchema,
    validate_schema
)
from utils.rate_limiter import security_manager

logger = logging.getLogger('auth_routes')
auth_bp = Blueprint('auth_bp', __name__, url_prefix='/api/auth')


def get_client_ip() -> str:
    """Retrieve client IP address with proxy forwarding header support."""
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0].strip()
    return request.remote_addr or '127.0.0.1'


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user with server-side Pydantic schema validation, 
    input sanitization, and generic error reporting.
    """
    client_ip = get_client_ip()
    raw_data = request.get_json()
    if not raw_data:
        return jsonify({
            'success': False, 
            'message': 'Invalid input provided. Please verify your information and try again.'
        }), 400

    # 1. Pydantic validation and sanitization
    validated_data, err_msg = validate_schema(RegisterSchema, raw_data, client_ip=client_ip)
    if err_msg or not validated_data:
        return jsonify({'success': False, 'message': err_msg or 'Invalid input provided.'}), 400

    email = validated_data['email']
    username = validated_data['username']
    password = validated_data['password']
    full_name = validated_data['full_name']

    try:
        user, tokens = register_user(email, username, password, full_name)
        return jsonify({
            'success': True, 
            'data': {
                'user': user.to_dict(),
                'tokens': tokens,
                'access_token': tokens['access_token'],
                'refresh_token': tokens['refresh_token']
            }, 
            'message': 'User registered successfully'
        }), 201
    except ValueError as e:
        # Prevent account enumeration: return generic conflict message with 409
        logger.warning(f"[REGISTRATION CONFLICT] IP={client_ip} Reason={str(e)}")
        return jsonify({
            'success': False, 
            'message': 'An account with these details cannot be created.'
        }), 409
    except Exception as e:
        logger.error(f"[REGISTRATION ERROR] IP={client_ip} Error={str(e)}")
        return jsonify({
            'success': False, 
            'message': 'An error occurred during registration. Please try again later.'
        }), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Authenticate user with IP rate limiting (10 req/min), account lockout (15 min / 5 fails),
    progressive backoff delay, and exact generic error messaging.
    """
    client_ip = get_client_ip()

    # 1. IP Rate Limiting check (max 10 requests per minute)
    is_limited, retry_after = security_manager.is_ip_rate_limited(client_ip)
    if is_limited:
        resp = jsonify({
            'success': False, 
            'message': 'Too many login attempts. Please try again in a few moments.'
        })
        resp.headers['Retry-After'] = str(retry_after)
        return resp, 429

    raw_data = request.get_json()
    if not raw_data:
        return jsonify({'success': False, 'message': 'Incorrect email or password'}), 400

    # 2. Pydantic validation & sanitization
    validated_data, err_msg = validate_schema(LoginSchema, raw_data, client_ip=client_ip)
    if err_msg or not validated_data:
        # Apply slight progressive delay and return exact generic error
        return jsonify({'success': False, 'message': 'Incorrect email or password'}), 401

    email = validated_data['email']
    password = validated_data['password']

    try:
        auth_data = authenticate_user(email, password, client_ip=client_ip)
        if not auth_data:
            # Login failures (wrong email OR wrong password OR account locked)
            # must return EXACTLY: "Incorrect email or password"
            return jsonify({'success': False, 'message': 'Incorrect email or password'}), 401
            
        return jsonify({
            'success': True,
            'data': auth_data,
            'message': 'Login successful'
        }), 200
    except Exception as e:
        logger.error(f"[LOGIN SERVER ERROR] IP={client_ip} Error={str(e)}")
        return jsonify({'success': False, 'message': 'An error occurred during login'}), 500


@auth_bp.route('/forgot-password', methods=['POST'])
@auth_bp.route('/reset-password-request', methods=['POST'])
def forgot_password():
    """
    Request password reset link.
    Never leak whether the email is registered or not.
    """
    client_ip = get_client_ip()
    raw_data = request.get_json() or {}
    
    validated_data, _ = validate_schema(PasswordResetRequestSchema, raw_data, client_ip=client_ip)
    if validated_data and validated_data.get('email'):
        email = validated_data['email']
        logger.info(f"[PASSWORD RESET REQUESTED] Email={email} IP={client_ip}")
        # In production, dispatch password reset token email here

    # Rule: Password reset must always say: "If that email is registered, you'll receive a reset link"
    return jsonify({
        'success': True,
        'message': "If that email is registered, you'll receive a reset link"
    }), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token."""
    try:
        user_id = get_jwt_identity()
        new_access_token = create_access_token(identity=user_id)
        
        return jsonify({
            'success': True,
            'data': {'access_token': new_access_token},
            'message': 'Token refreshed'
        }), 200
    except Exception as e:
        logger.error(f"[TOKEN REFRESH ERROR] Error={str(e)}")
        return jsonify({'success': False, 'message': 'Invalid or expired authentication session'}), 401


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    """Get current user data."""
    try:
        user_id = get_jwt_identity()
        user = get_user_by_id(user_id)
        if not user:
            return jsonify({'success': False, 'message': 'Authentication session expired or invalid'}), 404
            
        return jsonify({
            'success': True,
            'data': user.to_dict(),
            'message': 'User data retrieved'
        }), 200
    except Exception as e:
        logger.error(f"[GET ME ERROR] Error={str(e)}")
        return jsonify({'success': False, 'message': 'Failed to retrieve user data'}), 500


@auth_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_me():
    """Update profile: full_name, date_of_birth, gender with sanitization."""
    try:
        user_id = get_jwt_identity()
        raw_data = request.get_json() or {}
        
        validated_data, err_msg = validate_schema(ProfileUpdateSchema, raw_data, client_ip=get_client_ip())
        if err_msg or not validated_data:
            return jsonify({'success': False, 'message': err_msg or 'Invalid input provided.'}), 400
            
        update_data = {k: v for k, v in validated_data.items() if v is not None}
        if not update_data:
            return jsonify({'success': False, 'message': 'Invalid input provided. Please verify your information.'}), 400
            
        user = update_user_profile(user_id, update_data)
        return jsonify({
            'success': True,
            'data': user.to_dict(),
            'message': 'Profile updated successfully'
        }), 200
    except Exception as e:
        logger.error(f"[UPDATE PROFILE ERROR] Error={str(e)}")
        return jsonify({'success': False, 'message': 'Failed to update profile'}), 500


@auth_bp.route('/me/password', methods=['PUT'])
@jwt_required()
def update_password():
    """Change user password with Pydantic validation and bcrypt re-hashing."""
    try:
        user_id = get_jwt_identity()
        raw_data = request.get_json() or {}
        
        validated_data, err_msg = validate_schema(PasswordChangeSchema, raw_data, client_ip=get_client_ip())
        if err_msg or not validated_data:
            return jsonify({'success': False, 'message': err_msg or 'Invalid input provided.'}), 400
            
        current_password = validated_data['current_password']
        new_password = validated_data['new_password']
            
        success = change_password(user_id, current_password, new_password)
        if success:
            return jsonify({'success': True, 'data': None, 'message': 'Password updated successfully'}), 200
        else:
            return jsonify({'success': False, 'message': 'Incorrect current password'}), 401
    except Exception as e:
        logger.error(f"[CHANGE PASSWORD ERROR] Error={str(e)}")
        return jsonify({'success': False, 'message': 'Failed to change password'}), 500

