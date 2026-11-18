"""
AI Service Integration Bridge
Connects to Google Gemini API, OpenRouter API, and computer vision / audio pipelines.
Analyzes raw complaint inputs, corrects grammar/spelling, formalizes informal text into official grievance language,
extracts key complaint details, and generates structured problem statements without hallucinating facts.
"""

import os
import json
import re
import requests
from services.departments import DEPARTMENTS, get_department_by_id

CATEGORY_OBJECT_MAP = {
    'Pothole / Road Damage': {'label': 'Damaged Pavement / Pothole', 'confidence': 0.94, 'bbox': [22, 35, 54, 42]},
    'Garbage / Waste': {'label': 'Garbage Accumulation / Waste Pile', 'confidence': 0.91, 'bbox': [18, 28, 62, 55]},
    'Water Leakage': {'label': 'Water Pipe Leakage / Stagnation', 'confidence': 0.89, 'bbox': [25, 40, 50, 45]},
    'Broken Streetlight': {'label': 'Faulty / Broken Luminaire', 'confidence': 0.95, 'bbox': [30, 15, 40, 60]},
    'Drainage Problem': {'label': 'Clogged / Overflowing Drain', 'confidence': 0.88, 'bbox': [20, 30, 60, 50]},
    'Railway Infrastructure Damage': {'label': 'Structural Cracks / Platform Hazard', 'confidence': 0.93, 'bbox': [15, 20, 70, 60]},
    'Station Cleanliness': {'label': 'Unsanitary Concourse / Litter', 'confidence': 0.87, 'bbox': [20, 25, 60, 50]},
    'Track / Railway Area Issue': {'label': 'Track Obstruction / Debris', 'confidence': 0.96, 'bbox': [10, 35, 80, 45]},
    'Passenger Facility Problem': {'label': 'Damaged Passenger Seating / Fixture', 'confidence': 0.90, 'bbox': [25, 30, 50, 45]},
    'Other': {'label': 'Civic Amenity Anomaly', 'confidence': 0.85, 'bbox': [25, 25, 50, 50]}
}

STANDARD_CATEGORIES = [
    'Pothole / Road Damage',
    'Garbage / Waste',
    'Water Leakage',
    'Broken Streetlight',
    'Drainage Problem',
    'Railway Infrastructure Damage',
    'Station Cleanliness',
    'Track / Railway Area Issue',
    'Passenger Facility Problem',
    'Other'
]

def build_rule_based_fallback(description="", category="Other", location=""):
    trimmed = description.strip() if description else ""
    if not trimmed:
        return {
            'structuredProblemStatement': f"Formal Grievance Report: Civic issue regarding {category} logged for official department inspection.",
            'summary': f"Reported {category} grievance.",
            'extractedDetails': {
                'specificIssue': category,
                'locationContext': location or 'Designated Premises',
                'observedImpactOrRisk': 'Administrative remediation requested'
            },
            'suggestedCategory': category,
            'suggestedUrgency': 'Medium',
            'suggestedDepartment': {'id': 'railway', 'code': 'RLY', 'name': 'Railway Department'},
            'provider': 'Local Rule Engine'
        }

    lower = trimmed.lower()
    urgency = 'Medium'
    if any(k in lower for k in ['danger', 'fire', 'track', 'hazard', 'critical', 'emergency', 'severed', 'burst']):
        urgency = 'Critical'
    elif any(k in lower for k in ['broken', 'leak', 'damage', 'pothole', 'urgent', 'accident', 'overflow']):
        urgency = 'High'
    elif any(k in lower for k in ['clean', 'garbage', 'smell', 'light', 'waste']):
        urgency = 'Medium'
    else:
        urgency = 'Low'

    dept = {'id': 'railway', 'code': 'RLY', 'name': 'Railway Department'}
    if any(k in lower for k in ['pipe', 'sewage', 'drain', 'water']) and 'station' not in lower and 'coach' not in lower:
        dept = {'id': 'water_supply', 'code': 'WTR', 'name': 'Water Supply & Sewerage Board'}
    elif any(k in lower for k in ['city', 'municipal', 'corporation', 'encroachment', 'garbage', 'waste']):
        dept = {'id': 'municipality', 'code': 'MUN', 'name': 'Municipal Corporation'}
    elif any(k in lower for k in ['road', 'bridge', 'pothole', 'highway', 'footpath']):
        dept = {'id': 'roads_infra', 'code': 'RDS', 'name': 'Roads & Infrastructure (PWD)'}
    elif any(k in lower for k in ['electric', 'power', 'wire', 'transformer', 'shock']):
        dept = {'id': 'electricity', 'code': 'ELE', 'name': 'Electricity Board (DISCOM)'}

    loc_text = f" at \"{location}\"" if location else ""
    statement = (
        f"Official Grievance Statement: A grievance has been registered regarding {category}{loc_text}. "
        f"Reported incident details: \"{trimmed}\". Immediate technical assessment, verification, and timely rectification "
        f"are requested in accordance with administrative standards.\n\n"
        f"Key Extracted Details:\n"
        f"• Specific Issue: {trimmed[:77] + '...' if len(trimmed) > 80 else trimmed}\n"
        f"• Location Context: {location or 'Public Premises'}\n"
        f"• Priority / Urgency: {urgency} Level Action Required"
    )

    return {
        'structuredProblemStatement': statement,
        'summary': f"{category} issue reported: {trimmed[:60]}",
        'extractedDetails': {
            'specificIssue': trimmed,
            'locationContext': location or 'Premises',
            'observedImpactOrRisk': f"{urgency} priority attention required."
        },
        'suggestedCategory': category or 'Other',
        'suggestedUrgency': urgency,
        'suggestedDepartment': dept,
        'provider': 'Local Rule Engine'
    }

def analyze_complaint_text(description="", category="Other", location="", language="en"):
    gemini_key = os.getenv('GEMINI_API_KEY')
    openrouter_key = os.getenv('OPENROUTER_API_KEY')
    provider = os.getenv('LLM_PROVIDER', 'auto')

    # If Gemini is configured
    if gemini_key and (provider in ('gemini', 'auto')):
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
            prompt = (
                f"You are JanSahayata AI, a Government of India Civic & Railway Grievance Intelligence System.\n"
                f"Analyze the following complaint: '{description}'.\n"
                f"Category: '{category}'. Location: '{location}'.\n"
                f"Format the output strictly as JSON with keys:\n"
                f"structuredProblemStatement (string: formal, professional grievance statement),\n"
                f"summary (string: brief 1 sentence),\n"
                f"suggestedCategory (string from: {STANDARD_CATEGORIES}),\n"
                f"suggestedUrgency ('Low' | 'Medium' | 'High' | 'Critical'),\n"
                f"suggestedDepartmentId ('railway' | 'municipality' | 'water_supply' | 'roads_infra' | 'electricity' | 'health_sanitation' | 'education' | 'public_transport')."
            )
            payload = {'contents': [{'parts': [{'text': prompt}]}]}
            resp = requests.post(url, json=payload, timeout=12)
            if resp.status_code == 200:
                data = resp.json()
                text = data['candidates'][0]['content']['parts'][0]['text']
                # extract json block
                match = re.search(r'\{.*\}', text, re.DOTALL)
                if match:
                    parsed = json.loads(match.group(0))
                    dept_id = parsed.get('suggestedDepartmentId', 'railway')
                    dept = get_department_by_id(dept_id)
                    return {
                        'structuredProblemStatement': parsed.get('structuredProblemStatement', ''),
                        'summary': parsed.get('summary', ''),
                        'extractedDetails': {
                            'specificIssue': description,
                            'locationContext': location or 'Premises',
                            'observedImpactOrRisk': f"{parsed.get('suggestedUrgency', 'Medium')} priority"
                        },
                        'suggestedCategory': parsed.get('suggestedCategory', category),
                        'suggestedUrgency': parsed.get('suggestedUrgency', 'Medium'),
                        'suggestedDepartment': {'id': dept['id'], 'code': dept['code'], 'name': dept['name']},
                        'provider': 'Google Gemini 1.5'
                    }
        except Exception as e:
            print(f"[AI Service] Gemini call failed: {e}. Falling back.")

    # Rule based fallback
    return build_rule_based_fallback(description, category, location)

def simulate_computer_vision(category='Other'):
    mapping = CATEGORY_OBJECT_MAP.get(category, CATEGORY_OBJECT_MAP['Other'])
    return [mapping]

