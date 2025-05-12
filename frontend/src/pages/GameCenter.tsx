import React from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import wheelAnimation from "../animations/prize-wheel.json"; 
import quizzAnimation from "../animations/quizz.json"; 
import memory from "../animations/memory.json"; 
import TicTacToe from "../animations/TicTacToe.json"; 

const games = [
  {
    title: "🎡 Prize Wheel",
    description: "Spin the Wheel for Redeemable Points!",
    route: "/dashboard/prize-wheel",
    bg: "bg-green-100",
    lottie: wheelAnimation,
  },
  {
    title: "🧠 Quiz Challenge",
    description: "Test your food waste knowledge.",
    route: "/dashboard/quiz-challenge",
    bg: "bg-yellow-100",
    lottie: quizzAnimation,
  },
  {
    title: "🧠 Memory Match",
    description: "Flip cards to match pairs of food items before time runs out!",
    route: "/dashboard/memory",
    bg: "bg-blue-100",
    lottie: memory,
  },
  {
    title: "🎮 Tic-Tac-Toe",
    description: "Play Tic-Tac-Toe against AI or your friends! Choose your symbol and difficulty.",
    route: "/dashboard/tictactoe",
    bg: "bg-red-100",
    lottie: TicTacToe,
  }
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
            className={`rounded-xl shadow-md p-6 ${game.bg} hover:shadow-lg transition transform hover:scale-105`}
          >
            {game.lottie && (
              <Lottie animationData={game.lottie} loop={true} className="h-32 mb-4 mx-auto" />
            )}
            <h3 className="text-xl font-bold text-center text-green-700">{game.title}</h3>
            <p className="text-sm text-gray-700 text-center mb-4">{game.description}</p>
            <button
              onClick={() => navigate(game.route)}
              className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
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
