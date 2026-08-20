from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os

def create_sample_report(output_path):
    c = canvas.Canvas(output_path, pagesize=letter)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(200, 750, "MOCK MEDICAL LABORATORY")
    c.setFont("Helvetica", 12)
    c.drawString(200, 735, "123 Health Way, Wellness City")
    
    c.line(50, 720, 550, 720)
    
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, 690, "Patient Name: John Doe")
    c.drawString(350, 690, "Date: 2026-08-20")
    c.drawString(50, 670, "Report Type: Complete Blood Count (CBC)")
    
    c.line(50, 650, 550, 650)
    
    # Table Headers
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, 620, "Test Parameter")
    c.drawString(250, 620, "Result")
    c.drawString(350, 620, "Units")
    c.drawString(450, 620, "Reference Range")
    
    # Table Data
    c.setFont("Helvetica", 12)
    
    # Low Hemoglobin
    c.drawString(50, 590, "Hemoglobin")
    c.setFillColorRGB(1, 0, 0) # Red for abnormal
    c.drawString(250, 590, "11.2")
    c.setFillColorRGB(0, 0, 0)
    c.drawString(350, 590, "g/dL")
    c.drawString(450, 590, "13.8 - 17.2")
    
    # Normal WBC
    c.drawString(50, 560, "White Blood Cells (WBC)")
    c.drawString(250, 560, "8500")
    c.drawString(350, 560, "/cumm")
    c.drawString(450, 560, "4500 - 11000")
    
    # Normal Platelets
    c.drawString(50, 530, "Platelets")
    c.drawString(250, 530, "150000")
    c.drawString(350, 530, "/cumm")
    c.drawString(450, 530, "150000 - 450000")
    
    # High TSH
    c.drawString(50, 500, "TSH (Thyroid)")
    c.setFillColorRGB(1, 0, 0) # Red for abnormal
    c.drawString(250, 500, "5.1")
    c.setFillColorRGB(0, 0, 0)
    c.drawString(350, 500, "mIU/L")
    c.drawString(450, 500, "0.4 - 4.0")

    c.line(50, 480, 550, 480)
    
    c.setFont("Helvetica-Oblique", 10)
    c.drawString(50, 450, "*** This is a computer generated mock report. Do not use for medical diagnosis. ***")
    
    c.save()
    print(f"Sample report created at {output_path}")

create_sample_report(r"c:\Users\koushik\Desktop\Sample_Blood_Test_Report.pdf")
