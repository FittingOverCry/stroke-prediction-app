from flask import Flask, request, jsonify
import pandas as pd
from joblib import load
from flask_cors import CORS
import os
import json


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    'stroke_prediction_model.joblib'
)

METRICS_PATH = os.path.join(
    BASE_DIR,
    'model_metrics.json'
)


# ============================================================
# LOAD MODEL
# ============================================================

model = load(
    MODEL_PATH
)


# ============================================================
# LOAD MODEL METRICS
# ============================================================

try:

    with open(
        METRICS_PATH,
        'r'
    ) as file:

        MODEL_METRICS = json.load(file)

except Exception:

    MODEL_METRICS = {
        "model":
            "Linear Discriminant Analysis + SMOTE",

        "dataset_size":
            5110,

        "roc_auc":
            None,

        "roc_auc_std":
            None,

        "brier_score":
            None,

        "evaluation":
            "Cross-validation"
    }


# ============================================================
# FLASK
# ============================================================

app = Flask(__name__)

CORS(app)


# ============================================================
# ADVICE
# ============================================================

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


    if data["smoking_status"] in [
        "smokes",
        "formerly smoked"
    ]:

        advice_points.append(
            "Avoid or reduce smoking."
        )


    if float(
        data["avg_glucose_level"]
    ) > 100:

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


# ============================================================
# MODEL PERFORMANCE
# ============================================================

@app.route(
    '/model-performance',
    methods=['GET']
)
def model_performance():

    return jsonify(
        MODEL_METRICS
    ), 200


# ============================================================
# PREDICTION
# ============================================================

@app.route(
    '/predict',
    methods=['POST']
)
def predict():

    try:

        data = request.json


        # ----------------------------------------------------
        # CHECK INPUT
        # ----------------------------------------------------

        if not data:

            return jsonify({

                "error":
                    "No input data received."

            }), 400


        # ----------------------------------------------------
        # REQUIRED FEATURES
        # ----------------------------------------------------

        required_features = [

            'gender',

            'age',

            'hypertension',

            'heart_disease',

            'work_type',

            'Residence_type',

            'avg_glucose_level',

            'bmi',

            'smoking_status'
        ]


        missing_features = [

            feature

            for feature in required_features

            if feature not in data
        ]


        if missing_features:

            return jsonify({

                "error":
                    "Missing required fields.",

                "missing":
                    missing_features

            }), 400


        # ----------------------------------------------------
        # NUMERIC VALIDATION
        # ----------------------------------------------------

        try:

            age = float(
                data["age"]
            )

            glucose = float(
                data["avg_glucose_level"]
            )

            bmi = float(
                data["bmi"]
            )

        except (
            KeyError,
            TypeError,
            ValueError
        ):

            return jsonify({

                "error":
                    "Invalid or missing numeric input data."

            }), 400


        # ----------------------------------------------------
        # RANGE VALIDATION
        # ----------------------------------------------------

        if age < 0 or age > 120:

            return jsonify({

                "error":
                    "Age must be between 0 and 120."

            }), 400


        if glucose < 0 or glucose > 1000:

            return jsonify({

                "error":
                    "Average glucose level must be between 0 and 1000."

            }), 400


        if bmi < 0 or bmi > 50:

            return jsonify({

                "error":
                    "BMI must be between 0 and 50."

            }), 400


        # ----------------------------------------------------
        # CONVERT NUMERIC VALUES
        # ----------------------------------------------------

        data["age"] = age

        data["avg_glucose_level"] = glucose

        data["bmi"] = bmi


        # ----------------------------------------------------
        # ONLY MODEL FEATURES
        # ----------------------------------------------------

        model_data = {

            'gender':
                data['gender'],

            'age':
                data['age'],

            'hypertension':
                int(data['hypertension']),

            'heart_disease':
                int(data['heart_disease']),

            'work_type':
                data['work_type'],

            'Residence_type':
                data['Residence_type'],

            'avg_glucose_level':
                data['avg_glucose_level'],

            'bmi':
                data['bmi'],

            'smoking_status':
                data['smoking_status']
        }


        # ----------------------------------------------------
        # DATAFRAME
        # ----------------------------------------------------

        df = pd.DataFrame(
            [model_data]
        )


        # ----------------------------------------------------
        # PREDICTION
        # ----------------------------------------------------

        prediction = (
            model
            .predict_proba(df)[0][1]
        )

        risk_percentage = (
            prediction * 100
        )


        print(
            f"Model-estimated risk percentage: "
            f"{risk_percentage:.2f}%"
        )


        # ----------------------------------------------------
        # ADVICE
        # ----------------------------------------------------

        advice = get_advice(
            data
        )


        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return jsonify({

            "stroke":
                round(
                    risk_percentage,
                    2
                ),

            "advice":
                advice

        }), 200

except Exception:
    return jsonify({
        "error": "An error occurred while generating the prediction."
    }), 500


# ============================================================
# HOME
# ============================================================

@app.route('/')
def home():

    return (
        "Welcome to the Stroke Prediction API"
    )


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":

    app.run(

        host="0.0.0.0",

        port=int(
            os.environ.get(
                "PORT",
                5000
            )
        ),

        debug=False
    )
