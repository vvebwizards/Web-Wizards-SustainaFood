import React, { useState } from "react";
import axios from "axios";
import InputField from "./InputField";
import PredictionResultComponent from "./PredictionResult";
import { InputValues, PredictionResult } from "../../types/index";
import { LeafIcon, BarChart3 } from "lucide-react";
import { roleConfigs } from "../../utils/roleConfigs";
import { getUserId } from "../../utils/chatHelpers";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";

const CarbonFootprintCalculator: React.FC = () => {
  const { search } = useLocation();
  const { user } = useAuth();
  const currentUserId = getUserId(user);
  const params = new URLSearchParams(search);
  const initialPartner = params.get("user") || "";

  const userRole = user?.role || "donor";
  const theme =
    roleConfigs[userRole]?.theme.colors || roleConfigs.donor.theme.colors;
  const [inputs, setInputs] = useState<Record<string, string>>({
    miles_driven_per_week: "",
    meat_meals_per_week: "",
    electricity_usage_kwh: "",
    flight_hours_per_year: "",
    monthly_online_orders: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [apiError, setApiError] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs({
      ...inputs,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateInputs = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.entries(inputs).forEach(([key, value]) => {
      if (!value) {
        newErrors[key] = "This field is required";
        isValid = false;
      } else if (isNaN(Number(value)) || Number(value) < 0) {
        newErrors[key] = "Please enter a valid positive number";
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      const numericInputs = Object.entries(inputs).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: parseFloat(value),
        }),
        {}
      );

      const response = await axios.post(
        "http://127.0.0.1:5000/predict",
        numericInputs
      );

      const score = parseFloat(response.data.carbon_footprint.toFixed(2));
      let category: "low" | "moderate" | "high" | "very-high";

      if (score < 10000) category = "low";
      else if (score < 30000) category = "moderate";
      else if (score < 40000) category = "high";
      else category = "very-high";

      const recommendations = getRecommendations(category);

      setResult({
        score,
        category,
        recommendations,
      });
    } catch (error) {
      console.error("Prediction error:", error);
      setApiError(
        error.response?.data?.error ||
          "Failed to get prediction. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getRecommendations = (category: string): string[] => {
    switch (category) {
      case "low":
        return [
          "Keep up your eco-friendly lifestyle!",
          "Consider installing solar panels to further reduce your electricity impact.",
        ];
      case "moderate":
        return [
          "Try carpooling or using public transport more often.",
          "Consider reducing meat consumption to 2-3 times per week.",
        ];
      case "high":
        return [
          "Significant carbon reduction possible by cutting flight hours.",
          "Try local shopping instead of online orders when possible.",
          "Consider switching to renewable energy sources.",
        ];
      default:
        return [
          "Your carbon footprint is significantly above average.",
          "Consider an electric or hybrid vehicle to reduce driving emissions.",
          "Reduce meat consumption and try plant-based alternatives.",
          "Limit air travel and consider carbon offsets when flying is necessary.",
        ];
    }
  };

  const resetForm = () => {
    setResult(null);
    setInputs({
      miles_driven_per_week: "",
      meat_meals_per_week: "",
      electricity_usage_kwh: "",
      flight_hours_per_year: "",
      monthly_online_orders: "",
    });
    setErrors({});
    setApiError("");
  };

  const inputConfig = [
    {
      label: "Miles Driven Per Week",
      name: "miles_driven_per_week",
      placeholder: "e.g., 150",
    },
    {
      label: "Meat Meals Per Week",
      name: "meat_meals_per_week",
      placeholder: "e.g., 10",
    },
    {
      label: "Electricity Usage (kWh)",
      name: "electricity_usage_kwh",
      placeholder: "e.g., 500",
    },
    {
      label: "Flight Hours Per Year",
      name: "flight_hours_per_year",
      placeholder: "e.g., 24",
    },
    {
      label: "Monthly Online Orders",
      name: "monthly_online_orders",
      placeholder: "e.g., 5",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto p-6">
      {!result ? (
        <div className="animate-fadeIn">
          <div className="flex items-center mb-6">
            <LeafIcon className={`mr-2 ${theme.text}`} size={24} />
            <h1 className="text-2xl font-bold text-gray-800">
              Carbon Footprint Predictor
            </h1>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <p className="text-gray-600 mb-6">
              Enter your lifestyle details below to get an estimate of your
              carbon footprint.
            </p>

            <form onSubmit={handlePredict}>
              {inputConfig.map((config) => (
                <InputField
                  key={config.name}
                  label={config.label}
                  name={config.name}
                  value={inputs[config.name]}
                  onChange={handleInputChange}
                  placeholder={config.placeholder}
                  error={errors[config.name]}
                />
              ))}

              {apiError && (
                <div className="text-red-600 mb-4 p-3 bg-red-50 rounded-lg">
                  {apiError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full ${theme.button} hover:${theme.button} text-white font-bold py-3 px-4 rounded-lg mt-6 transition-colors duration-200 flex items-center justify-center`}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <BarChart3 size={18} className="mr-2" />
                    Predict Carbon Footprint
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>
              This prediction uses a simplified model to estimate your carbon
              footprint. For more accurate results, consider a detailed
              assessment.
            </p>
          </div>
        </div>
      ) : (
        <PredictionResultComponent result={result} onReset={resetForm} />
      )}
    </div>
  );
};

export default CarbonFootprintCalculator;
