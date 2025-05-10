import React from "react";
import { PredictionResult } from "../../types/index";
import { Leaf, ArrowLeft } from "lucide-react";
interface PredictionResultProps {
  result: PredictionResult;
  onReset: () => void;
}

const PredictionResultComponent: React.FC<PredictionResultProps> = ({
  result,
  onReset,
}) => {
  const { score, category, recommendations } = result;

  // Define colors based on category
  const categoryColors = {
    low: "bg-green-500",
    moderate: "bg-yellow-500",
    high: "bg-orange-500",
    "very-high": "bg-red-500",
  };

  const categoryText = {
    low: "Low Impact",
    moderate: "Moderate Impact",
    high: "High Impact",
    "very-high": "Very High Impact",
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Your Carbon Footprint
        </h2>
        <button
          onClick={onReset}
          className="flex items-center text-green-700 hover:text-green-900 transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          Try again
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-500 text-sm">Carbon Score</p>
            <h3 className="text-4xl font-bold">{score}</h3>
          </div>
          <div className={`rounded-full ${categoryColors[category]} p-3`}>
            <Leaf size={24} className="text-white" />
          </div>
        </div>

        <div className="w-full h-4 bg-gray-200 rounded-full mb-4">
          <div
            className={`h-4 rounded-full ${categoryColors[category]} transition-all duration-1000 ease-out`}
            style={{ width: `${Math.min(100, (score / 60000) * 100)}%` }}
          ></div>
        </div>

        <p className="mb-4 font-medium text-lg">
          Your carbon footprint is{" "}
          <span className="font-bold">{categoryText[category]}</span>
        </p>

        <div className="mt-6">
          <h4 className="font-semibold text-gray-800 mb-2">Recommendations</h4>
          <ul className="space-y-2">
            {recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-800 mr-2 mt-0.5">
                  {index + 1}
                </span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PredictionResultComponent;
