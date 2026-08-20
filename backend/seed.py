import os
import random
from app import create_app, db
from models.user import User
from models.chat import Conversation, ChatHistory
from models.report import Report
from models.medicine import Medicine
from models.summary import DoctorSummary
from werkzeug.security import generate_password_hash
import json

def seed_data():
    app = create_app('development')
    with app.app_context():
        print("Seeding database...")
        
        # 1. Create a Test Patient User
        patient = User.query.filter_by(email="patient@example.com").first()
        if not patient:
            patient = User(
                email="patient@example.com",
                username="john_patient",
                password_hash=generate_password_hash("Password123!"),
                full_name="John Doe Patient"
            )
            db.session.add(patient)
            db.session.commit()
            print("Patient created.")

        # 2. Add sample reports
        report1 = Report(
            user_id=patient.id,
            filename="Complete_Blood_Count_2026.pdf",
            file_path="uploads/mock1.pdf",
            file_type="pdf",
            report_type="CBC",
            extracted_values=json.dumps([
                {"parameter": "Hemoglobin", "value": 11.2, "unit": "g/dL", "status": "low"},
                {"parameter": "WBC", "value": 8500, "unit": "/cumm", "status": "normal"},
                {"parameter": "Platelets", "value": 150000, "unit": "/cumm", "status": "normal"}
            ]),
            ai_explanation="Your Hemoglobin is slightly below the normal range, indicating mild anemia. Your white blood cells and platelets are normal.",
            reference_ranges=json.dumps({"Hemoglobin": "13.8-17.2 g/dL", "WBC": "4500-11000 /cumm", "Platelets": "150000-450000 /cumm"})
        )
        db.session.add(report1)
        
        # 3. Add Medicine Searches
        med1 = Medicine(
            user_id=patient.id,
            search_query="Amoxicillin",
            generic_name="AMOXICILLIN",
            result_data=json.dumps({
                "uses": "Used to treat a wide variety of bacterial infections.",
                "side_effects": "Nausea, vomiting, diarrhea may occur.",
                "warnings": "Before using this medication, tell your doctor or pharmacist your medical history."
            })
        )
        db.session.add(med1)
        
        # 4. Add Conversation & Chat History
        conv = Conversation(user_id=patient.id, title="Anemia & Fatigue Queries")
        db.session.add(conv)
        db.session.commit()
        
        msg1 = ChatHistory(
            conversation_id=conv.id,
            user_id=patient.id,
            role="user",
            message="Why do I feel so tired lately? My hemoglobin was 11.2.",
            sources=json.dumps([]),
            confidence_score=0.0
        )
        msg2 = ChatHistory(
            conversation_id=conv.id,
            user_id=patient.id,
            role="assistant",
            message="A hemoglobin level of 11.2 g/dL is slightly low (mild anemia), which often causes fatigue. This happens because your body has fewer red blood cells to carry oxygen. I recommend consulting your physician to check your iron and vitamin B12 levels.",
            sources=json.dumps([{"title": "Anemia Overview", "content": "Anemia is a condition..."}]),
            confidence_score=0.92
        )
        db.session.add_all([msg1, msg2])
        
        # 5. Add Doctor Summary
        summary = DoctorSummary(
            user_id=patient.id,
            conversation_id=conv.id,
            summary_text="Patient reports fatigue associated with recent lab results indicating mild anemia (Hemoglobin 11.2 g/dL). Advised to seek medical consultation for potential iron or B12 deficiency evaluation.",
            report_ids=json.dumps([report1.id])
        )
        db.session.add(summary)
        
        db.session.commit()
        print("Data seeded successfully!")

if __name__ == "__main__":
    seed_data()
