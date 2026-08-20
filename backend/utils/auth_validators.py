"""
Server-side Pydantic validation and sanitization for authentication endpoints.
"""
import re
import logging
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator

logger = logging.getLogger('auth_security')
logger.setLevel(logging.INFO)

# HTML / Script tag sanitizer
TAG_RE = re.compile(r'<[^>]+>', re.IGNORECASE)
SCRIPT_RE = re.compile(r'<\s*script[^>]*>.*?<\s*/\s*script\s*>', re.IGNORECASE | re.DOTALL)
SPECIAL_CHAR_STRIP_RE = re.compile(r'[<>\0\r\n\t]')

def sanitize_string(value: Optional[str], max_length: int = 255) -> Optional[str]:
    """Strip HTML, script tags, dangerous special control characters, and trim whitespace."""
    if value is None:
        return None
    if not isinstance(value, str):
        value = str(value)
    
    # 1. Remove script tags and content
    value = SCRIPT_RE.sub('', value)
    # 2. Remove other HTML tags
    value = TAG_RE.sub('', value)
    # 3. Strip control / dangerous chars
    value = SPECIAL_CHAR_STRIP_RE.sub('', value)
    # 4. Normalize whitespace
    value = value.strip()
    return value[:max_length]


class RegisterSchema(BaseModel):
    """Pydantic schema for user registration."""
    email: str = Field(..., min_length=5, max_length=120)
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=2, max_length=100)

    @field_validator('email')
    @classmethod
    def validate_and_sanitize_email(cls, v: str) -> str:
        clean = sanitize_string(v, max_length=120)
        if not clean:
            raise ValueError("Email cannot be empty")
        clean = clean.lower()
        email_pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
        if not re.match(email_pattern, clean) or '..' in clean or clean.endswith('.'):
            raise ValueError("Invalid email format")
        return clean

    @field_validator('username')
    @classmethod
    def validate_and_sanitize_username(cls, v: str) -> str:
        clean = sanitize_string(v, max_length=50)
        if not clean or len(clean) < 3:
            raise ValueError("Username must be between 3 and 50 characters")
        if not re.match(r'^[a-zA-Z0-9_.-]+$', clean):
            raise ValueError("Username can only contain letters, numbers, hyphens, and underscores")
        return clean

    @field_validator('full_name')
    @classmethod
    def validate_and_sanitize_full_name(cls, v: str) -> str:
        clean = sanitize_string(v, max_length=100)
        if not clean or len(clean) < 2:
            raise ValueError("Full name must be at least 2 characters")
        # Ensure name contains letters, numbers, spaces, hyphens, dots, apostrophes
        if not re.match(r"^[a-zA-Z0-9\s\.\-']+$", clean):
            raise ValueError("Full name contains invalid characters")
        return clean

    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < 8 or len(v) > 128:
            raise ValueError("Password must be between 8 and 128 characters")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        if not any(c.isalpha() for c in v):
            raise ValueError("Password must contain at least one letter")
        return v



class LoginSchema(BaseModel):
    """Pydantic schema for user login."""
    email: str = Field(..., min_length=3, max_length=120)
    password: str = Field(..., min_length=1, max_length=128)

    @field_validator('email')
    @classmethod
    def clean_email(cls, v: str) -> str:
        clean = sanitize_string(v, max_length=120)
        if not clean:
            raise ValueError("Email is required")
        return clean.lower()


class PasswordResetRequestSchema(BaseModel):
    """Pydantic schema for requesting password reset."""
    email: str = Field(..., min_length=5, max_length=120)

    @field_validator('email')
    @classmethod
    def clean_email(cls, v: str) -> str:
        clean = sanitize_string(v, max_length=120)
        if not clean:
            raise ValueError("Email is required")
        return clean.lower()


class PasswordChangeSchema(BaseModel):
    """Pydantic schema for changing user password."""
    current_password: str = Field(..., min_length=1, max_length=128)
    new_password: str = Field(..., min_length=8, max_length=128)

    @field_validator('new_password')
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        if len(v) < 8 or len(v) > 128:
            raise ValueError("New password must be between 8 and 128 characters")
        if not any(c.isdigit() for c in v):
            raise ValueError("New password must contain at least one digit")
        if not any(c.isalpha() for c in v):
            raise ValueError("New password must contain at least one letter")
        return v


class ProfileUpdateSchema(BaseModel):
    """Pydantic schema for profile updates."""
    full_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None

    @field_validator('full_name')
    @classmethod
    def sanitize_name(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        clean = sanitize_string(v, max_length=100)
        if clean and not re.match(r"^[a-zA-Z\s\.\-']+$", clean):
            raise ValueError("Invalid characters in full name")
        return clean

    @field_validator('gender')
    @classmethod
    def sanitize_gender(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        clean = sanitize_string(v, max_length=20)
        if clean and clean.lower() not in ['male', 'female', 'other', 'prefer_not_to_say']:
            raise ValueError("Invalid gender value")
        return clean


def validate_schema(schema_cls, data: dict, client_ip: str = "Unknown"):
    """
    Validate input dictionary against Pydantic schema.
    Logs failures securely without leaking passwords, and returns validated dict.
    """
    try:
        instance = schema_cls(**data)
        return instance.model_dump(), None
    except Exception as e:
        # Log validation failure server-side for security monitoring
        # (NEVER log the actual password content)
        safe_keys = [k for k in data.keys() if 'password' not in k.lower()]
        logger.warning(
            f"[VALIDATION FAILURE] IP={client_ip} Schema={schema_cls.__name__} "
            f"ProvidedKeys={safe_keys} Error={str(e)}"
        )
        return None, "Invalid input provided. Please verify your information and try again."
