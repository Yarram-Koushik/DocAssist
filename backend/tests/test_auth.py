"""
Tests for DocAssist Authentication System.
Includes Pydantic validation, bcrypt (rounds>=12) hashing, rate limiting,
account lockout, and sanitized generic error messages.
"""
import pytest
import json
import bcrypt
from app import create_app, db
from models.user import User
from utils.rate_limiter import security_manager


@pytest.fixture
def app():
    """Create application for testing."""
    app = create_app('testing')
    with app.app_context():
        db.create_all()
        # Reset rate limiter/lockout state for each test
        security_manager._ip_requests.clear()
        security_manager._account_failures.clear()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Create test client."""
    return app.test_client()


@pytest.fixture
def auth_headers(client):
    """Register a user and return auth headers."""
    client.post('/api/auth/register', json={
        'email': 'test@example.com',
        'username': 'testuser',
        'password': 'TestPassword123!',
        'full_name': 'Test User'
    })
    response = client.post('/api/auth/login', json={
        'email': 'test@example.com',
        'password': 'TestPassword123!'
    })
    data = json.loads(response.data)
    token = data['data']['access_token']
    return {'Authorization': f'Bearer {token}'}


class TestRegistration:
    """Tests for user registration with Pydantic validation and Bcrypt."""

    def test_register_success(self, client, app):
        response = client.post('/api/auth/register', json={
            'email': 'new@example.com',
            'username': 'newuser',
            'password': 'Password123!',
            'full_name': 'New User'
        })
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['success'] is True
        assert 'access_token' in data['data']
        
        # Verify password in DB is hashed with bcrypt and cost factor >= 12
        with app.app_context():
            user = User.query.filter_by(email='new@example.com').first()
            assert user is not None
            assert user.password_hash.startswith(('$2b$12$', '$2a$12$', '$2y$12$'))

    def test_register_duplicate_email(self, client):
        client.post('/api/auth/register', json={
            'email': 'dup@example.com',
            'username': 'user1',
            'password': 'Password123!',
            'full_name': 'User One'
        })
        response = client.post('/api/auth/register', json={
            'email': 'dup@example.com',
            'username': 'user2',
            'password': 'Password123!',
            'full_name': 'User Two'
        })
        assert response.status_code == 409
        data = json.loads(response.data)
        assert data['success'] is False
        # Ensure error message does not leak information
        assert "already" not in data['message'].lower()

    def test_register_missing_fields(self, client):
        response = client.post('/api/auth/register', json={
            'email': 'test@example.com'
        })
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False

    def test_register_invalid_email(self, client):
        response = client.post('/api/auth/register', json={
            'email': 'not-an-email',
            'username': 'testuser',
            'password': 'Password123!',
            'full_name': 'Test User'
        })
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False

    def test_register_weak_password(self, client):
        response = client.post('/api/auth/register', json={
            'email': 'test@example.com',
            'username': 'testuser',
            'password': '123',
            'full_name': 'Test User'
        })
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False

    def test_register_sanitizes_html_tags(self, client, app):
        """Ensure HTML and script injection tags are stripped."""
        response = client.post('/api/auth/register', json={
            'email': 'clean@example.com',
            'username': 'clean_user',
            'password': 'Password123!',
            'full_name': '<script>alert("xss")</script>Dr. Clean Name'
        })
        assert response.status_code == 201
        with app.app_context():
            user = User.query.filter_by(email='clean@example.com').first()
            assert '<script>' not in user.full_name
            assert user.full_name == 'Dr. Clean Name'


class TestLogin:
    """Tests for user login, rate limiting, and account lockout."""

    def test_login_success(self, client):
        client.post('/api/auth/register', json={
            'email': 'login@example.com',
            'username': 'loginuser',
            'password': 'Password123!',
            'full_name': 'Login User'
        })
        response = client.post('/api/auth/login', json={
            'email': 'login@example.com',
            'password': 'Password123!'
        })
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'access_token' in data['data']
        assert 'refresh_token' in data['data']

    def test_login_wrong_password(self, client):
        client.post('/api/auth/register', json={
            'email': 'wrong@example.com',
            'username': 'wronguser',
            'password': 'Password123!',
            'full_name': 'Wrong User'
        })
        response = client.post('/api/auth/login', json={
            'email': 'wrong@example.com',
            'password': 'WrongPassword!'
        })
        assert response.status_code == 401
        data = json.loads(response.data)
        assert data['message'] == "Incorrect email or password"

    def test_login_nonexistent_user(self, client):
        response = client.post('/api/auth/login', json={
            'email': 'nobody@example.com',
            'password': 'Password123!'
        })
        assert response.status_code == 401
        data = json.loads(response.data)
        assert data['message'] == "Incorrect email or password"

    def test_account_lockout_after_5_failures(self, client):
        """Account locks after 5 consecutive failures, returning generic error."""
        client.post('/api/auth/register', json={
            'email': 'locked@example.com',
            'username': 'lockeduser',
            'password': 'Password123!',
            'full_name': 'Locked User'
        })
        
        # 5 failed attempts
        for _ in range(5):
            res = client.post('/api/auth/login', json={
                'email': 'locked@example.com',
                'password': 'BadPassword!'
            })
            assert res.status_code == 401
            assert json.loads(res.data)['message'] == "Incorrect email or password"

        # 6th attempt (even with correct password) is blocked by lockout
        res = client.post('/api/auth/login', json={
            'email': 'locked@example.com',
            'password': 'Password123!'
        })
        assert res.status_code == 401
        # Crucial rule: must NOT mention account is locked!
        assert json.loads(res.data)['message'] == "Incorrect email or password"

    def test_rate_limiting_ip(self, client):
        """Exceeding 10 requests in 1 minute from the same IP returns 429."""
        for _ in range(10):
            client.post('/api/auth/login', json={
                'email': 'ratelimit@example.com',
                'password': 'Password123!'
            })
            
        res = client.post('/api/auth/login', json={
            'email': 'ratelimit@example.com',
            'password': 'Password123!'
        })
        assert res.status_code == 429
        assert 'Retry-After' in res.headers

    def test_password_reset_request_generic_message(self, client):
        """Password reset must always return generic confirmation."""
        res = client.post('/api/auth/forgot-password', json={
            'email': 'anyone@example.com'
        })
        assert res.status_code == 200
        data = json.loads(res.data)
        assert data['message'] == "If that email is registered, you'll receive a reset link"


class TestProtectedRoutes:
    """Tests for protected route access."""

    def test_access_me_authenticated(self, client, auth_headers):
        response = client.get('/api/auth/me', headers=auth_headers)
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['data']['email'] == 'test@example.com'

    def test_access_me_unauthenticated(self, client):
        response = client.get('/api/auth/me')
        assert response.status_code == 401

    def test_access_dashboard_unauthenticated(self, client):
        response = client.get('/api/analytics/user')
        assert response.status_code == 401

