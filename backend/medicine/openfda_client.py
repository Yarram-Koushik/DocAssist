"""OpenFDA client for medicine data with clinical synonym mapping."""
import requests
import logging

logger = logging.getLogger('medicine_service')

# Clinical synonyms mapping International Nonproprietary Names (INN) and brand names to US FDA monographs
SYNONYMS = {
    'paracetamol': 'acetaminophen',
    'panadol': 'acetaminophen',
    'tylenol': 'acetaminophen',
    'advil': 'ibuprofen',
    'motrin': 'ibuprofen',
    'nurofen': 'ibuprofen',
    'glucophage': 'metformin',
    'zestril': 'lisinopril',
    'prinivil': 'lisinopril',
    'aldactone': 'spironolactone',
    'lipitor': 'atorvastatin',
    'zithromax': 'azithromycin',
    'augmentin': 'amoxicillin',
    'plavix': 'clopidogrel',
    'prilosec': 'omeprazole',
    'zoloft': 'sertraline',
    'prozac': 'fluoxetine',
    'coumadin': 'warfarin'
}

# Verified standard clinical monographs for instant reliability
BUILTIN_MONOGRAPHS = {
    'acetaminophen': {
        'generic_name': 'Acetaminophen (Paracetamol)',
        'brand_names': ['Tylenol', 'Panadol', 'Mapap', 'Feverall'],
        'indications_and_usage': 'Temporary relief of minor aches and pains due to headache, muscular aches, backache, arthritis, the common cold, toothache, and for the reduction of fever.',
        'warnings': 'Liver warning: Severe liver damage may occur if you take more than 4,000 mg in 24 hours, take with other drugs containing acetaminophen, or consume 3+ alcoholic drinks daily.',
        'adverse_reactions': 'Rare hypersensitivity reactions, skin redness, rash, blisters. Chronic overuse may cause hepatotoxicity and renal tubular necrosis.',
        'contraindications': 'Hypersensitivity to acetaminophen; severe active liver disease or hepatic impairment.',
        'drug_interactions': 'Chronic high doses may increase anticoagulant effect of warfarin. Concurrent alcohol significantly increases hepatotoxicity risk.'
    },
    'paracetamol': {
        'generic_name': 'Acetaminophen / Paracetamol',
        'brand_names': ['Panadol', 'Tylenol', 'Calpol'],
        'indications_and_usage': 'Analgesic and antipyretic indicated for mild to moderate pain relief and fever reduction in children and adults.',
        'warnings': 'Do not exceed maximum daily dosage (4g/day in adults). Avoid concurrent use with other acetaminophen/paracetamol-containing preparations.',
        'adverse_reactions': 'Generally well-tolerated at therapeutic dosages; allergic reactions and elevated liver enzymes in cases of overdose.',
        'contraindications': 'Severe hepatic insufficiency or acute liver failure.',
        'drug_interactions': 'Warfarin (with chronic regular use), alcohol, enzyme-inducing anticonvulsants.'
    },
    'amoxicillin': {
        'generic_name': 'Amoxicillin',
        'brand_names': ['Amoxil', 'Trimox', 'Moxatag'],
        'indications_and_usage': 'Treatment of infections of the ear, nose, throat, genitourinary tract, skin, and lower respiratory tract caused by susceptible isolates.',
        'warnings': 'Serious and occasionally fatal hypersensitivity (anaphylactic) reactions have been reported in patients on penicillin therapy.',
        'adverse_reactions': 'Nausea, vomiting, diarrhea, skin rash, black hairy tongue, Clostridioides difficile-associated diarrhea.',
        'contraindications': 'History of severe hypersensitivity reaction to amoxicillin or other beta-lactams.',
        'drug_interactions': 'Probenecid decreases renal tubular secretion. May decrease efficacy of oral contraceptives.'
    },
    'ibuprofen': {
        'generic_name': 'Ibuprofen',
        'brand_names': ['Advil', 'Motrin', 'Nurofen'],
        'indications_and_usage': 'Relief of mild to moderate pain, fever reduction, and relief of signs and symptoms of rheumatoid arthritis and osteoarthritis.',
        'warnings': 'Boxed Warning: Cardiovascular thrombotic events (MI and stroke) and Gastrointestinal bleeding, ulceration, and perforation.',
        'adverse_reactions': 'Dyspepsia, heartburn, nausea, abdominal pain, fluid retention, edema, elevated blood pressure.',
        'contraindications': 'Known hypersensitivity; in setting of CABG surgery; severe renal or hepatic disease.',
        'drug_interactions': 'Anticoagulants (warfarin), ACE inhibitors, diuretics, aspirin, SSRIs.'
    },
    'lisinopril': {
        'generic_name': 'Lisinopril',
        'brand_names': ['Prinivil', 'Zestril', 'Qbrelis'],
        'indications_and_usage': 'Treatment of hypertension in adult and pediatric patients 6+ years old, adjunctive therapy for heart failure, and acute myocardial infarction.',
        'warnings': 'Boxed Warning: Fetal toxicity when used in pregnancy. Risk of angioedema, hypotension, and hyperkalemia.',
        'adverse_reactions': 'Dry cough, dizziness, headache, excessive hypotension, hyperkalemia, renal impairment.',
        'contraindications': 'History of angioedema related to previous ACE inhibitor treatment; concomitant aliskiren in diabetes.',
        'drug_interactions': 'Potassium-sparing diuretics (spironolactone), potassium supplements, NSAIDs, lithium.'
    },
    'metformin': {
        'generic_name': 'Metformin Hydrochloride',
        'brand_names': ['Glucophage', 'Fortamet', 'Glumetza'],
        'indications_and_usage': 'Adjunct to diet and exercise to improve glycemic control in adults and pediatric patients with type 2 diabetes mellitus.',
        'warnings': 'Boxed Warning: Lactic acidosis risk. Discontinue prior to iodinated radiocontrast procedures.',
        'adverse_reactions': 'Diarrhea, nausea, vomiting, abdominal flatulence, asthenia, indigestion, metallic taste.',
        'contraindications': 'Severe renal impairment (eGFR < 30 mL/min); acute or chronic metabolic acidosis.',
        'drug_interactions': 'Iodinated contrast media, alcohol, carbonic anhydrase inhibitors (topiramate).'
    },
    'atorvastatin': {
        'generic_name': 'Atorvastatin Calcium',
        'brand_names': ['Lipitor'],
        'indications_and_usage': 'Primary prevention of cardiovascular disease and hypercholesterolemia reduction of LDL-C and triglycerides.',
        'warnings': 'Myopathy and rhabdomyolysis risk. Hepatic transaminase elevations.',
        'adverse_reactions': 'Nasopharyngitis, arthralgia, diarrhea, pain in extremity, urinary tract infection, dyspepsia.',
        'contraindications': 'Active liver disease, unexplained persistent elevations in hepatic transaminases.',
        'drug_interactions': 'Strong CYP3A4 inhibitors (clarithromycin, itraconazole), cyclosporine, fibrates.'
    },
    'omeprazole': {
        'generic_name': 'Omeprazole',
        'brand_names': ['Prilosec', 'Losec'],
        'indications_and_usage': 'Treatment of active duodenal ulcer, gastric ulcer, gastroesophageal reflux disease (GERD), and maintenance of healing of erosive esophagitis.',
        'warnings': 'Bone fractures with high-dose long-term therapy; hypomagnesemia; Clostridioides difficile-associated diarrhea.',
        'adverse_reactions': 'Headache, abdominal pain, constipation, diarrhea, flatulence, nausea, vomiting.',
        'contraindications': 'Known hypersensitivity to omeprazole or other substituted benzimidazoles.',
        'drug_interactions': 'Clopidogrel (CYP2C19 inhibition reduces clopidogrel efficacy), digoxin, methotrexate.'
    },
    'spironolactone': {
        'generic_name': 'Spironolactone',
        'brand_names': ['Aldactone', 'CaroSpir'],
        'indications_and_usage': 'Treatment of NYHA Class II-IV heart failure, hypertension, and edema in cirrhosis or nephrotic syndrome.',
        'warnings': 'Hyperkalemia warning: Monitor serum potassium closely, especially in renal impairment or when combined with ACE inhibitors.',
        'adverse_reactions': 'Hyperkalemia, gynecomastia, breast tenderness, menstrual irregularities, dizziness, nausea.',
        'contraindications': 'Hyperkalemia, Addison disease, concomitant eplerenone.',
        'drug_interactions': 'ACE inhibitors (lisinopril), ARBs, potassium supplements, NSAIDs, digoxin.'
    }
}

def search_drug(drug_name: str) -> dict | None:
    """Queries openFDA API with synonym mapping and built-in clinical fallback."""
    if not drug_name:
        return None
        
    query_clean = drug_name.strip().lower()
    search_term = SYNONYMS.get(query_clean, query_clean)
    
    # 1. Check openFDA API
    url = f'https://api.fda.gov/drug/label.json?search=openfda.generic_name:"{search_term}"+openfda.brand_name:"{search_term}"&limit=1'
    
    try:
        response = requests.get(url, timeout=6)
        if response.status_code == 200:
            data = response.json()
            if 'results' in data and len(data['results']) > 0:
                result = data['results'][0]
                openfda = result.get('openfda', {})
                generic_name = openfda.get('generic_name', [search_term.title()])[0]
                brand_names = openfda.get('brand_name', [])
                
                return {
                    'generic_name': generic_name,
                    'brand_names': brand_names,
                    'indications_and_usage': result.get('indications_and_usage', [''])[0],
                    'warnings': result.get('warnings', [''])[0],
                    'adverse_reactions': result.get('adverse_reactions', [''])[0],
                    'contraindications': result.get('contraindications', [''])[0],
                    'drug_interactions': result.get('drug_interactions', [''])[0]
                }
    except Exception as e:
        logger.warning(f"OpenFDA API network request failed: {e}")

    # 2. Check Built-in Clinical Monograph Database
    for key, data in BUILTIN_MONOGRAPHS.items():
        if key in query_clean or query_clean in key or key in search_term or search_term in key:
            return data

    return None


