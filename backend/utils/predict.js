import axios  from 'axios';


export async function getPrediction(features) {
  try {
    const response = await axios.post('http://localhost:3000/predict/demand_prediction', {
      features: features
    });
    
    return response.data.prediction;  
  } catch (error) {
    console.error("Error calling Flask API:", error);
    throw new Error('Prediction failed');
  }
}   