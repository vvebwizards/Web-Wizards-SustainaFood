import React, { useEffect, useState } from "react";
import { fetchQuiz } from "./quizService";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Lottie from "lottie-react";
import loadingAnimation from "../animations/thinking.json";
import { CheckCircle, XCircle } from "lucide-react";

interface QuizItem {
  question: string;
  options: string[];
  answer: string;
}

const QUESTIONS_PER_LEVEL = 3;

const QuizChallenge: React.FC = () => {
  const [quiz, setQuiz] = useState<QuizItem[]>([]);
  const [level, setLevel] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, setUser } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchQuiz();
        setQuiz(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch quiz:", err);
        setLoading(false);
      }
    })();
  }, []);

  const handleSelect = (opt: string) => {
    setSelected(opt);
  };

  const handleNext = () => {
    const question = quiz[currentIndex];
    if (selected?.trim().startsWith(question.answer)) {
      setScore((prev) => prev + 1);
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex < QUESTIONS_PER_LEVEL) {
      setCurrentIndex(nextIndex);
      setSelected(null);
    } else {
      setShowResult(true);
    }
  };

  const handleNextLevel = async () => {
    const passed = score >= 2;
    if (passed) {
      try {
        const resPts = await axios.put(
          `http://localhost:5000/api/users/${user!._id}/add-points`,
          { points: 30 },
          { withCredentials: true }
        );
        const updatedUser = { ...user!, points: resPts.data.newPoints };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } catch (err) {
        console.error("❌ Error awarding level bonus:", err);
      }

      try {
        setLoading(true);
        const newQuiz = await fetchQuiz();
        setQuiz(newQuiz);
        setLevel((prev) => prev + 1);
        setCurrentIndex(0);
        setScore(0);
        setShowResult(false);
        setSelected(null);
        setLoading(false);
      } catch (err) {
        console.error("❌ Failed to fetch next level quiz:", err);
        setLoading(false);
      }
    } else {
      setCurrentIndex(0);
      setScore(0);
      setShowResult(false);
      setSelected(null);
    }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center min-h-[300px]">
        <Lottie animationData={loadingAnimation} loop={true} style={{ height: 360 }} />
    </div>
    );
  }

  if (showResult) {
    const passed = score >= 2;
    return (
      <div className="p-8 max-w-xl mx-auto text-center bg-white rounded-lg shadow-lg mt-10">
        {passed ? (
          <CheckCircle className="text-green-500 w-12 h-12 mx-auto mb-2" />
        ) : (
          <XCircle className="text-red-500 w-12 h-12 mx-auto mb-2" />
        )}
        <h2 className="text-3xl font-bold mb-4">Level {level} Completed</h2>
        <p className="text-lg mb-4">Score: {score} / {QUESTIONS_PER_LEVEL}</p>
        <p className={`mb-6 ${passed ? "text-green-600" : "text-red-600"}`}>
          {passed ? "✅ You passed!" : "❌ You need at least 2 correct."}
        </p>
        <button
          onClick={handleNextLevel}
          className={`px-5 py-2 rounded text-white font-semibold ${passed ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {passed ? "Next Level" : "Retry Level"}
        </button>
      </div>
    );
  }

  const q = quiz[currentIndex];

  return (
    <div className="max-w-3xl mx-auto p-6 mt-10 bg-gradient-to-br from-white via-blue-50 to-blue-100 rounded-xl shadow-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-blue-800">Level {level}</h2>
        <div className="mt-2 w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full"
            style={{ width: `${((currentIndex + 1) / QUESTIONS_PER_LEVEL) * 100}%` }}
          ></div>
        </div>
        <p className="text-gray-600 mt-1 text-sm">
          Question {currentIndex + 1} of {QUESTIONS_PER_LEVEL}
        </p>
      </div>

      <h3 className="text-xl font-medium mb-6">{q.question}</h3>

      <ul className="grid gap-4">
        {q.options.map((opt, i) => (
          <li
            key={i}
            className={`p-4 border rounded-lg text-left shadow-sm transition-all cursor-pointer ${
              selected === opt
                ? "bg-blue-100 border-blue-400 scale-[1.02]"
                : "hover:bg-gray-100"
            }`}
            onClick={() => handleSelect(opt)}
          >
            {opt}
          </li>
        ))}
      </ul>

      <div className="text-center mt-6">
        <button
          onClick={handleNext}
          disabled={!selected}
          className="bg-blue-600 text-white px-6 py-2 mt-4 rounded-md font-semibold disabled:opacity-50"
        >
          {currentIndex === QUESTIONS_PER_LEVEL - 1 ? "Finish Level" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default QuizChallenge;
