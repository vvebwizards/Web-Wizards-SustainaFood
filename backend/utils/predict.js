import axios  from 'axios';


export async function getPredictionSupplyDemand(features) {
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
export async function getPredictionUrgencyTransportation(features) {
  try {
    const response = await axios.post('http://localhost:3000/predict/urgencey_transportation', {
      features: features
    });
    
    return response.data.prediction;  
  } catch (error) {
    console.error("Error calling Flask API:", error);
    throw new Error('Prediction failed');
  }
}  

export async function getOptimizedRouteClusters(features) {
  try {
    const response = await axios.post('http://localhost:3000/predict/route_optimization', {
      features: features
    });
    return response.data.prediction;  
  } catch (error) {
    console.error("Error calling Flask API:", error);
    throw new Error('Prediction failed');
  }
}