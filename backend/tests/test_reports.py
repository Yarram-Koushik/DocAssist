"""
Tests for DocAssist Report Parser Module.
"""
import pytest
from report_parser.entity_extractor import extract_medical_values
from report_parser.reference_ranges import check_range, get_range_info, REFERENCE_RANGES
from report_parser.text_cleaner import clean_text


class TestEntityExtractor:
    """Tests for medical value extraction from report text."""

    def test_extract_hemoglobin(self):
        text = "Hemoglobin: 14.5 g/dL"
        values = extract_medical_values(text)
        hb = next((v for v in values if 'hemoglobin' in v['parameter'].lower()), None)
        assert hb is not None
        assert hb['value'] == 14.5

    def test_extract_wbc(self):
        text = "WBC Count: 8500 /cumm"
        values = extract_medical_values(text)
        wbc = next((v for v in values if 'wbc' in v['parameter'].lower()), None)
        assert wbc is not None

    def test_extract_glucose(self):
        text = "Fasting Blood Sugar: 110 mg/dL"
        values = extract_medical_values(text)
        assert len(values) >= 1

    def test_extract_tsh(self):
        text = "TSH (Thyroid Stimulating Hormone): 2.5 mIU/L"
        values = extract_medical_values(text)
        tsh = next((v for v in values if 'tsh' in v['parameter'].lower()), None)
        assert tsh is not None
        assert tsh['value'] == 2.5

    def test_extract_cholesterol(self):
        text = "Total Cholesterol: 220 mg/dL\nLDL: 140 mg/dL\nHDL: 55 mg/dL"
        values = extract_medical_values(text)
        assert len(values) >= 2

    def test_empty_text(self):
        values = extract_medical_values("")
        assert values == []

    def test_no_medical_values(self):
        text = "Patient appears healthy. No concerns noted."
        values = extract_medical_values(text)
        assert isinstance(values, list)

    def test_multiple_values(self):
        text = """
        Hemoglobin: 12.5 g/dL
        WBC: 7500 /cumm
        Platelets: 250000 /cumm
        RBC: 4.5 million/cumm
        """
        values = extract_medical_values(text)
        assert len(values) >= 3


class TestReferenceRanges:
    """Tests for reference range checking."""

    def test_normal_hemoglobin(self):
        result = check_range('Hemoglobin', 14.0)
        assert result == 'normal'

    def test_low_hemoglobin(self):
        result = check_range('Hemoglobin', 8.0)
        assert result in ['below', 'low']

    def test_high_glucose(self):
        result = check_range('Glucose (Fasting)', 200.0)
        assert result in ['above', 'high']

    def test_unknown_parameter(self):
        result = check_range('UnknownTest', 50.0)
        assert result == 'unknown'

    def test_reference_ranges_not_empty(self):
        assert len(REFERENCE_RANGES) > 0

    def test_get_range_info_exists(self):
        info = get_range_info('Hemoglobin')
        assert info is not None
        assert 'min' in info or 'max' in info

    def test_get_range_info_unknown(self):
        info = get_range_info('NonExistentTest')
        assert info is None


class TestTextCleaner:
    """Tests for text cleaning utilities."""

    def test_clean_whitespace(self):
        text = "Hemoglobin:   14.5    g/dL"
        cleaned = clean_text(text)
        assert "  " not in cleaned or cleaned.count("  ") < text.count("  ")

    def test_clean_empty(self):
        assert clean_text("") == ""

    def test_preserves_medical_values(self):
        text = "TSH: 2.5 mIU/L"
        cleaned = clean_text(text)
        assert "2.5" in cleaned
        assert "TSH" in cleaned
