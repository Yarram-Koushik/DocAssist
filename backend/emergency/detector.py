"""Emergency symptom detector."""
import re

EMERGENCY_PATTERNS = {
    'cardiac': ['chest pain', 'heart attack', 'cardiac arrest', 'chest tightness', 'chest pressure'],
    'respiratory': [r'cannot breathe', r'can\'t breathe', 'difficulty breathing', 'shortness of breath', 'choking', 'suffocating'],
    'stroke': ['face drooping', 'arm weakness', 'speech difficulty', 'sudden numbness', 'sudden confusion', 'sudden severe headache'],
    'bleeding': ['severe bleeding', 'uncontrolled bleeding', 'bleeding heavily', 'hemorrhage', 'coughing blood', 'vomiting blood'],
    'consciousness': ['unconscious', 'passed out', 'fainted', 'not responding', 'loss of consciousness', 'seizure', 'convulsion'],
    'mental_health': ['suicidal', 'want to die', 'kill myself', 'end my life', 'self harm', 'self-harm'],
    'allergic': ['anaphylaxis', 'severe allergic', 'throat swelling', r'can\'t swallow', 'swollen tongue'],
    'pregnancy': ['pregnancy bleeding', 'water broke', 'contractions', 'pregnancy pain', 'miscarriage']
}

def detect_emergency(message: str) -> dict | None:
    """Detect emergency symptoms in user message."""
    message_lower = message.lower()
    
    for category, patterns in EMERGENCY_PATTERNS.items():
        matched_patterns = []
        for pattern in patterns:
            if re.search(pattern, message_lower):
                matched_patterns.append(pattern)
                
        if matched_patterns:
            severity = 'critical' if category in ['mental_health', 'cardiac'] else 'high'
            return {
                'is_emergency': True,
                'category': category,
                'severity': severity,
                'matched_patterns': matched_patterns
            }
            
    return None
