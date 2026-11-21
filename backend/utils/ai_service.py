import os
import re
import requests
import logging
from backend.config import Config

logger = logging.getLogger(__name__)

DISCLAIMER = "\n\n⚠️ *This assistant provides general health information and does not replace professional medical advice, diagnosis, or treatment. If you are experiencing a medical emergency, please contact your local emergency services immediately.*"

EMERGENCY_KEYWORDS = [
    "chest pain", "heart attack", "can't breathe", "cannot breathe", "difficulty breathing",
    "shortness of breath", "severe bleeding", "unconscious", "stroke", "paralysis",
    "slurred speech", "sudden numbness", "anaphylaxis", "suicide", "suicidal",
    "overdose", "poison", "coughing blood", "blue lips"
]

def check_emergency(user_message: str):
    msg = user_message.lower()
    for kw in EMERGENCY_KEYWORDS:
        if kw in msg:
            return True
    return False

def get_emergency_response():
    return (
        "🚨 **CRITICAL HEALTH ALERT**:\n"
        "The symptoms you described may require **immediate medical emergency attention**.\n\n"
        "Please take the following actions right away:\n"
        "- Call your local emergency medical service (such as 911, 112, 108, or your regional equivalent).\n"
        "- Go to the nearest hospital Emergency Room immediately.\n"
        "- Do not attempt to drive yourself if you are feeling faint, dizzy, or short of breath.\n"
        "- If you are with someone, alert them to your condition right now."
        + DISCLAIMER
    )

def rule_based_health_assistant(message: str) -> dict:
    """Intelligent clinical education fallback rules when AI API key is not configured or unavailable."""
    msg = message.lower()

    if check_emergency(msg):
        return {
            "reply": get_emergency_response(),
            "provider": "rule_based_emergency_guard",
            "is_fallback": True
        }

    # Cardiology
    if any(k in msg for k in ["heart", "cardio", "blood pressure", "hypertension", "palpitation", "cholesterol"]):
        reply = (
            "❤️ **Cardiovascular Wellness & Guidance**:\n\n"
            "- **Blood Pressure**: Normal adult blood pressure is typically below 120/80 mmHg. Persistent readings above 130/80 may indicate hypertension.\n"
            "- **Heart Healthy Habits**: Balanced diet rich in leafy greens, reduced sodium intake (<2,000mg/day), 150 minutes of moderate aerobic exercise weekly, and avoiding tobacco.\n"
            "- **Recommended Department**: **Cardiology**\n"
            "- **Consultation Prep**: Note your resting pulse, any family history of heart disease, and bring a list of your current medications.\n"
            "\n💡 *Notice: Running in rule-based clinical education mode.*"
        )
    # Dermatology
    elif any(k in msg for k in ["skin", "derma", "acne", "rash", "eczema", "itch", "mole", "sunscreen"]):
        reply = (
            "🧴 **Dermatological Care & Education**:\n\n"
            "- **Skin Health**: Daily gentle cleansing, broad-spectrum SPF 30+ sunscreen, and frequent moisturization help protect the skin barrier.\n"
            "- **Rashes & Lesions**: Avoid scratching or self-medicating with over-the-counter steroid creams without diagnosis.\n"
            "- **Recommended Department**: **Dermatology**\n"
            "- **Consultation Prep**: Note when the skin issue began, note any changes in cosmetics or detergents, and take clear photos if lesions change over time.\n"
            "\n💡 *Notice: Running in rule-based clinical education mode.*"
        )
    # Pediatrics
    elif any(k in msg for k in ["child", "pediatric", "baby", "infant", "toddler", "vaccine", "vaccination"]):
        reply = (
            "👶 **Pediatric & Child Health Guidance**:\n\n"
            "- **Routine Milestones**: Regular developmental assessments and maintaining a timely immunization schedule are vital for infant and child wellness.\n"
            "- **Hydration & Fever in Children**: Ensure frequent fluids and monitor temperature using an accurate digital thermometer.\n"
            "- **Recommended Department**: **Pediatrics**\n"
            "- **Consultation Prep**: Bring your child's immunization record booklet, growth chart, and a log of feeding and sleep patterns.\n"
            "\n💡 *Notice: Running in rule-based clinical education mode.*"
        )
    # Orthopedics
    elif any(k in msg for k in ["bone", "joint", "back pain", "knee", "spine", "ortho", "sprain", "fracture", "posture"]):
        reply = (
            "🦴 **Orthopedics & Musculoskeletal Health**:\n\n"
            "- **Joint & Back Care**: Maintain ergonomic posture, perform core-strengthening exercises, and avoid prolonged static sitting.\n"
            "- **Acute Injury (R.I.C.E.)**: For mild sprains, initial home management often includes Rest, Ice, Compression, and Elevation for the first 24-48 hours.\n"
            "- **Recommended Department**: **Orthopedics**\n"
            "- **Consultation Prep**: Note the exact location of the pain, what activities aggravate or relieve it, and whether you experience stiffness in the mornings.\n"
            "\n💡 *Notice: Running in rule-based clinical education mode.*"
        )
    # Neurology
    elif any(k in msg for k in ["headache", "migraine", "dizziness", "nerve", "neurology", "memory", "sleep", "insomnia"]):
        reply = (
            "🧠 **Neurological & Brain Health Education**:\n\n"
            "- **Headaches & Migraines**: Common triggers include dehydration, sleep deprivation, stress, eye strain, and certain foods.\n"
            "- **Sleep Hygiene**: Maintain a consistent sleep schedule (7-9 hours), minimize screen time 1 hour before bed, and keep the bedroom cool.\n"
            "- **Recommended Department**: **Neurology**\n"
            "- **Warning**: A sudden, 'thunderclap' severe headache or headache accompanied by stiff neck, high fever, or confusion requires immediate emergency attention.\n"
            "\n💡 *Notice: Running in rule-based clinical education mode.*"
        )
    # General Medicine / Fever / Cold
    elif any(k in msg for k in ["fever", "cold", "flu", "cough", "sore throat", "fatigue", "general"]):
        reply = (
            "🩺 **General Medicine Guidance**:\n\n"
            "- **Hydration & Rest**: Viral upper respiratory symptoms typically improve with adequate fluids, electrolyte balance, and ample bed rest.\n"
            "- **Monitoring**: If a fever exceeds 103°F (39.4°C), lasts more than 3 consecutive days, or is accompanied by difficulty swallowing or breathing, schedule a physician evaluation.\n"
            "- **Recommended Department**: **General Medicine**\n"
            "- **Consultation Prep**: Keep a log of temperature readings, onset date of symptoms, and list any remedies taken so far.\n"
            "\n💡 *Notice: Running in rule-based clinical education mode.*"
        )
    # Doctor / Appointment booking assistance
    elif any(k in msg for k in ["doctor", "appointment", "book", "specialist", "schedule", "department"]):
        reply = (
            "📅 **Doctor Consultation Assistance**:\n\n"
            "- You can browse our **Find Doctors** directory to filter verified specialists by department (Cardiology, Dermatology, General Medicine, Orthopedics, Pediatrics, Neurology).\n"
            "- Once you select a doctor, choose your preferred available time slot and state the reason for consultation.\n"
            "- Prepare 2-3 specific questions for your doctor to maximize your consultation efficiency."
            "\n💡 *Notice: Running in rule-based clinical education mode.*"
        )
    else:
        reply = (
            "👋 **Hello! I am your Smart Healthcare Assistant.**\n\n"
            "I can help you with:\n"
            "1. **Understanding Medical Departments**: Cardiology, Dermatology, General Medicine, Orthopedics, Pediatrics, Neurology.\n"
            "2. **Preparing for Consultations**: Tips on what to ask your physician during your appointment.\n"
            "3. **General Wellness & Preventive Care**: Diet, hydration, lifestyle, and exercise guidance.\n"
            "4. **Navigating the System**: How to book appointments, review medical records, or view digital prescriptions.\n\n"
            "What health topic or department would you like to explore today?\n"
            "\n💡 *Notice: Operating in clinical education mode. AI API key can be configured in backend environment.*"
        )

    return {
        "reply": reply + DISCLAIMER,
        "provider": "rule_based_fallback",
        "is_fallback": True
    }

def generate_ai_response(user_message: str) -> dict:
    """Generate response using configured AI provider with seamless fallback."""
    if not user_message or not user_message.strip():
        return {
            "reply": "Please enter a message or health question." + DISCLAIMER,
            "provider": "validator",
            "is_fallback": True
        }

    # Emergency check takes highest precedence
    if check_emergency(user_message):
        return {
            "reply": get_emergency_response(),
            "provider": "emergency_filter",
            "is_fallback": True
        }

    api_key = Config.AI_API_KEY
    provider = Config.AI_PROVIDER.lower()

    if api_key and provider == "gemini":
        try:
            # Query Gemini API via REST endpoint
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            system_prompt = (
                "You are an empathetic, highly knowledgeable medical education assistant for a Healthcare Management System. "
                "CRITICAL MEDICAL RULES:\n"
                "1. Provide clear, educational health information.\n"
                "2. DO NOT provide definitive diagnoses or prescribe medications.\n"
                "3. If symptoms sound urgent, advise immediate emergency care.\n"
                "4. Recommend relevant medical departments (Cardiology, Dermatology, General Medicine, Orthopedics, Pediatrics, Neurology).\n"
                "5. Provide actionable questions patients can ask their doctor."
            )
            payload = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [
                            {"text": f"{system_prompt}\n\nPatient Query: {user_message}"}
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.4,
                    "maxOutputTokens": 600
                }
            }
            res = requests.post(url, json=payload, timeout=8)
            if res.status_code == 200:
                data = res.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return {
                    "reply": text + DISCLAIMER,
                    "provider": "gemini",
                    "is_fallback": False
                }
            else:
                logger.warning("Gemini API error: %s - falling back to rule-based engine", res.text)
        except Exception as e:
            logger.warning("AI provider call failed: %s - using rule-based fallback", str(e))

    # Fallback to rich rule-based assistant
    return rule_based_health_assistant(user_message)
