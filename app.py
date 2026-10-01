from flask import Flask, request, jsonify
import pandas as pd
from joblib import load
from flask_cors import CORS
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'stroke_prediction_model.joblib')

model = load(MODEL_PATH)

app = Flask(__name__)
CORS(app)

ADVICE = {
    "age": (
        "Prioritize regular health check-ups and monitoring of blood pressure, "
        "blood sugar, cholesterol, and other cardiovascular risk factors."
    ),

    "hypertension": (
        "Monitor your blood pressure regularly and discuss blood-pressure "
        "management with a healthcare professional. Taking prescribed medication "
        "consistently and following medical advice can help reduce stroke risk."
    ),

    "heart_disease": (
        "Continue appropriate medical follow-up for your heart condition and "
        "discuss your stroke risk with your healthcare professional. Follow "
        "prescribed treatment and monitor relevant cardiovascular risk factors."
    ),

    "work_type": (
        "Consider your activity level, work-related stress, sleep, and opportunities "
        "for healthy meals and physical activity. Build healthy habits around your "
        "work schedule where possible."
    ),

    "glucose": (
        "Discuss elevated blood-glucose levels with a healthcare professional. "
        "Follow recommended monitoring and management, and maintain a balanced "
        "eating pattern and regular physical activity."
    ),

    "bmi": (
        "If your weight is a health concern, discuss a sustainable approach with "
        "a healthcare professional. Regular physical activity and a balanced "
        "eating pattern can support cardiovascular health."
    ),

    "smoking": (
        "Stopping smoking can reduce cardiovascular and stroke risk. Consider "
        "speaking with a healthcare professional about evidence-based "
        "smoking-cessation support."
    )
}
def get_advice(data):
    advice = []

    # Hypertension
    if int(data.get("hypertension", 0)) == 1:
        advice.append({
            "factor": "Hypertension",
            "advice": ADVICE["hypertension"]
        })

    # Heart disease
    if int(data.get("heart_disease", 0)) == 1:
        advice.append({
            "factor": "Heart Disease",
            "advice": ADVICE["heart_disease"]
        })

    # Smoking
    smoking = str(data.get("smoking_status", "")).lower()

    if smoking in ["smokes", "formerly smoked"]:
        advice.append({
            "factor": "Smoking Status",
            "advice": ADVICE["smoking"]
        })

    # Glucose
    glucose = float(data.get("avg_glucose_level", 0))

    if glucose > 100:
        advice.append({
            "factor": "Glucose Level",
            "advice": ADVICE["glucose"]
        })

    # BMI
    bmi = float(data.get("bmi", 0))

    if bmi >= 25:
        advice.append({
            "factor": "BMI",
            "advice": ADVICE["bmi"]
        })

    # Age
    age = float(data.get("age", 0))

    if age >= 40:
        advice.append({
            "factor": "Age",
            "advice": ADVICE["age"]
        })

    return advice
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json

        try: 
            age = float(data["age"])
            glucose = float(data["avg_glucose_level"])
            bmi = float(data["bmi"])
        except (KeyError, TypeError, ValueError):
            return jsonify({
                "error": "Invalid or missing numeric input data."
                }), 400 

        # Validate ranges
        if age < 0 or age > 120:
            return jsonify({
                "error": "Age must be between 0 and 120."
                }), 400

        if glucose < 0 or glucose > 1000:
            return jsonify({
                "error": "Average glucose level must be between 0 and 1000."
                }), 400

        if bmi < 0 or bmi > 100:
            return jsonify({
                "error": "BMI must be between 0 and 100."
                }), 400

        df = pd.DataFrame([data])

        prediction = model.predict_proba(df)[0][1]
        risk_percentage = prediction * 100

        advice = get_advice(data)  

        print(f"Model-estimated risk percentage: {risk_percentage:.2f}%")

        return jsonify({"stroke": round(risk_percentage, 2), 
        "advice": advice}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/')
def home():
    return "Welcome to the Stroke Prediction API"

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=False
    )
