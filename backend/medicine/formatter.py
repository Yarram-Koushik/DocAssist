"""Formatter for openFDA data."""
import re

def clean_fda_text(text) -> str:
    """Helper to clean FDA markup (remove HTML-like tags, excessive whitespace)."""
    if not text:
        return ""
    if isinstance(text, (list, tuple)):
        text = " ".join(str(item) for item in text if item)
    if not isinstance(text, str):
        text = str(text)
    # Remove simple HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    # Remove excessive newlines and spaces
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def format_medicine_info(raw_data: dict) -> dict:
    """Formats openFDA data into user-friendly structure."""
    if not raw_data:
        return {
            'generic_name': 'Unknown Medicine',
            'uses': 'I could not find information about this medicine in the FDA database.',
            'side_effects': 'Not specified.',
            'warnings': 'Not specified.',
            'contraindications': 'Not specified.'
        }
        
    openfda = raw_data.get('openfda', {}) if isinstance(raw_data.get('openfda'), dict) else {}
    generic_names = openfda.get('generic_name', []) if isinstance(openfda.get('generic_name'), list) else [openfda.get('generic_name')]
    brand_names = openfda.get('brand_name', []) if isinstance(openfda.get('brand_name'), list) else [openfda.get('brand_name')]
    
    generic_name = raw_data.get('generic_name') or (generic_names[0] if generic_names and generic_names[0] else 'Unknown')
    brand_names_list = raw_data.get('brand_names') or [b for b in brand_names if b]

    side_effects = clean_fda_text(raw_data.get('adverse_reactions', ''))
    warnings = clean_fda_text(raw_data.get('warnings', ''))
    contraindications = clean_fda_text(raw_data.get('contraindications', ''))
    uses = clean_fda_text(raw_data.get('indications_and_usage', ''))
    
    return {
        'generic_name': generic_name,
        'brand_names': brand_names_list,
        'uses': uses if uses else 'Not specified in FDA database.',
        'side_effects': (side_effects[:500] + ('...' if len(side_effects) > 500 else '')) if side_effects else 'Not specified in FDA database.',
        'warnings': (warnings[:500] + ('...' if len(warnings) > 500 else '')) if warnings else 'Not specified in FDA database.',
        'contraindications': (contraindications[:500] + ('...' if len(contraindications) > 500 else '')) if contraindications else 'Not specified in FDA database.',
        'when_to_consult_doctor': "Consult your doctor if you experience severe side effects, have questions about your treatment, or if your condition worsens.",
        'source': 'openFDA - U.S. Food and Drug Administration',
        'disclaimer': "This information is from the openFDA database. It is for informational purposes only and does NOT constitute medical advice. ALWAYS consult your doctor for medical advice. NEVER alter your dosage based on this information."
    }

