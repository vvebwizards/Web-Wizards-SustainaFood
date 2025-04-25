import React from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import wheelAnimation from "../animations/prize-wheel.json"; 
const games = [
    {
        title: "🎡 Prize Wheel",
        description: "Spin the Wheel for Redeemable Points!",
        route: "/dashboard/prize-wheel",
        bg: "bg-green-100",
        lottie: wheelAnimation
      },
      
  {
    title: "🧠 Quiz Challenge",
    description: "Test your food waste knowledge.",
    route: "/dashboard/quiz-challenge",
    bg: "bg-yellow-100"
  },
  {
    title: "🚛 Delivery Dash",
    description: "Match donations to recipients fast!",
    route: "/dashboard/delivery-dash",
    bg: "bg-blue-100"
  },
];

const GameCenter = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-green-700">🎮 Game Center</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {games.map((game, index) => (
  <div
    key={index}
    className={`rounded-xl shadow-md p-5 ${game.bg} hover:shadow-lg transition`}
  >
    {game.lottie && (
      <Lottie animationData={game.lottie} loop={true} className="h-32 mb-2" />
    )}
    <h3 className="text-xl font-bold mb-2">{game.title}</h3>
    <p className="text-sm text-gray-700 mb-4">{game.description}</p>
    <button
      onClick={() => navigate(game.route)}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    >
      Play
    </button>
  </div>
))}

      </div>
    </div>
  );
};

export default GameCenter;
