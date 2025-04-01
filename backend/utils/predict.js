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


function estimateFoodWasteRate(category, expirationDate) {

    const expDate = new Date(expirationDate);
    const now = new Date();
    const daysUntilExpiration = (expDate - now) / (1000 * 60 * 60 * 24); // Days difference

   
    const wasteRates = {
        'Fruits': 0.3,    // Perishable
        'Vegetables': 0.3,
        'Dairy': 0.4,
        'Meat': 0.5,
        'Grains': 0.1,    // Less perishable
        'Canned Goods': 0.05
    };

    let baseWasteRate = wasteRates[category] || 0.2; // Default to 0.2 if category not found

    // Adjust waste rate based on expiration date
    if (daysUntilExpiration <= 3) {
        baseWasteRate += 0.3; // High waste if expiring soon
    } else if (daysUntilExpiration <= 7) {
        baseWasteRate += 0.1; // Moderate increase
    }

    // Ensure waste rate is between 0 and 1
    return Math.min(Math.max(baseWasteRate, 0), 1) * 10; // Multiply by 10 to match training data scale (before correction in Flask)
}

// Predict Quantity Requested
export async function predictQuantityRequested(quantity, unit, category, expirationDate) {
    try {
        // Validate inputs
        if (typeof quantity !== 'number' || quantity < 0) {
            throw new Error('Quantity must be a non-negative number');
        }
        if (unit !== 'kg') { // Assuming the model was trained on kg; adjust if different
            throw new Error('Unit must be kg (model trained on kg)');
        }

        // Convert quantity to z-score
        const quantityZScore = toZScore(quantity, QUANTITY_DONATED_MEAN, QUANTITY_DONATED_STD);

        // Estimate Food Waste Rate
        const foodWasteRate = estimateFoodWasteRate(category, expirationDate);

        // Prepare input for the Flask API
        const data = {
            features: [quantityZScore, foodWasteRate]
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
            predictedQuantityKg: Math.max(predictedQuantityKg, 0) // Ensure non-negative
        };
    } catch (error) {
        console.error('Error predicting Quantity Requested:', error.response ? error.response.data : error.message);
        throw error;
    }
}
