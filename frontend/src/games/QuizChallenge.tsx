// src/pages/QuizChallenge.tsx
import React, { useEffect, useState } from "react";
import { fetchQuiz } from "./quizService"; // 1️⃣
import axios from "axios";                      // ← add
import { useAuth } from "../context/AuthContext"; // ← a
interface QuizItem {
  question: string;
  options: string[];
  answer: string;
}

const QUESTIONS_PER_LEVEL = 3;

const QuizChallenge: React.FC = () => {
  // 2️⃣ State
  const [quiz, setQuiz] = useState<QuizItem[]>([]);
  const [level, setLevel] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const { user, setUser } = useAuth();

  // 3️⃣ Load initial level quiz
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchQuiz();
        setQuiz(data);
      } catch (err) {
        console.error("Failed to fetch quiz:", err);
      }
    })();
  }, []);

  // 4️⃣ Handle selecting an option
  const handleSelect = (opt: string) => {
    setSelected(opt);
  };

  // 5️⃣ Advance within the current level (only 3 questions)
  const handleNext = () => {
    const question = quiz[currentIndex];

    // compare letter (e.g. "C") to selected text ("C. 33%…")
    if (selected?.trim().startsWith(question.answer)) {
      setScore((prev) => prev + 1);
    }

    const nextIndex = currentIndex + 1;

    // 🔑 Always use QUESTIONS_PER_LEVEL, not level * …
    if (nextIndex < QUESTIONS_PER_LEVEL) {
      setCurrentIndex(nextIndex);
      setSelected(null);
    } else {
      setShowResult(true);
    }
  };

  // 6️⃣ When finishing a level: retry or fetch new quiz
  const handleNextLevel = async () => {
    const passed = score >= 2;
  
    if (passed) {
      // ─── 30-Point Bonus ───────────────────────────────
      try {
        const resPts = await axios.put(
          `http://localhost:5000/api/users/${user!._id}/add-points`,
          { points: 30 },
          { withCredentials: true }
        );
        // update context + localStorage
        const updatedUser = { ...user!, points: resPts.data.newPoints };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } catch (err) {
        console.error("❌ Error awarding level bonus:", err);
      }
  
      // ─── Fetch new quiz for next level ─────────────────
      const nextLevel = level + 1;
      try {
        const newQuiz = await fetchQuiz();
        console.log(`🎯 Level ${nextLevel} questions:`, newQuiz);
  
        setQuiz(newQuiz);
        setLevel(nextLevel);
        setCurrentIndex(0);
        setScore(0);
        setShowResult(false);
        setSelected(null);
      } catch (err) {
        console.error("❌ Failed to fetch next level quiz:", err);
      }
    } else {
      // ─── Retry same level ─────────────────────────────
      setCurrentIndex(0);
      setScore(0);
      setShowResult(false);
      setSelected(null);
    }
  };
  

  // 7️⃣ Render
  if (!quiz.length) return <p className="p-4">Loading quiz…</p>;

  if (showResult) {
    const passed = score >= 2;
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Level {level} Completed</h2>
        <p className="text-lg mb-4">Score: {score} / {QUESTIONS_PER_LEVEL}</p>
        {passed ? (
          <>
            <p className="text-green-600 mb-4">✅ You passed!</p>
            <button
              onClick={handleNextLevel}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Next Level
            </button>
          </>
        ) : (
          <>
            <p className="text-red-600 mb-4">❌ You need at least 2 correct.</p>
            <button
              onClick={handleNextLevel}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Retry Level
            </button>
          </>
        )}
      </div>
    );
  }

  // Current question
  const q = quiz[currentIndex];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Level {level}</h2>
      <p className="text-gray-600 mb-2">
        Question {currentIndex + 1} of {QUESTIONS_PER_LEVEL}
      </p>

      <h3 className="text-lg font-medium mb-4">{q.question}</h3>

      <ul className="space-y-2">
        {q.options.map((opt, i) => (
          <li
            key={i}
            className={`border p-3 rounded cursor-pointer ${
              selected === opt ? "bg-blue-200" : "hover:bg-gray-100"
            }`}
            onClick={() => handleSelect(opt)}
          >
            {opt}
          </li>
        ))}
      </ul>

      <button
        onClick={handleNext}
        disabled={!selected}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {currentIndex === QUESTIONS_PER_LEVEL - 1 ? "Finish Level" : "Next"}
      </button>
    </div>
  );
};

export default QuizChallenge;
