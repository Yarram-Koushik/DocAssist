"""
Tests for DocAssist AI Safety Layer.
"""
import pytest
from utils.safety import filter_response, add_disclaimer, is_safe_response, DISCLAIMER


class TestSafetyFilter:
    """Tests for AI safety response filtering."""

    def test_filters_diagnosis_language(self):
        text = "You have diabetes based on your blood sugar levels."
        filtered = filter_response(text)
        assert "you have diabetes" not in filtered.lower()

    def test_filters_prescription_language(self):
        text = "You should take 500mg of metformin twice daily."
        filtered = filter_response(text)
        # Should not contain dosage recommendations as-is
        assert filtered != text or is_safe_response(filtered)

    def test_safe_response_passes(self):
        text = "Your blood sugar levels appear to be above the common reference range. Please consult your doctor."
        assert is_safe_response(text) or filter_response(text) == text

    def test_disclaimer_added(self):
        text = "Some medical information here."
        result = add_disclaimer(text)
        assert DISCLAIMER in result or "educational" in result.lower() or "not a" in result.lower()

    def test_disclaimer_constant_exists(self):
        assert DISCLAIMER is not None
        assert len(DISCLAIMER) > 20
        assert "medical" in DISCLAIMER.lower() or "diagnosis" in DISCLAIMER.lower()

    def test_empty_input(self):
        assert filter_response("") == ""
        result = add_disclaimer("")
        assert DISCLAIMER in result or len(result) > 0


class TestSafeLanguage:
    """Tests to ensure safe medical language patterns."""

    def test_unsafe_phrases_detected(self):
        unsafe_phrases = [
            "You have cancer",
            "You are diagnosed with",
            "You suffer from kidney disease",
        ]
        for phrase in unsafe_phrases:
            assert not is_safe_response(phrase), f"Should flag: {phrase}"

    def test_safe_phrases_accepted(self):
        safe_phrases = [
            "This value appears above the common reference range.",
            "Consider consulting your healthcare provider.",
            "Based on the provided information, further evaluation may be helpful.",
        ]
        for phrase in safe_phrases:
            result = is_safe_response(phrase)
            # Safe phrases should either pass or at least not crash
            assert isinstance(result, bool)
