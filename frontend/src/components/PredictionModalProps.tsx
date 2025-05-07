import React, { useState } from 'react';
import { FoodItem } from './FoodItemModal';

interface PredictionModalProps {
  showPredictionModal: boolean;
  setShowPredictionModal: (show: boolean) => void;
  inventory: FoodItem[];
  selectedPredictionItem: string;
  setSelectedPredictionItem: (itemTitle: string) => void;
  predictionResult: number | null;
  handlePrediction: (startDate: string, endDate: string) => void;
}

const formatCategory = (category: string) => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};

const PredictionModal: React.FC<PredictionModalProps> = ({
  showPredictionModal,
  setShowPredictionModal,
  inventory,
  selectedPredictionItem,
  setSelectedPredictionItem,
  predictionResult,
  handlePrediction,
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (!showPredictionModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Predict Quantity Requested</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Item</label>
            <select
              value={selectedPredictionItem}
              onChange={(e) => setSelectedPredictionItem(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select an item</option>
              {inventory.map((item) => (
                <option key={item._id} value={item.title}>
                  {item.title} ({formatCategory(item.category)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {selectedPredictionItem && (
            <>
              <div>
                <p className="text-sm font-medium text-gray-700">Prediction Response:</p>
                {predictionResult !== null ? (
                  <p className="text-gray-900">{predictionResult * 10} kg</p>
                ) : (
                  <p className="text-gray-500">Click "Predict" to see the response</p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowPredictionModal(false)}
            className="px-2 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              await handlePrediction(startDate, endDate);
              setStartDate('');
              setEndDate('');
            }}
            disabled={
              !selectedPredictionItem ||
              !startDate ||
              !endDate ||
              new Date(endDate) <= new Date(startDate)
            }
            className="px-2 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-300"
          >
            Predict
          </button>
        </div>
      </div>
    </div>
  );
};

export default PredictionModal;