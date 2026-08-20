import re

DIAGNOSTIC_PATTERNS = [
    r'(?i)\b(you have|you are diagnosed with|you suffer from)\b'
]
DISCLAIMER = "\n\nDisclaimer: I am an AI, not a doctor. This information is for educational purposes only. Please consult a healthcare professional for a medical diagnosis."

def filter_response(text):
    safe_text = text
    for pattern in DIAGNOSTIC_PATTERNS:
        safe_text = re.sub(pattern, 'you might be experiencing symptoms consistent with', safe_text)
    return safe_text

def add_disclaimer(text):
    return text + DISCLAIMER

def is_safe_response(text):
    for pattern in DIAGNOSTIC_PATTERNS:
        if re.search(pattern, text):
            return False
    return True
