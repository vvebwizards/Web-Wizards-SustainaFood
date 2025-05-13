import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { quizData, QuizItem } from "./quizService";

const QUESTIONS_PER_LEVEL = 3;
const LEVEL_BONUS = 10; // bonus points per passed level

export default function QuizChallenge() {
  const { user, setUser } = useAuth();
  const [level, setLevel] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [points, setPoints] = useState(0); // total points accumulator
  const [showResult, setShowResult] = useState(false);

  // questions for current level
  const levelQuiz: QuizItem[] = quizData[level - 1];
  const progress = ((currentIndex) / QUESTIONS_PER_LEVEL) * 100;

  const handleSelect = (opt: string) => {
    if (!showResult) setSelected(opt);
  };

  const handleNext = () => {
    const q = levelQuiz[currentIndex];
    if (selected?.startsWith(q.answer)) {
      setScore(s => s + 1);
    }
    if (currentIndex + 1 < QUESTIONS_PER_LEVEL) {
      setCurrentIndex(i => i + 1);
      setSelected(null);
    } else {
      setShowResult(true);
    }
  };

  const handleNextLevel = async () => {
    const passed = score >= 2;
    if (passed) {
      const earned = LEVEL_BONUS + score;
      setPoints(prev => prev + earned);
      // send earned points to backend
      const userId = user?._id || user?.id; // Correct user ID handling
      if (userId && earned > 0) {
        try {
          const res = await axios.put(
            `http://foodreduce-backend.azurewebsites.net/api/users/${userId}/add-points`,
            { points: earned },
            { withCredentials: true }
          );
          // update Auth context
          const updatedUser = { ...user, points: res.data.newPoints };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        } catch (err) {
          console.error("❌ Error awarding level points", err);
        }
      }
    }
    // advance or retry
    if (passed && level < quizData.length) {
      setLevel(l => l + 1);
    }
    setCurrentIndex(0);
    setScore(0);
    setSelected(null);
    setShowResult(false);
  };

  // Result screen
  if (showResult) {
    const passed = score >= 2;
    return (
      <div className="p-8 max-w-lg mx-auto bg-gray-50 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Level {level} Complete</h2>
        <p className="text-lg mb-2">
          You scored <span className="font-mono">{score}</span> / {QUESTIONS_PER_LEVEL}
        </p>
        <p className="text-md mb-4">
          Total Points: <span className="font-mono">{points}</span>
        </p>
        {passed ? (
          level < quizData.length ? (
            <button
              onClick={handleNextLevel}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              Next Level →
            </button>
          ) : (
            <p className="text-green-600 text-xl font-semibold">
              🎉 You've completed all levels with {points} points! 🎉
            </p>
          )
        ) : (
          <button
            onClick={handleNextLevel}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Retry Level 🔄
          </button>
        )}
      </div>
    );
  }

  // Question screen
  const q = levelQuiz[currentIndex];
  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Level {level}</h3>
        <div className="w-1/2 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-2 bg-blue-500"
            style={{ width: `${progress + (100 / QUESTIONS_PER_LEVEL)}%` }}
          />
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-lg font-medium mb-4">{q.question}</h4>
        <ul className="grid grid-cols-1 gap-3">
          {q.options.map(opt => (
            <li
              key={opt}
              onClick={() => handleSelect(opt)}
              className={`p-3 border rounded-lg cursor-pointer transition
                ${selected === opt ? "border-blue-500 bg-blue-50" : "hover:bg-gray-100"}`}
            >
              {opt}
            </li>
          ))}
        </ul>
        <button
          onClick={handleNext}
          disabled={!selected}
          className="mt-6 w-full py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 transition hover:bg-blue-600"
        >
          {currentIndex + 1 === QUESTIONS_PER_LEVEL ? "Finish Level" : "Next Question"}
        </button>
      </div>
    </div>
  );
}
