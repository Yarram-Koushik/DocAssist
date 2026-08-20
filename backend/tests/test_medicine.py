"""
Tests for DocAssist Medicine Search Module.
"""
import pytest
from unittest.mock import patch, MagicMock
from medicine.openfda_client import search_drug
from medicine.formatter import format_medicine_info, clean_fda_text


class TestOpenFDAClient:
    """Tests for openFDA API client."""

    @patch('medicine.openfda_client.requests.get')
    def test_search_drug_success(self, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'results': [{
                'openfda': {
                    'generic_name': ['ACETAMINOPHEN'],
                    'brand_name': ['TYLENOL']
                },
                'indications_and_usage': ['For temporary relief of minor aches and pains.'],
                'warnings': ['Liver warning: This product contains acetaminophen.'],
                'adverse_reactions': ['Nausea, vomiting, headache'],
                'contraindications': ['Known allergy to acetaminophen'],
            }]
        }
        mock_get.return_value = mock_response

        result = search_drug("paracetamol")
        assert result is not None

    @patch('medicine.openfda_client.requests.get')
    def test_search_drug_not_found(self, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_response.json.return_value = {'error': {'code': 'NOT_FOUND'}}
        mock_get.return_value = mock_response

        result = search_drug("nonexistentdrug12345")
        assert result is None

    @patch('medicine.openfda_client.requests.get')
    def test_search_drug_timeout(self, mock_get):
        mock_get.side_effect = Exception("Connection timeout")
        result = search_drug("aspirin")
        assert result is None


class TestMedicineFormatter:
    """Tests for medicine info formatting."""

    def test_format_basic_info(self):
        raw_data = {
            'openfda': {
                'generic_name': ['IBUPROFEN'],
                'brand_name': ['ADVIL', 'MOTRIN']
            },
            'indications_and_usage': ['For pain relief.'],
            'warnings': ['Do not use with alcohol.'],
            'adverse_reactions': ['Stomach upset, dizziness.'],
            'contraindications': ['Allergy to NSAIDs.'],
        }
        result = format_medicine_info(raw_data)
        assert result is not None
        assert 'generic_name' in result
        assert 'disclaimer' in result
        # Should NOT contain dosage
        assert 'dosage' not in str(result).lower() or result.get('dosage') is None

    def test_clean_fda_text_removes_html(self):
        text = "<p>This is a <b>warning</b> about the drug.</p>"
        cleaned = clean_fda_text(text)
        assert "<p>" not in cleaned
        assert "<b>" not in cleaned

    def test_clean_fda_text_handles_none(self):
        result = clean_fda_text(None)
        assert result == "" or result is None

    def test_format_includes_source(self):
        raw_data = {
            'openfda': {'generic_name': ['TEST DRUG'], 'brand_name': ['TEST']},
            'indications_and_usage': ['Test use'],
            'warnings': ['Test warning'],
        }
        result = format_medicine_info(raw_data)
        assert 'source' in result
        assert 'FDA' in result['source'] or 'fda' in result['source'].lower()
