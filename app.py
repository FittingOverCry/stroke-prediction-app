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

def get_advice(data):
    advice_points = []

    if int(data["hypertension"]) == 1:
        advice_points.append(
            "Monitor blood pressure regularly."
        )

    if int(data["heart_disease"]) == 1:
        advice_points.append(
            "Follow recommended heart-care guidance."
        )

    if data["smoking_status"] in ["smokes", "formerly smoked"]:
        advice_points.append(
            "Avoid or reduce smoking."
        )

    if float(data["avg_glucose_level"]) > 100:
        advice_points.append(
            "Monitor blood glucose levels."
        )

    if float(data["bmi"]) >= 25:
        advice_points.append(
            "Maintain a healthy weight."
        )

    if float(data["age"]) >= 40:
        advice_points.append(
            "Have regular health check-ups."
        )

    return advice_points

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json

        if not data:
            return jsonify({
                "error": "No input data received."
            }), 400

        # Validate numeric fields
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

        # Convert numeric values before sending to model
        data["age"] = age
        data["avg_glucose_level"] = glucose
        data["bmi"] = bmi

        # Create dataframe
        df = pd.DataFrame([data])

        # Make prediction
        prediction = model.predict_proba(df)[0][1]
        risk_percentage = prediction * 100

        print(
            f"Model-estimated risk percentage: "
            f"{risk_percentage:.2f}%"
        )

        # Generate combined advice
        advice = get_advice(data)

        return jsonify({
            "stroke": round(risk_percentage, 2),
            "advice": advice
        }), 200

    except Exception as e:
        print("Prediction error:", e)

        return jsonify({
            "error": "An error occurred while generating the prediction."
        }), 500
    
@app.route('/')
def home():
    return "Welcome to the Stroke Prediction API"

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=False
    )
