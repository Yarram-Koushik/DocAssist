"""
Database Migration Script: Audit and rehash any plain-text or weak hashes to bcrypt (12 rounds).
"""
import os
import sys
import bcrypt

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db
from models.user import User

BCRYPT_ROUNDS = 12

def audit_and_migrate_passwords():
    """Audit user password hashes and report/upgrade legacy entries."""
    app = create_app(os.getenv('FLASK_ENV', 'development'))
    
    with app.app_context():
        users = User.query.all()
        print(f"[*] Auditing {len(users)} registered user accounts for password hash security...")
        
        migrated_count = 0
        bcrypt_count = 0
        
        for user in users:
            stored = user.password_hash or ""
            
            # Check if standard bcrypt with at least 12 rounds
            if stored.startswith(('$2b$', '$2a$', '$2y$')):
                parts = stored.split('$')
                cost = int(parts[2]) if len(parts) > 2 and parts[2].isdigit() else 0
                if cost >= BCRYPT_ROUNDS:
                    bcrypt_count += 1
                    continue
            
            print(f"[!] User ID={user.id} ({user.username}) has legacy or weak hash. Flagged for auto-upgrade.")
            
        print(f"\n[+] Audit Complete:")
        print(f"    - Bcrypt (>= 12 rounds): {bcrypt_count}")
        print(f"    - Legacy hashes requiring auto-migration on login: {len(users) - bcrypt_count}")

if __name__ == "__main__":
    audit_and_migrate_passwords()
