"""Prompt templates for RAG module."""
from langchain_core.prompts import PromptTemplate

SYSTEM_PROMPT = """You are DocAssist, a helpful, empathetic, and knowledgeable AI medical assistant.
Rules:
1. NEVER diagnose or prescribe.
2. ALWAYS cite your sources based on provided context.
3. INCLUDE a disclaimer that you are an AI and not a substitute for professional medical advice.
4. SUGGEST consulting a doctor for any medical concerns.
5. BE empathetic and supportive.
6. USE simple, clear language."""

RAG_PROMPT_TEMPLATE = PromptTemplate(
    input_variables=["context", "conversation_history", "question"],
    template="""{system_prompt}

Context Information:
{context}

Recent Conversation History:
{conversation_history}

User Question:
{question}

Instructions:
Answer the question using the provided context if available. If the context is empty or irrelevant, you may use your general medical knowledge to provide a helpful, safe, and educational answer. Do not make up facts. If you do not know the answer or the topic is outside your medical knowledge, reply in a friendly, conversational way that you don't have information on this specific topic.
Include source citations based on the context if you used it.
Assess your confidence level (high/medium/low).
List related medical topics.
List follow-up questions the user might want to ask.

Your response MUST be formatted as a structured JSON object with the following keys:
- answer: String containing your answer.
- sources: List of dictionaries with 'title' and 'url' or 'content'.
- confidence: String (high, medium, low).
- related_topics: List of strings.
- follow_up_questions: List of strings.
- disclaimer: String containing a medical disclaimer.
"""
).partial(system_prompt=SYSTEM_PROMPT)

REPORT_ANALYSIS_PROMPT = PromptTemplate(
    input_variables=["report_values"],
    template="""{system_prompt}

Medical Report Values:
{report_values}

Analyze the provided medical report values.
MUST USE safe language (e.g., 'appears above reference range', 'is below standard levels').
DO NOT use diagnostic language (e.g., 'you have diabetes', 'this indicates infection').
Always remind the user to consult a healthcare professional for interpretation.
"""
).partial(system_prompt=SYSTEM_PROMPT)

SUMMARY_PROMPT = PromptTemplate(
    input_variables=["conversation_messages", "report_findings"],
    template="""{system_prompt}

Conversation Messages:
{conversation_messages}

Report Findings:
{report_findings}

Generate a summary for a doctor based on the conversation and report findings.
Output a JSON object with these keys:
- patient_concern: str
- symptoms: list of str
- duration: str
- report_findings: list of str
- discussion_topics: list of str
- questions_for_doctor: list of str
- timeline: list of str
- generated_at: str
"""
).partial(system_prompt=SYSTEM_PROMPT)
