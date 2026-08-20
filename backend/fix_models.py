import os
import re

backend_dir = r"c:\Users\koushik\Desktop\DocAssist_Chatbot\backend"
dirs_to_scan = [os.path.join(backend_dir, "services"), os.path.join(backend_dir, "routes")]

replacements = [
    # Imports
    (r"from models\.conversation import Conversation", r"from models.chat import Conversation"),
    (r"from models\.chat_history import ChatHistory", r"from models.chat import ChatHistory"),
    (r"from models\.medicine_search import MedicineSearch", r"from models.medicine import Medicine"),
    (r"from models\.summary import Summary", r"from models.summary import DoctorSummary"),
    (r"from models\.analytics_event import AnalyticsEvent", r"from models.analytics import Analytics"),
    
    # Class names usage
    (r"\bMedicineSearch\b", r"Medicine"),
    (r"\bSummary\b", r"DoctorSummary"),
    (r"\bAnalyticsEvent\b", r"Analytics"),
    
    # Property fixes
    (r"Medicine\.query_text", r"Medicine.search_query"),
    (r"DoctorSummary\((.*?)content=", r"DoctorSummary(\1summary_text="),
    (r"summary\.content", r"summary.summary_text")
]

for d in dirs_to_scan:
    for root, _, files in os.walk(d):
        for file in files:
            if file.endswith(".py") and file != "__init__.py":
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original_content = content
                for pattern, repl in replacements:
                    content = re.sub(pattern, repl, content)
                
                if content != original_content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Fixed {filepath}")

print("Fixes applied.")
