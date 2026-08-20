"""
Clinical Drug-Drug Interaction (DDI) Checker Engine.
Analyzes concurrent medications for pharmacological conflicts, synergistic toxicity, and precautions.
"""
import re
from typing import List, Dict

KNOWN_INTERACTIONS = [
    {
        'drugs': ['warfarin', 'aspirin'],
        'severity': 'major',
        'title': 'Severe Bleeding Risk (Anticoagulant + Antiplatelet)',
        'mechanism': 'Additive inhibition of coagulation pathways and platelet aggregation.',
        'risk': 'Substantially elevated risk of gastrointestinal hemorrhages and severe systemic bleeding.',
        'recommendation': 'Avoid combination unless specifically directed and monitored by a hematologist/cardiologist with frequent INR checks.'
    },
    {
        'drugs': ['warfarin', 'ibuprofen'],
        'severity': 'major',
        'title': 'Severe Bleeding Risk (Anticoagulant + NSAID)',
        'mechanism': 'NSAIDs cause gastric mucosal injury and inhibit platelet COX-1 while warfarin impairs clotting factors.',
        'risk': 'High risk of severe gastrointestinal bleeding and ulceration.',
        'recommendation': 'Contraindicated in most cases. Use acetaminophen/paracetamol for pain relief under clinical guidance.'
    },
    {
        'drugs': ['lisinopril', 'spironolactone'],
        'severity': 'major',
        'title': 'Hyperkalemia Risk (ACE Inhibitor + Potassium-Sparing Diuretic)',
        'mechanism': 'Dual suppression of aldosterone promotes severe potassium retention in the kidneys.',
        'risk': 'Dangerous cardiac arrhythmias, muscle weakness, and cardiac arrest from high serum potassium.',
        'recommendation': 'Strict monitoring of serum potassium and renal function (BUN/Creatinine) within 1-2 weeks of initiation.'
    },
    {
        'drugs': ['lisinopril', 'ibuprofen'],
        'severity': 'moderate',
        'title': 'Reduced Antihypertensive Effect & Nephrotoxicity (ACE Inhibitor + NSAID)',
        'mechanism': 'NSAIDs inhibit renal vasodilatory prostaglandins, decreasing renal perfusion and blunting blood pressure control.',
        'risk': 'Acute renal impairment (triple-whammy risk with diuretics) and worsened blood pressure control.',
        'recommendation': 'Limit NSAID duration; monitor blood pressure and hydration status.'
    },
    {
        'drugs': ['lisinopril', 'potassium'],
        'severity': 'major',
        'title': 'Severe Hyperkalemia Risk (ACE Inhibitor + Potassium Supplement)',
        'mechanism': 'ACE inhibitors reduce aldosterone secretion, decreasing potassium elimination.',
        'risk': 'Critical elevations in serum potassium leading to fatal cardiac conduction blocks.',
        'recommendation': 'Avoid potassium supplements or salt substitutes unless specifically prescribed with lab monitoring.'
    },
    {
        'drugs': ['metformin', 'contrast'],
        'severity': 'major',
        'title': 'Lactic Acidosis Risk (Biguanide + Iodinated Contrast)',
        'mechanism': 'Contrast-induced nephropathy leads to metformin accumulation and toxic lactic acidosis.',
        'risk': 'Potentially fatal metabolic acidosis.',
        'recommendation': 'Discontinue metformin prior to or at time of iodinated contrast imaging; resume 48 hours post-scan after verifying normal renal function.'
    },
    {
        'drugs': ['atorvastatin', 'clarithromycin'],
        'severity': 'major',
        'title': 'Rhabdomyolysis Risk (Statin + Strong CYP3A4 Inhibitor)',
        'mechanism': 'Clarithromycin potently inhibits CYP3A4 metabolism, skyrocketing systemic statin exposure.',
        'risk': 'Severe muscle breakdown (rhabdomyolysis), acute kidney failure, and elevated CPK.',
        'recommendation': 'Temporarily withhold atorvastatin during clarithromycin treatment or choose azithromycin as an alternative.'
    },
    {
        'drugs': ['omeprazole', 'clopidogrel'],
        'severity': 'moderate',
        'title': 'Reduced Antiplatelet Efficacy (PPI + Antiplatelet)',
        'mechanism': 'Omeprazole inhibits CYP2C19, the primary enzyme required to bioactivate clopidogrel.',
        'risk': 'Subtherapeutic platelet inhibition increasing risk of recurrent cardiovascular thrombotic events/stent thrombosis.',
        'recommendation': 'Switch to pantoprazole or an H2 blocker (e.g. famotidine) which exhibit minimal CYP2C19 inhibition.'
    },
    {
        'drugs': ['sertraline', 'tramadol'],
        'severity': 'major',
        'title': 'Serotonin Syndrome Risk (SSRI + Opioid Analgesic)',
        'mechanism': 'Additive serotonergic neurotransmission and inhibition of serotonin reuptake.',
        'risk': 'Serotonin syndrome: agitation, tremor, hyperreflexia, hyperthermia, and autonomic instability.',
        'recommendation': 'Avoid concomitant use; recognize early signs of serotonin toxicity immediately.'
    },
    {
        'drugs': ['ciprofloxacin', 'theophylline'],
        'severity': 'major',
        'title': 'Theophylline Toxicity (Fluoroquinolone + Methylxanthine)',
        'mechanism': 'Ciprofloxacin inhibits CYP1A2, drastically decreasing theophylline clearance.',
        'risk': 'Theophylline toxicity: seizures, fatal tachyarrhythmias, nausea, and vomiting.',
        'recommendation': 'Reduce theophylline dosage by 50% and monitor plasma theophylline concentrations closely.'
    },
    {
        'drugs': ['metformin', 'alcohol'],
        'severity': 'major',
        'title': 'Lactic Acidosis & Hypoglycemia Risk',
        'mechanism': 'Alcohol potentiates metformin effects on lactate metabolism and impairs hepatic gluconeogenesis.',
        'risk': 'Severe hypoglycemia and lactic acidosis.',
        'recommendation': 'Avoid excessive acute or chronic alcohol consumption while taking metformin.'
    },
    {
        'drugs': ['amoxicillin', 'methotrexate'],
        'severity': 'moderate',
        'title': 'Methotrexate Toxicity (Penicillin + Antimetabolite)',
        'mechanism': 'Penicillins inhibit renal tubular secretion of methotrexate.',
        'risk': 'Bone marrow suppression, severe cytopenias, and gastrointestinal toxicity.',
        'recommendation': 'Monitor complete blood counts (CBC) and methotrexate serum levels closely.'
    },
    {
        'drugs': ['digoxin', 'amiodarone'],
        'severity': 'major',
        'title': 'Digoxin Toxicity (Cardiac Glycoside + Antiarrhythmic)',
        'mechanism': 'Amiodarone inhibits P-glycoprotein efflux pump and renal clearance of digoxin.',
        'risk': 'Severe bradycardia, AV block, and life-threatening digitalis toxicity.',
        'recommendation': 'Reduce digoxin dose by 50% when starting amiodarone and monitor digoxin levels.'
    },
    {
        'drugs': ['simvastatin', 'amlodipine'],
        'severity': 'moderate',
        'title': 'Increased Statin Exposure (Statin + Calcium Channel Blocker)',
        'mechanism': 'Amlodipine inhibits CYP3A4-mediated metabolism of simvastatin.',
        'risk': 'Increased risk of statin-associated muscle symptoms (myalgia, elevated CPK).',
        'recommendation': 'Limit simvastatin dosage to a maximum of 20 mg daily when combined with amlodipine.'
    },
    {
        'drugs': ['levothyroxine', 'calcium'],
        'severity': 'moderate',
        'title': 'Decreased Thyroid Hormone Absorption (Thyroid + Cation Chelator)',
        'mechanism': 'Calcium carbonate binds levothyroxine in the gastrointestinal tract, forming an insoluble complex.',
        'risk': 'Subtherapeutic thyroid hormone replacement and persistent hypothyroidism symptoms.',
        'recommendation': 'Separate administration by at least 4 hours.'
    },
    {
        'drugs': ['aspirin', 'clopidogrel'],
        'severity': 'moderate',
        'title': 'Dual Antiplatelet Therapy (DAPT) Bleeding Risk',
        'mechanism': 'Additive antiplatelet effects through distinct enzymatic pathways (COX-1 and P2Y12).',
        'risk': 'Elevated risk of major and minor bleeding episodes.',
        'recommendation': 'Standard after acute coronary syndromes or coronary stenting, but require clinical monitoring for signs of active bleeding.'
    }
]

def normalize_med_name(name: str) -> str:
    """Strip dosage, strength, form tokens, and punctuation for robust matching."""
    cleaned = name.lower()
    cleaned = re.sub(r'\b\d+(\.\d+)?\s*(mg|mcg|g|ml|iu|tablets?|capsules?|tabs?|caps?|hcl|sodium|potassium)\b', '', cleaned)
    cleaned = re.sub(r'[^a-zA-Z\s]', ' ', cleaned)
    return cleaned.strip()

def check_drug_interactions(medication_names: List[str]) -> Dict:
    """
    Analyzes an array of medication names for pairwise drug-drug interactions.
    """
    cleaned_drugs = [d.strip() for d in medication_names if d and str(d).strip()]
    if len(cleaned_drugs) < 2:
        return {
            'total_medications': len(cleaned_drugs),
            'interaction_count': 0,
            'safety_level': 'Safe',
            'interactions': [],
            'summary': 'Please provide at least 2 medications to check for drug-drug interactions.'
        }

    detected_interactions = []

    # Check all pairs
    for i in range(len(cleaned_drugs)):
        for j in range(i + 1, len(cleaned_drugs)):
            raw_d1 = cleaned_drugs[i]
            raw_d2 = cleaned_drugs[j]
            norm_d1 = normalize_med_name(raw_d1)
            norm_d2 = normalize_med_name(raw_d2)

            # Search known interaction rules
            for rule in KNOWN_INTERACTIONS:
                r1 = rule['drugs'][0].lower()
                r2 = rule['drugs'][1].lower()
                
                # Check if pair matches rule
                match_1 = (r1 in norm_d1 or norm_d1 in r1) and (r2 in norm_d2 or norm_d2 in r2)
                match_2 = (r2 in norm_d1 or norm_d1 in r2) and (r1 in norm_d2 or norm_d2 in r1)

                if match_1 or match_2:
                    detected_interactions.append({
                        'drug_1': raw_d1.title(),
                        'drug_2': raw_d2.title(),
                        'severity': rule['severity'],
                        'title': rule['title'],
                        'mechanism': rule['mechanism'],
                        'risk': rule['risk'],
                        'recommendation': rule['recommendation']
                    })

    # Deduplicate
    unique_interactions = []
    seen = set()
    for item in detected_interactions:
        key = f"{item['drug_1']}-{item['drug_2']}-{item['title']}"
        if key not in seen:
            seen.add(key)
            unique_interactions.append(item)

    # Determine overall safety level
    has_major = any(i['severity'] == 'major' for i in unique_interactions)
    has_moderate = any(i['severity'] == 'moderate' for i in unique_interactions)

    if has_major:
        safety_level = 'High Risk Alert'
        summary = f"Detected {len(unique_interactions)} significant interaction(s). High-risk combinations require immediate medical review with your prescribing doctor."
    elif has_moderate:
        safety_level = 'Caution Advised'
        summary = f"Detected {len(unique_interactions)} moderate interaction(s). Monitoring and possible timing/dosage adjustments are advised."
    else:
        safety_level = 'No Known Direct Interaction'
        summary = f"No major documented adverse interactions found between the {len(cleaned_drugs)} selected medications in standard clinical monographs. Always verify with your pharmacist."

    return {
        'total_medications': len(cleaned_drugs),
        'medications': [d.title() for d in cleaned_drugs],
        'interaction_count': len(unique_interactions),
        'safety_level': safety_level,
        'interactions': unique_interactions,
        'summary': summary
    }

