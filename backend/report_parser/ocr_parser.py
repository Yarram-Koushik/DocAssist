"""OCR parser for images."""
try:
    import pytesseract
    from PIL import Image
    HAS_OCR = True
except ImportError:
    HAS_OCR = False

def extract_text_from_image(file_path: str) -> str:
    """Extract text from image using pytesseract + PIL."""
    if not HAS_OCR:
        return "Error: pytesseract or Pillow not installed. OCR unavailable."
        
    try:
        img = Image.open(file_path)
        img = img.convert('L')
        img = img.point(lambda x: 0 if x < 128 else 255, '1')
        text = pytesseract.image_to_string(img)
        return text
    except Exception as e:
        print(f"Error performing OCR: {e}")
        return ""
