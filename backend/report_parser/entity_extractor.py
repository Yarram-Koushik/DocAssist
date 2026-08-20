"""Entity extractor for medical values."""
import re
from report_parser.text_cleaner import clean_text, normalize_units

# Regex patterns mapping parameter name to pattern
PATTERNS = {
    'Hemoglobin': r'(?i)(?:hemoglobin|hb|hgb)[\s\.:]*(?:count)?[\s\.:]*([\d\.]+)\s*(g/dL|g/L|gm/dl)?',
    'WBC': r'(?i)(?:wbc|white\s*blood\s*cells?)(?:\s*\([^)]*\))?(?:\s*count)?[\s\.:]*([\d\.]+)\s*(k/uL|10\^3/uL|/cumm|cells/mcL|/mm3|/uL)?',
    'RBC': r'(?i)(?:rbc|red\s*blood\s*cells?)(?:\s*\([^)]*\))?(?:\s*count)?[\s\.:]*([\d\.]+)\s*(m/uL|10\^6/uL|million/cumm|million/uL|/cumm)?',
    'Platelets': r'(?i)platelets?(?:\s*count)?[\s\.:]*([\d\.]+)\s*(k/uL|10\^3/uL|/cumm|/uL|/mm3|lakhs?/cumm)?',
    'TSH': r'(?i)tsh(?:\s*\([^)]*\))?[\s\.:]*([\d\.]+)\s*(mIU/L|uIU/mL|uIU/ml|mIU/ml)?',
    'T3': r'(?i)(?:total\s*)?t3(?:\s*\([^)]*\)|\s*triiodothyronine)?[\s\.:]*([\d\.]+)\s*(ng/dL|nmol/L|ng/ml)?',
    'T4': r'(?i)(?:total\s*)?t4(?:\s*\([^)]*\)|\s*thyroxine)?[\s\.:]*([\d\.]+)\s*(ug/dL|nmol/L|mcg/dl|ug/dl)?',
    'HbA1c': r'(?i)(?:hba1c|glycated\s*hemoglobin)[\s\.:]*([\d\.]+)\s*(%)?',
    'Glucose (Fasting)': r'(?i)(?:fasting\s*(?:blood\s*sugar|glucose|blood\s*glucose)|fbs)[\s\.:]*([\d\.]+)\s*(mg/dL|mmol/L)?',
    'Glucose (Random)': r'(?i)(?:random\s*(?:blood\s*sugar|glucose|blood\s*glucose)|rbs)[\s\.:]*([\d\.]+)\s*(mg/dL|mmol/L)?',
    'Creatinine': r'(?i)(?:serum\s*)?creatinine[\s\.:]*([\d\.]+)\s*(mg/dL|umol/L)?',
    'Urea': r'(?i)(?:blood\s*)?(?:urea|bun)[\s\.:]*([\d\.]+)\s*(mg/dL|mmol/L)?',
    'Total Cholesterol': r'(?i)total\s*cholesterol[\s\.:]*([\d\.]+)\s*(mg/dL|mmol/L)?',
    'LDL': r'(?i)ldl(?:\s*cholesterol)?[\s\.:]*([\d\.]+)\s*(mg/dL|mmol/L)?',
    'HDL': r'(?i)hdl(?:\s*cholesterol)?[\s\.:]*([\d\.]+)\s*(mg/dL|mmol/L)?',
    'Triglycerides': r'(?i)triglycerides?[\s\.:]*([\d\.]+)\s*(mg/dL|mmol/L)?',
    'ALT': r'(?i)(?:alt|sgpt)(?:\s*\([^)]*\))?[\s\.:]*([\d\.]+)\s*(u/l|iu/l)?',
    'AST': r'(?i)(?:ast|sgot)(?:\s*\([^)]*\))?[\s\.:]*([\d\.]+)\s*(u/l|iu/l)?',
    'Bilirubin': r'(?i)(?:total\s*)?bilirubin[\s\.:]*([\d\.]+)\s*(mg/dL|umol/L)?',
    'Albumin': r'(?i)(?:serum\s*)?albumin[\s\.:]*([\d\.]+)\s*(g/dL|g/L)?'
}

def extract_medical_values(text: str) -> list[dict]:
    """Regex-based extraction of medical values."""
    if not text:
        return []
        
    results = []
    cleaned_text = clean_text(text)
    
    for parameter, pattern in PATTERNS.items():
        match = re.search(pattern, cleaned_text)
        if match:
            value_str = match.group(1) if match.lastindex >= 1 else None
            unit_str = match.group(2) if match.lastindex >= 2 else None
            
            try:
                if value_str:
                    val = float(value_str)
                    unit = normalize_units(unit_str) if unit_str else "unknown"
                    results.append({
                        'parameter': parameter,
                        'name': parameter,
                        'value': val,
                        'unit': unit,
                        'raw_text': match.group(0).strip()
                    })
            except ValueError:
                pass
                
    return results

