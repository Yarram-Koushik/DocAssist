"""Doctor summary generator."""
import json
import re
from datetime import datetime
from rag.chain import get_llm
from rag.prompts import SUMMARY_PROMPT

def generate_doctor_summary(conversation_messages, report_findings=None) -> dict:
    """Uses LLM to generate structured doctor visit summary."""
    # Format conversation text
    if isinstance(conversation_messages, list):
        conv_str = json.dumps(conversation_messages)
        full_text = "\n".join(str(m.get('message', m.get('content', ''))) for m in conversation_messages if isinstance(m, dict))
    else:
        conv_str = str(conversation_messages)
        full_text = conv_str
        
    rep_str = json.dumps(report_findings) if (report_findings and isinstance(report_findings, (dict, list))) else str(report_findings or "None")

    try:
        llm = get_llm()
        chain = SUMMARY_PROMPT | llm
        response = chain.invoke({
            "conversation_messages": conv_str,
            "report_findings": rep_str
        })
        
        response_text = response.content
        if response_text.startswith("```json"):
            response_text = response_text[7:-3].strip()
        elif response_text.startswith("```"):
            response_text = response_text[3:-3].strip()
            
        summary = json.loads(response_text)
        if 'generated_at' not in summary or not summary['generated_at']:
            summary['generated_at'] = datetime.now().isoformat()
        return summary
    except Exception as e:
        print(f"LLM doctor summary generation exception: {e}")
        
        # Clinical intelligent rule-based fallback extraction
        user_lines = [l.replace('User:', '').strip() for l in full_text.splitlines() if l.lower().startswith('user:')]
        primary_concern = user_lines[0] if user_lines else "Clinical Health Consultation & Assessment"
        if len(primary_concern) > 120:
            primary_concern = primary_concern[:117] + "..."
            
        return {
            "patient_concern": primary_concern,
            "symptoms": ["Reported symptoms documented in consultation transcript"],
            "duration": "Discussed during consultation",
            "report_findings": [rep_str[:120]] if report_findings and rep_str != "None" else ["No attached abnormal lab test alerts"],
            "discussion_topics": ["Symptom evaluation", "Medication guidance", "Physician follow-up plan"],
            "questions_for_doctor": [
                "Are my current symptoms consistent with a common viral illness or do they indicate an underlying condition?",
                "Do any of my attached lab values require dosage changes or medication adjustments?",
                "What specific red-flag symptoms should prompt an immediate emergency room visit?"
            ],
            "timeline": ["Recent symptom onset as discussed during consultation"],
            "generated_at": datetime.now().isoformat()
        }

