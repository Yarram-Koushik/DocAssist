"""
Tests for DocAssist Emergency Detection System.
"""
import pytest
from emergency.detector import detect_emergency
from emergency.responses import get_emergency_response


class TestEmergencyDetection:
    """Tests for emergency symptom detection."""

    def test_chest_pain_detected(self):
        result = detect_emergency("I have severe chest pain")
        assert result is not None
        assert result['is_emergency'] is True
        assert result['category'] == 'cardiac'
        assert result['severity'] == 'critical'

    def test_breathing_difficulty(self):
        result = detect_emergency("I can't breathe properly")
        assert result is not None
        assert result['is_emergency'] is True
        assert result['category'] == 'respiratory'

    def test_stroke_symptoms(self):
        result = detect_emergency("I have sudden numbness and speech difficulty")
        assert result is not None
        assert result['is_emergency'] is True
        assert result['category'] == 'stroke'

    def test_mental_health_crisis(self):
        result = detect_emergency("I want to kill myself")
        assert result is not None
        assert result['is_emergency'] is True
        assert result['category'] == 'mental_health'
        assert result['severity'] == 'critical'

    def test_severe_bleeding(self):
        result = detect_emergency("I am bleeding heavily and it won't stop")
        assert result is not None
        assert result['is_emergency'] is True
        assert result['category'] == 'bleeding'

    def test_unconsciousness(self):
        result = detect_emergency("My friend passed out and is not responding")
        assert result is not None
        assert result['is_emergency'] is True
        assert result['category'] == 'consciousness'

    def test_allergic_reaction(self):
        result = detect_emergency("I have severe allergic reaction and throat swelling")
        assert result is not None
        assert result['is_emergency'] is True
        assert result['category'] == 'allergic'

    def test_normal_message_no_emergency(self):
        result = detect_emergency("What are the symptoms of common cold?")
        assert result is None

    def test_general_health_question(self):
        result = detect_emergency("How can I prevent diabetes?")
        assert result is None

    def test_case_insensitive(self):
        result = detect_emergency("I HAVE CHEST PAIN")
        assert result is not None
        assert result['is_emergency'] is True

    def test_empty_message(self):
        result = detect_emergency("")
        assert result is None


class TestEmergencyResponses:
    """Tests for emergency response templates."""

    def test_cardiac_response_exists(self):
        response = get_emergency_response('cardiac', 'critical')
        assert response is not None
        assert len(response) > 50
        assert 'emergency' in response.lower() or '911' in response or '112' in response

    def test_mental_health_response(self):
        response = get_emergency_response('mental_health', 'critical')
        assert response is not None
        assert '988' in response or 'crisis' in response.lower() or 'hotline' in response.lower()

    def test_all_categories_have_responses(self):
        categories = ['cardiac', 'respiratory', 'stroke', 'bleeding',
                      'consciousness', 'mental_health', 'allergic', 'pregnancy']
        for category in categories:
            response = get_emergency_response(category, 'high')
            assert response is not None, f"No response for category: {category}"
            assert len(response) > 20, f"Response too short for category: {category}"
