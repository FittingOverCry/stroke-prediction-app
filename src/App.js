import React, { useState } from "react";
import "./App.css";

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [formData, setFormData] = useState({
    gender: "Male",
    age: "",
    hypertension: "0",
    heart_disease: "0",
    ever_married: "No",
    work_type: "Private",
    Residence_type: "Urban",
    avg_glucose_level: "",
    bmi: "",
    smoking_status: "never smoked",
  });

  const [result, setResult] = useState(null);
  const [advice, setAdvice] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Prevent negative values for age, avg_glucose_level, and bmi
    if (
      ["age", "avg_glucose_level", "bmi"].includes(name) &&
      value !== "" &&
      Number(value) < 0
    ) {
      return;
    }


    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Clear previous error when user changes input
    if (error) {
    setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setResult(null);
    setAdvice([]);

    const age = Number(formData.age);
    const glucose = Number(formData.avg_glucose_level);
    const bmi = Number(formData.bmi);

    if (
      formData.age === "" || 
      formData.avg_glucose_level === "" || 
      formData.bmi === ""
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (age < 0 || age > 120) {
      setError("Age must be between 0 and 120.");
      return;
    }

    if (glucose < 0 || glucose > 1000) {
      setError("Average glucose level must be between 0 and 1000.");
     return;
    }

    if (bmi < 0 || bmi > 100) {
      setError("BMI must be between 0 and 100.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://stroke-prediction-api-0nr9.onrender.com/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      console.log("Response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Prediction failed");
      }

      // Get the prediction
      setResult(data.stroke);

      // Get the advice
      setAdvice(data.advice || []);

      // Show the results section
      setShowResults(true);

    } catch (err) {
      console.error("Prediction error:", err);

      if (err.message === "Failed to fetch") {
        setError(
          "Unable to connect to the server. Make sure the backend is running and accessible."
        );
      } else { 
        setError(err.message || "Something went wrong. Please try again.");
      }

    } finally {
      setLoading(false);
    }
  };
  const handleReset = () => {
    setResult(null);
    setAdvice([]);
    setError("");
    setShowResults(false);
  };
if (showIntro) {
  return (
    <div className="intro-screen">

      <div className="intro-glow intro-glow-one"></div>
      <div className="intro-glow intro-glow-two"></div>

      <div className="intro-grid"></div>

      <div className="floating-orb orb-one"></div>
      <div className="floating-orb orb-two"></div>
      <div className="floating-orb orb-three"></div>

      <main className="intro-content">

        <div className="intro-badge">
          ✦ Machine Learning Project
        </div>

        <h1>
          Stroke
          <span>Sense</span>
        </h1>

        <p className="intro-description">
          An AI-powered system that estimates stroke risk
          using selected health and lifestyle factors.
        </p>

        <button
          className="start-button"
          onClick={() => setShowIntro(false)}
        >
          Start Assessment
          <span>→</span>
        </button>

        <p className="intro-disclaimer">
          This tool provides a model-generated estimate for
          educational purposes and is not a medical diagnosis.
        </p>

      </main>

      <div className="intro-visual">

        <div className="pulse-ring ring-one"></div>
        <div className="pulse-ring ring-two"></div>
        <div className="pulse-ring ring-three"></div>

        <div className="heart-icon">
          ♡
        </div>

      </div>

    </div>
  );
}
if (loading) {
  return (
    <div className="loading-screen">

      <div className="loading-glow loading-glow-one"></div>
      <div className="loading-glow loading-glow-two"></div>

      <div className="loading-grid"></div>

      <div className="loader-container">

        <div className="loader-rings">
          <div className="loader-ring loader-ring-one"></div>
          <div className="loader-ring loader-ring-two"></div>
          <div className="loader-ring loader-ring-three"></div>

          <div className="loader-core">
            ♡
          </div>
        </div>

        <h1>Analyzing</h1>

        <p>
          Processing your information through the
          machine learning model...
        </p>

        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <small>
          Please wait
        </small>

      </div>

    </div>
  );
}
if (showResults) {
  return (
    <div className="results-screen">

      <div className="results-glow results-glow-one"></div>
      <div className="results-glow results-glow-two"></div>

      <div className="results-grid"></div>

      <main className="results-content">

        <div className="results-badge">
          ✦ Analysis Complete
        </div>

        <h1>Your Prediction</h1>

        <p className="results-subtitle">
          The model has processed the information you provided.
        </p>

        <div
          className="risk-circle"
          style={{
            "--risk-deg": `${result * 3.6}deg`
          }}
        >
          <div className="risk-circle-inner">
            <span>{result}%</span>
            <small>model estimate</small>
          </div>
        </div>

        <h2>Estimated Stroke Risk</h2>

        <p className="results-note">
          This is a model-generated estimate for educational
          purposes and is not a medical diagnosis.
        </p>

        <div className="advice-card">
          {advice.length > 0 ? (
            <ul>
              {advice.map((item, index) => (
                <li key={index}>{item.advice}</li>
              ))}
            </ul>
          ) : (
            <p>No specific recommendations available.</p>
          )}
        </div>

        <button
          type="button"
          className="back-button"
          onClick={handleReset}
        >
          ← Make Another Prediction
        </button>

      </main>
    </div>
  );
}
  return (
    <div className="app">

      <h1>Stroke Prediction</h1>

      <form onSubmit={handleSubmit}>

        <label>Gender</label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <label>Age</label>
        <input
          type="number"
          name="age"
          value={formData.age}
          onChange={handleChange}
          min="0"
          max="120"
          step="1"
          required
        />

        <label>Hypertension</label>
        <select
          name="hypertension"
          value={formData.hypertension}
          onChange={handleChange}
        >
          <option value="0">No</option>
          <option value="1">Yes</option>
        </select>

        <label>Heart Disease</label>
        <select
          name="heart_disease"
          value={formData.heart_disease}
          onChange={handleChange}
        >
          <option value="0">No</option>
          <option value="1">Yes</option>
        </select>

        <label>Ever Married</label>
        <select
          name="ever_married"
          value={formData.ever_married}
          onChange={handleChange}
        >
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>

        <label>Work Type</label>
        <select
          name="work_type"
          value={formData.work_type}
          onChange={handleChange}
        >
          <option value="Private">Private</option>
          <option value="Self-employed">Self-employed</option>
          <option value="Govt_job">Government Job</option>
          <option value="children">Children</option>
          <option value="Never_worked">Never Worked</option>
        </select>

        <label>Residence Type</label>
        <select
          name="Residence_type"
          value={formData.Residence_type}
          onChange={handleChange}
        >
          <option value="Urban">Urban</option>
          <option value="Rural">Rural</option>
        </select>

        <label>Average Glucose Level</label>
        <input
          type="number"
          step="0.01"
          name="avg_glucose_level"
          value={formData.avg_glucose_level}
          onChange={handleChange}
          min="0"
          max="1000"
          required
        />

        <label>BMI</label>
        <input
          type="number"
          step="0.1"
          name="bmi"
          value={formData.bmi}
          onChange={handleChange}
          min="0"
          max="50"
          required
        />

        <label>Smoking Status</label>
        <select
          name="smoking_status"
          value={formData.smoking_status}
          onChange={handleChange}
        >
          <option value="never smoked">Never Smoked</option>
          <option value="formerly smoked">Formerly Smoked</option>
          <option value="smokes">Smokes</option>
          <option value="Unknown">Unknown</option>
        </select>

        {error && (
        <div className="error-message">
          {error}
        </div>
      )}

        <button type="submit" disabled={loading}>
         Predict Stroke Risk
        </button>

      </form>
    </div>
  );
}

export default App;
