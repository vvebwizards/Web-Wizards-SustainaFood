import axios from 'axios';

const FLASK_API_URL = 'http://localhost:3000/predict/demand_prediction';

const QUANTITY_DONATED_MEAN = 500;  // kg
const QUANTITY_DONATED_STD = 275;   // kg
const QUANTITY_REQUESTED_MEAN = 300; // kg
const QUANTITY_REQUESTED_STD = 150;  // kg

function toZScore(value, mean, std) {
    return (value - mean) / std;
}

function fromZScore(zScore, mean, std) {
    return zScore * std + mean;
}

// Predict Quantity Requested
export async function predictQuantityRequested(quantity, foodWasteRate) {
    try {
        // Validate inputs: ensure quantity and foodWasteRate are numbers
        if (typeof quantity !== 'number' || quantity < 0) {
            throw new Error('Quantity must be a non-negative number');
        }
        if (typeof foodWasteRate !== 'number' || foodWasteRate < 0 || foodWasteRate > 1) {
            throw new Error('Food waste rate must be a number between 0 and 1');
        }

        // Always use 'kg' for the unit
        const unit = 'kg';

        // Convert quantity to z-score
        const quantityZScore = toZScore(quantity, QUANTITY_DONATED_MEAN, QUANTITY_DONATED_STD);
        
        // Combine quantity and food waste rate into the features
        const features = [quantityZScore, foodWasteRate];

        // Prepare input for the Flask API
        const data = {
            features: features
        };

        // Call the Flask API
        console.log('Sending request to Flask API:', FLASK_API_URL, data);
        const response = await axios.post(FLASK_API_URL, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Received response from Flask API:', response.status, response.data);
        
        // Get the prediction (in z-score units)
        const predictedQuantityZScore = response.data.prediction;

        // Convert prediction back to original units (kg)
        const predictedQuantityKg = fromZScore(predictedQuantityZScore, QUANTITY_REQUESTED_MEAN, QUANTITY_REQUESTED_STD);

        return {
            predictedQuantityZScore,
            predictedQuantityKg: Math.max(predictedQuantityKg, 0) // Ensure non-negative value
        };
    } catch (error) {
        console.error('Error predicting Quantity Requested:', error.response ? error.response.data : error.message);
        throw error;
    }
}
