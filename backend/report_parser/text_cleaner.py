"""Text cleaning utilities."""
import re

def clean_text(raw_text: str) -> str:
    """Normalize whitespace, fix common OCR errors, remove non-printable chars."""
    if not raw_text:
        return ""
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\xff]', '', raw_text)
    text = re.sub(r'\s+', ' ', text)
    text = text.replace('l', 'l') 
    return text.strip()

def normalize_units(text: str) -> str:
    """Standardize medical units."""
    if not text:
        return ""
    replacements = {
        'g/dl': 'g/dL',
        'mg/dl': 'mg/dL',
        'u/l': 'U/L',
        'meq/l': 'mEq/L',
        'mmol/l': 'mmol/L',
        'mcg/dl': 'mcg/dL'
    }
    for old, new in replacements.items():
        text = re.sub(r'\b' + re.escape(old) + r'\b', new, text, flags=re.IGNORECASE)
    return text
