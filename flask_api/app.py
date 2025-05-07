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
        models[model_name] = joblib.load(os.path.join(MODELS_DIR, model_file))

@app.route('/predict/<model_name>', methods=['POST'])
def predict(model_name):
    if model_name not in models:
        return jsonify({'error': 'Model not found'}), 404
    
    try:
        data = request.get_json()
        features = data.get('features', [])
        
        if len(features) != 2:
            return jsonify({'error': 'Expected exactly 2 features'}), 400
        
     
        input_data = np.array(features).reshape(1, -1)
        prediction = models[model_name].predict(input_data)[0]
        
        return jsonify({'prediction': float(prediction)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=3000)
