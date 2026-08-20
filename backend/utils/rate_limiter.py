"""
Thread-safe rate limiting and account lockout manager for authentication endpoints.
"""
import time
import threading
import logging
from collections import defaultdict
from typing import Tuple, Dict, List

logger = logging.getLogger('auth_security')

class SecurityManager:
    """Manages rate limits, failed login attempts, account lockouts, and progressive delays."""
    
    def __init__(
        self,
        max_login_requests_per_minute: int = 10,
        max_failed_attempts: int = 5,
        lockout_duration_seconds: int = 900  # 15 minutes
    ):
        self.max_login_requests_per_minute = max_login_requests_per_minute
        self.max_failed_attempts = max_failed_attempts
        self.lockout_duration_seconds = lockout_duration_seconds
        
        self._lock = threading.Lock()
        
        # IP rate limiting store: ip -> list of request timestamps
        self._ip_requests: Dict[str, List[float]] = defaultdict(list)
        
        # Account failed login store: email -> {'attempts': int, 'locked_until': float, 'last_failed': float}
        self._account_failures: Dict[str, dict] = {}

    def is_ip_rate_limited(self, ip: str) -> Tuple[bool, int]:
        """
        Check if an IP has exceeded the max login requests per minute.
        Returns (is_limited, retry_after_seconds).
        """
        now = time.time()
        with self._lock:
            # Clean up old timestamps older than 60 seconds
            self._ip_requests[ip] = [ts for ts in self._ip_requests[ip] if now - ts < 60]
            
            if len(self._ip_requests[ip]) >= self.max_login_requests_per_minute:
                oldest_in_window = self._ip_requests[ip][0]
                retry_after = int(max(1, 60 - (now - oldest_in_window)))
                logger.warning(f"[RATE LIMIT EXCEEDED] IP={ip} RequestsInWindow={len(self._ip_requests[ip])}")
                return True, retry_after
            
            self._ip_requests[ip].append(now)
            return False, 0

    def is_account_locked(self, email: str) -> Tuple[bool, int]:
        """
        Check if an account is currently locked.
        Returns (is_locked, remaining_seconds).
        """
        email_key = email.strip().lower()
        now = time.time()
        
        with self._lock:
            entry = self._account_failures.get(email_key)
            if not entry:
                return False, 0
                
            locked_until = entry.get('locked_until', 0)
            if locked_until > now:
                remaining = int(locked_until - now)
                return True, remaining
                
            # If lockout expired, reset failed counter
            if locked_until > 0 and locked_until <= now:
                self._account_failures.pop(email_key, None)
                return False, 0
                
            return False, 0

    def record_login_failure(self, email: str, ip: str) -> int:
        """
        Record a failed login attempt for the specified account email.
        Applies progressive delay and locks account if threshold is met.
        Returns current failed attempts count.
        """
        email_key = email.strip().lower()
        now = time.time()
        
        with self._lock:
            entry = self._account_failures.get(email_key, {
                'attempts': 0,
                'locked_until': 0,
                'last_failed': now
            })
            
            entry['attempts'] += 1
            entry['last_failed'] = now
            attempts = entry['attempts']
            
            if attempts >= self.max_failed_attempts:
                entry['locked_until'] = now + self.lockout_duration_seconds
                logger.warning(
                    f"[ACCOUNT LOCKED] Email={email_key} IP={ip} "
                    f"Attempts={attempts} Duration={self.lockout_duration_seconds}s"
                )
                self._send_lockout_notification(email_key)
            else:
                logger.info(
                    f"[LOGIN FAILED] Email={email_key} IP={ip} "
                    f"ConsecutiveFailures={attempts}/{self.max_failed_attempts}"
                )
                
            self._account_failures[email_key] = entry

        # Progressive delay: delay each consecutive failed attempt to prevent timing & brute-force attacks
        delay_seconds = min(0.2 * (2 ** (attempts - 1)), 2.5)
        time.sleep(delay_seconds)
        
        return attempts

    def record_login_success(self, email: str, ip: str):
        """Reset failed attempt counters upon successful authentication."""
        email_key = email.strip().lower()
        with self._lock:
            if email_key in self._account_failures:
                self._account_failures.pop(email_key, None)
        logger.info(f"[LOGIN SUCCESS] Email={email_key} IP={ip}")

    def _send_lockout_notification(self, email: str):
        """Simulate / dispatch secure email notification with reset link on lockout."""
        logger.info(
            f"[EMAIL NOTIFICATION DISPATCHED] To: {email} | "
            f"Subject: Security Alert: Account Temporarily Locked | "
            f"Message: Multiple failed login attempts detected. Reset password link generated."
        )

# Global singleton security manager
security_manager = SecurityManager()
