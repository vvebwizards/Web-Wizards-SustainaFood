from flask import Flask, request, jsonify
import joblib
import os
import numpy as np

app = Flask(__name__)

MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')
models = {}

for model_file in os.listdir(MODELS_DIR):
    if model_file.endswith('.pkl'):
        model_name = model_file.replace('_model.pkl', '')  
        model_path = os.path.join(MODELS_DIR, model_file)
        models[model_name] = joblib.load(model_path)

@app.route('/predict/<model_name>', methods=['POST'])
def predict(model_name):
    if model_name not in models:
        return jsonify({'error': f'Model \"{model_name}\" not found'}), 404

    try:
        data = request.get_json()
        features = data.get('features')

        if not features or not isinstance(features, list):
            return jsonify({'error': 'Request must include a list of features'}), 400

        input_data = np.array(features).reshape(1, -1)
        model = models[model_name]
        prediction = model.predict(input_data)[0]

        return jsonify({'prediction': int(prediction)})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=3000)
