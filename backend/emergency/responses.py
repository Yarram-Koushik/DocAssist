"""Emergency response templates."""

EMERGENCY_RESPONSES = {
    'cardiac': "⚠️ MEDICAL EMERGENCY ALERT: Possible Cardiac Issue\n\nWhat to do immediately: Rest, do not exert yourself. If prescribed nitroglycerin, take it.\nCall Emergency Numbers: 911 or your local emergency number immediately.\nDO NOT: Do not drive yourself to the hospital.\nReassurance: Help is available, please seek immediate medical attention.",
    
    'respiratory': "⚠️ MEDICAL EMERGENCY ALERT: Breathing Difficulty\n\nWhat to do immediately: Sit upright, loosen tight clothing. Use prescribed inhaler if available.\nCall Emergency Numbers: 911 immediately.\nDO NOT: Do not lie flat.\nReassurance: Keep calm and seek help right away.",
    
    'stroke': "⚠️ MEDICAL EMERGENCY ALERT: Possible Stroke\n\nWhat to do immediately: Remember FAST (Face drooping, Arm weakness, Speech difficulty, Time to call).\nCall Emergency Numbers: 911 immediately.\nDO NOT: Do not eat or drink anything. Do not sleep it off.\nReassurance: Prompt treatment is essential.",
    
    'bleeding': "⚠️ MEDICAL EMERGENCY ALERT: Severe Bleeding\n\nWhat to do immediately: Apply direct pressure with a clean cloth.\nCall Emergency Numbers: 911 immediately.\nDO NOT: Do not remove the cloth if it soaks through, add another on top.\nReassurance: Medical professionals can handle this safely.",
    
    'consciousness': "⚠️ MEDICAL EMERGENCY ALERT: Altered Consciousness\n\nWhat to do immediately: Place person on their side (recovery position) if breathing normally.\nCall Emergency Numbers: 911 immediately.\nDO NOT: Do not leave them alone. Do not put anything in their mouth during a seizure.\nReassurance: Help is on the way if you call now.",
    
    'allergic': "⚠️ MEDICAL EMERGENCY ALERT: Severe Allergic Reaction\n\nWhat to do immediately: Administer epinephrine auto-injector (EpiPen) if available.\nCall Emergency Numbers: 911 immediately.\nDO NOT: Do not wait to see if symptoms improve.\nReassurance: Act quickly, medical teams are trained for this.",
    
    'pregnancy': "⚠️ MEDICAL EMERGENCY ALERT: Pregnancy Complication\n\nWhat to do immediately: Rest on your left side.\nCall Emergency Numbers: 911 or your healthcare provider immediately.\nDO NOT: Do not ignore severe pain or bleeding.\nReassurance: Keep calm, obstetrical care is needed."
}

MENTAL_HEALTH_RESPONSE = "⚠️ CRISIS ALERT: Mental Health Emergency\n\nWhat to do immediately: Please reach out for help. You are not alone.\nCall Emergency Numbers: 988 Suicide & Crisis Lifeline (US) or 911 immediately.\nDO NOT: Do not remain alone if possible.\nReassurance: There are people who want to support you right now. Please call 988."

def get_emergency_response(category: str, severity: str) -> str:
    """Returns appropriate emergency response based on category."""
    if category == 'mental_health':
        return MENTAL_HEALTH_RESPONSE
    return EMERGENCY_RESPONSES.get(category, "⚠️ MEDICAL EMERGENCY ALERT\n\nPlease seek immediate medical attention or call 911. Do not wait.")
