import { InputValues, PredictionResult } from '../types/index';

// This is a mock prediction function
// Replace this with actual API call to your AI model
export const predictCarbonFootprint = (inputs: InputValues): Promise<PredictionResult> => {
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      // Simple mock calculation
      const { 
        miles_driven_per_week, 
        meat_meals_per_week, 
        electricity_usage_kwh,
        flight_hours_per_year,
        monthly_online_orders 
      } = inputs;
      
      // Calculate a score based on inputs (this is just a mock formula)
      const score = (
        miles_driven_per_week * 0.3 + 
        meat_meals_per_week * 5 + 
        electricity_usage_kwh * 0.1 + 
        flight_hours_per_year * 10 + 
        monthly_online_orders * 2
      ).toFixed(1);
      
      const numScore = parseFloat(score);
      
      // Determine category based on score
      let category: 'low' | 'moderate' | 'high' | 'very-high';
      let recommendations: string[] = [];
      
      if (numScore < 100) {
        category = 'low';
        recommendations = [
          'Keep up your eco-friendly lifestyle!',
          'Consider installing solar panels to further reduce your electricity impact.'
        ];
      } else if (numScore < 200) {
        category = 'moderate';
        recommendations = [
          'Try carpooling or using public transport more often.',
          'Consider reducing meat consumption to 2-3 times per week.'
        ];
      } else if (numScore < 300) {
        category = 'high';
        recommendations = [
          'Significant carbon reduction possible by cutting flight hours.',
          'Try local shopping instead of online orders when possible.',
          'Consider switching to renewable energy sources.'
        ];
      } else {
        category = 'very-high';
        recommendations = [
          'Your carbon footprint is significantly above average.',
          'Consider an electric or hybrid vehicle to reduce driving emissions.',
          'Reduce meat consumption and try plant-based alternatives.',
          'Limit air travel and consider carbon offsets when flying is necessary.'
        ];
      }
      
      resolve({
        score: numScore,
        category,
        recommendations
      });
    }, 1500);
  });
};