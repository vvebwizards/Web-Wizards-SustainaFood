from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
from flask_cors import CORS
import numpy as np
import joblib

model = load_model("carbon_footprint_model.h5")
scaler = joblib.load("scaler.pkl")

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])  # <- Allow all origins (you can restrict it if needed)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    try:
        features = np.array([[  # Shape (1, 5)
            data['miles_driven_per_week'],
            data['meat_meals_per_week'],
            data['electricity_usage_kwh'],
            data['flight_hours_per_year'],
            data['monthly_online_orders']
        ]])
        features_scaled = scaler.transform(features)
        prediction = model.predict(features_scaled)[0][0]
        return jsonify({'carbon_footprint': float(prediction)})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
