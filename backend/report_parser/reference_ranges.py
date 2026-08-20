"""Reference ranges for medical values."""

REFERENCE_RANGES = {
    'Hemoglobin': {'min': 12.0, 'max': 17.5, 'unit': 'g/dL', 'description': 'Oxygen carrying protein'},
    'WBC': {'min': 4.5, 'max': 11.0, 'unit': '10^3/uL', 'description': 'White Blood Cells'},
    'RBC': {'min': 4.1, 'max': 5.9, 'unit': '10^6/uL', 'description': 'Red Blood Cells'},
    'Platelets': {'min': 150, 'max': 450, 'unit': '10^3/uL', 'description': 'Blood clotting cells'},
    'TSH': {'min': 0.4, 'max': 4.0, 'unit': 'mIU/L', 'description': 'Thyroid Stimulating Hormone'},
    'T3': {'min': 80, 'max': 200, 'unit': 'ng/dL', 'description': 'Triiodothyronine'},
    'T4': {'min': 5.0, 'max': 12.0, 'unit': 'ug/dL', 'description': 'Thyroxine'},
    'HbA1c': {'min': 4.0, 'max': 5.6, 'unit': '%', 'description': 'Average blood sugar over 3 months'},
    'Glucose (Fasting)': {'min': 70, 'max': 99, 'unit': 'mg/dL', 'description': 'Fasting blood sugar'},
    'Glucose (Random)': {'min': 70, 'max': 140, 'unit': 'mg/dL', 'description': 'Random blood sugar'},
    'Creatinine': {'min': 0.6, 'max': 1.3, 'unit': 'mg/dL', 'description': 'Kidney function marker'},
    'Urea': {'min': 7.0, 'max': 20.0, 'unit': 'mg/dL', 'description': 'Blood Urea Nitrogen'},
    'Total Cholesterol': {'min': 0, 'max': 200, 'unit': 'mg/dL', 'description': 'Overall cholesterol'},
    'LDL': {'min': 0, 'max': 100, 'unit': 'mg/dL', 'description': 'Bad cholesterol'},
    'HDL': {'min': 40, 'max': 60, 'unit': 'mg/dL', 'description': 'Good cholesterol'},
    'Triglycerides': {'min': 0, 'max': 150, 'unit': 'mg/dL', 'description': 'Type of fat in blood'},
    'ALT': {'min': 7, 'max': 56, 'unit': 'U/L', 'description': 'Liver enzyme'},
    'AST': {'min': 8, 'max': 48, 'unit': 'U/L', 'description': 'Liver enzyme'},
    'Bilirubin': {'min': 0.1, 'max': 1.2, 'unit': 'mg/dL', 'description': 'Liver function marker'},
    'Albumin': {'min': 3.4, 'max': 5.4, 'unit': 'g/dL', 'description': 'Liver protein'}
}

def get_range_info(parameter: str) -> dict | None:
    """Get reference range info."""
    return REFERENCE_RANGES.get(parameter)

def check_range(parameter: str, value: float) -> str:
    """Returns 'normal', 'above', 'below', or 'unknown'."""
    info = get_range_info(parameter)
    if not info:
        return 'unknown'
        
    val_to_check = value
    # Handle unit scale conversions (e.g. WBC /cumm vs 10^3/uL, Platelets /cumm vs 10^3/uL)
    if parameter == 'WBC' and val_to_check > 100:
        val_to_check = val_to_check / 1000.0
    elif parameter == 'Platelets' and val_to_check > 1000:
        val_to_check = val_to_check / 1000.0
    elif parameter == 'RBC' and val_to_check > 100:
        val_to_check = val_to_check / 1000000.0
        
    if val_to_check < info['min']:
        return 'below'
    elif val_to_check > info['max']:
        return 'above'
    else:
        return 'normal'

