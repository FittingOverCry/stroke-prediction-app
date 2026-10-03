import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [showAboutModel, setShowAboutModel] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [formData, setFormData] = useState({
    gender: "Male",
    age: "",
    hypertension: "0",
    heart_disease: "0",
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

  const [performance, setPerformance] = useState(null);
  const [performanceLoading, setPerformanceLoading] = useState(true);
  const [performanceError, setPerformanceError] = useState("");

  /* =========================================
     MODEL PERFORMANCE
  ========================================= */

  useEffect(() => {
    if (!showAboutModel) return;

    const fetchModelPerformance = async () => {
      try {
        setPerformanceLoading(true);
        setPerformanceError("");

        const response = await fetch(
          "https://stroke-prediction-api-0nr9.onrender.com/model-performance"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load model performance."
          );
        }

        setPerformance(data);

      } catch (err) {
        console.error("Performance error:", err);

        setPerformanceError(
          "Unable to load model performance information."
        );

      } finally {
        setPerformanceLoading(false);
      }
    };

    fetchModelPerformance();
  }, [showAboutModel]);

  /* =========================================
     HANDLE INPUT CHANGES
  ========================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Prevent negative values
    if (
      ["age", "avg_glucose_level", "bmi"].includes(name) &&
      value !== "" &&
      Number(value) < 0
    ) {
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user changes input
    if (error) {
      setError("");
    }
  };

  /* =========================================
     SUBMIT PREDICTION
  ========================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setResult(null);
    setAdvice([]);

    const age = Number(formData.age);
    const glucose = Number(formData.avg_glucose_level);
    const bmi = Number(formData.bmi);

    /* Required fields */

    if (
      formData.age === "" ||
      formData.avg_glucose_level === "" ||
      formData.bmi === ""
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    /* Age validation */

    if (age < 0 || age > 120) {
      setError("Age must be between 0 and 120.");
      return;
    }

    /* Glucose validation */

    if (glucose < 0 || glucose > 1000) {
      setError(
        "Average glucose level must be between 0 and 1000."
      );
      return;
    }

    /* BMI validation */

    if (bmi < 0 || bmi > 50) {
      setError("BMI must be between 0 and 50.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://stroke-prediction-api-0nr9.onrender.com/predict",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(formData),
        }
      );

      const responseText = await response.text();

      console.log("Status:", response.status);
      console.log("Raw Response:", responseText);

      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (err) {
        console.error("Failed to parse JSON:", err);
        throw new Error(`Server returned non-JSON response: ${responseText}`);
      }
      if (!response.ok) {
        throw new Error(
          data.error || "Prediction failed"
        );
      }

      /* Get prediction */

      setResult(data.stroke);

      /* Get advice */

      setAdvice(data.advice || []);

      /* Show results */

      setShowResults(true);

    } catch (err) {
      console.error("Prediction error:", err);

      if (err.message === "Failed to fetch") {
        setError(
          "Unable to connect to the server. Make sure the backend is running and accessible."
        );
      } else {
        setError(
          err.message ||
          "Something went wrong. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     RESET / ANOTHER PREDICTION
  ========================================= */

  const handleReset = () => {
    setResult(null);
    setAdvice([]);
    setError("");
    setShowResults(false);
  };

  /* =========================================
     INTRO SCREEN
  ========================================= */

  if (showIntro && !showAboutModel && !showResults) {
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
            onClick={() => {
              setFormData({
                gender: "",
                age: "",
                hypertension: "0",
                heart_disease: "0",
                work_type: "Private",
                Residence_type: "Urban",
                avg_glucose_level: "",
                bmi: "",
                smoking_status: "never smoked",
              });

              setError("");
              setShowIntro(false);
            }}
          >
            Start Assessment
            <span className="button-arrow">→</span>
          </button>

          <button
            className="about-model-button"
            onClick={() => setShowAboutModel(true)}
          >
            About the Model
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

  /* =========================================
     ABOUT MODEL SCREEN
  ========================================= */

  if (showAboutModel) {
    return (
      <div className="about-model-screen">

        <div className="intro-grid"></div>

        <div className="about-model-content">

          <button
            className="about-back-button"
            onClick={() => setShowAboutModel(false)}
          >
            <span className="back-arrow">←</span>
            <span>Back</span>
          </button>

          <div className="intro-badge">
            ✦ About StrokeSense
          </div>

          <h1>
            About the <span>Model</span>
          </h1>

          <p className="about-model-description">
            StrokeSense uses a machine-learning model to estimate
            stroke risk from selected health and lifestyle factors.
          </p>

          {/* HOW IT WORKS */}

          <section className="about-section">

            <h2>How it works</h2>

            <p>
              The system uses Linear Discriminant Analysis (LDA)
              with SMOTE to process the information entered in
              the assessment and generate a model-based risk estimate.
            </p>

          </section>

          {/* MODEL PERFORMANCE */}

          <section className="about-section">

            <h2>Model Performance</h2>

            {performanceLoading ? (

              <div className="performance-loading">
                Loading model performance...
              </div>

            ) : performanceError ? (

              <div className="performance-error">
                {performanceError}
              </div>

            ) : performance ? (

              <>
                <div className="performance-model">

                  <span>Model</span>

                  <strong>
                    {performance.model}
                  </strong>

                </div>

                <div className="performance-grid">

                  <div className="performance-card">

                    <span className="performance-label">
                      ROC-AUC
                    </span>

                    <strong>
                      {performance.roc_auc.toFixed(3)}
                    </strong>

                    <small>
                      Cross-validation
                    </small>

                  </div>

                  <div className="performance-card">

                    <span className="performance-label">
                      Brier Score
                    </span>

                    <strong>
                      {performance.brier_score.toFixed(3)}
                    </strong>

                    <small>
                      Probability calibration
                    </small>

                  </div>

                  <div className="performance-card">

                    <span className="performance-label">
                      CV Variation
                    </span>

                    <strong>
                      ±{performance.roc_auc_std.toFixed(3)}
                    </strong>

                    <small>
                      ROC-AUC standard deviation
                    </small>

                  </div>

                  <div className="performance-card">

                    <span className="performance-label">
                      Dataset
                    </span>

                    <strong>
                      {performance.dataset_size.toLocaleString()}
                    </strong>

                    <small>
                      Records
                    </small>

                  </div>

                </div>
              </>

            ) : null}

          </section>

          {/* METRIC EXPLANATION */}

          <section className="about-section">

            <h2>
              What do these metrics mean?
            </h2>

            <div className="metric-explanation">

              <div>

                <strong>
                  ROC-AUC
                </strong>

                <p>
                  Measures how well the model distinguishes
                  between the two outcome classes across
                  different thresholds.
                </p>

              </div>

              <div>

                <strong>
                  Brier Score
                </strong>

                <p>
                  Measures the accuracy of predicted probabilities.
                  Lower values indicate smaller probability errors.
                </p>

              </div>

            </div>

          </section>

          {/* WARNING */}

          <div className="about-warning">

            <strong>
              Important
            </strong>

            <p>
              These metrics describe model performance during
              validation. They do not represent diagnostic accuracy
              for an individual person.
            </p>

          </div>

          <button
            className="about-back-button bottom"
            onClick={() => setShowAboutModel(false)}
          >
            <span className="back-arrow">←</span>
            Back to StrokeSense
          </button>

        </div>

      </div>
    );
  }

  /* =========================================
     LOADING SCREEN
  ========================================= */

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

          <h1>
            Analyzing
          </h1>

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

  /* =========================================
     RESULTS SCREEN
  ========================================= */

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

          <h1>
            Your Prediction
          </h1>

          <p className="results-subtitle">
            The model has processed the information you provided.
          </p>

          {/* RISK CIRCLE */}

          <div
            className="risk-circle"
            style={{
              "--risk-deg": `${result * 3.6}deg`
            }}
          >

            <div className="risk-circle-inner">

              <span>
                {result}%
              </span>

              <small>
                model estimate
              </small>

            </div>

          </div>

          <h2>
            Estimated Stroke Risk
          </h2>

          <p className="results-note">
            This is a model-generated estimate for educational
            purposes and is not a medical diagnosis.
          </p>

          {/* PATIENT PROFILE */}

          <div className="patient-profile">

            <div className="section-heading">

              <span className="section-icon">
                👤
              </span>

              <div>

                <h2>
                  Patient Profile
                </h2>

                <p>
                  Information used for this prediction
                </p>

              </div>

            </div>

            <div className="profile-grid">
              <div className="profile-item">
                <span>Age</span>
                <strong>{formData.age} Years</strong>
              </div>

              <div className="profile-item">
                <span>Gender</span>
                <strong>{formData.gender}</strong>
              </div>

              <div className="profile-item">
                <span>Hypertension</span>
                <strong>
                  {formData.hypertension === "1"
                    ? "Yes"
                    : "No"}
                </strong>
              </div>

              <div className="profile-item">
                <span>Heart Disease</span>
                <strong>
                  {formData.heart_disease === "1"
                    ? "Yes"
                    : "No"}
                </strong>
              </div>

              <div className="profile-item">
                <span>Work Type</span>
                <strong>
                  {formData.work_type === "Private"
                    ? "Private"
                    : formData.work_type === "Self-employed"
                    ? "Self-Employed"
                    : formData.work_type === "Govt_job"
                    ? "Government Job"
                    : formData.work_type === "children"
                    ? "Children"
                    : formData.work_type === "Never_worked"
                    ? "Never Worked"
                    : formData.work_type}
                </strong>
              </div>


              <div className="profile-item">
                <span>Residence Type</span>
                <strong>{formData.Residence_type}</strong>
              </div>

              <div className="profile-item">
                <span>Average Glucose Level</span>
                <strong>{formData.avg_glucose_level} mg/dL</strong>
              </div>

              <div className="profile-item">
                <span>BMI</span>
                <strong>{formData.bmi}</strong>
              </div>

              {/* SMOKING */}

              <div className="profile-item">
                <span>
                  Smoking Status
                </span>

                <strong>
                  {formData.smoking_status
                    .split(" ")
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1)
                    )
                    .join(" ")}
                </strong>
              </div>
            </div>
          </div>

          {/* ADVICE */}

          <div className="advice-card">

            {advice.length > 0 ? (

              <ul>

                {advice.map((item, index) => (

                  <li key={index}>
                    {item}
                  </li>

                ))}

              </ul>

            ) : (

              <p>
                No specific recommendations available.
              </p>

            )}

          </div>

          {/* RESET */}

          <button
            type="button"
            className="back-button"
            onClick={handleReset}
          >
            <span className="back-arrow">
              ←
            </span>
            Make Another Prediction
          </button>

        </main>

      </div>
    );
  }

  /* =========================================
     ASSESSMENT FORM
  ========================================= */

  return (
    <div className="app">

      {/* BACK TO INTRO */}

      <button
        type="button"
        className="form-back-button"
        onClick={() => {
          setError("");
          setShowIntro(true);
        }}
      >
        <span className="back-arrow">
          ←
        </span>

        <span>
          Back
        </span>

      </button>

      <h1>
        Stroke Prediction
      </h1>

      <form onSubmit={handleSubmit}>

        {/* GENDER */}

        <label>
          Gender
        </label>

        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
        >
          <option value="Male">
            Male
          </option>

          <option value="Female">
            Female
          </option>

          <option value="Other">
            Other
          </option>

        </select>


        {/* AGE */}

        <label>
          Age
        </label>

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


        {/* HYPERTENSION */}

        <label>
          Hypertension
        </label>

        <select
          name="hypertension"
          value={formData.hypertension}
          onChange={handleChange}
        >
          <option value="0">
            No
          </option>

          <option value="1">
            Yes
          </option>

        </select>


        {/* HEART DISEASE */}

        <label>
          Heart Disease
        </label>

        <select
          name="heart_disease"
          value={formData.heart_disease}
          onChange={handleChange}
        >
          <option value="0">
            No
          </option>

          <option value="1">
            Yes
          </option>

        </select>


        {/* WORK TYPE */}

        <label>
          Work Type
        </label>

        <select
          name="work_type"
          value={formData.work_type}
          onChange={handleChange}
        >
          <option value="Private">
            Private
          </option>

          <option value="Self-employed">
            Self-Employed
          </option>

          <option value="Govt_job">
            Government Job
          </option>

          <option value="children">
            Children
          </option>

          <option value="Never_worked">
            Never Worked
          </option>

        </select>


        {/* RESIDENCE TYPE */}

        <label>
          Residence Type
        </label>

        <select
          name="Residence_type"
          value={formData.Residence_type}
          onChange={handleChange}
        >
          <option value="Urban">
            Urban
          </option>

          <option value="Rural">
            Rural
          </option>

        </select>


        {/* GLUCOSE */}

        <label>
          Average Glucose Level
        </label>

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


        {/* BMI */}

        <label>
          BMI
        </label>

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


        {/* SMOKING STATUS */}

        <label>
          Smoking Status
        </label>

        <select
          name="smoking_status"
          value={formData.smoking_status}
          onChange={handleChange}
        >
          <option value="never smoked">
            Never Smoked
          </option>

          <option value="formerly smoked">
            Formerly Smoked
          </option>

          <option value="smokes">
            Smokes
          </option>

          <option value="Unknown">
            Unknown
          </option>

        </select>


        {/* ERROR */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        {/* SUBMIT */}

        <button
          type="submit"
          disabled={loading}
        >
          Predict Stroke Risk
        </button>

      </form>

    </div>
  );
}

export default App;
