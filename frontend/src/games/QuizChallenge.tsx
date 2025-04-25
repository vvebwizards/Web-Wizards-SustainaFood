import React, { useEffect, useState } from "react";
import { fetchQuiz } from "./quizService";

interface QuizItem {
  question: string;
  options: string[];
  answer: string;
}

const QuizChallenge: React.FC = () => {
  const [quiz, setQuiz] = useState<QuizItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const data = await fetchQuiz();
        setQuiz(data);
      } catch (err) {
        console.error("Failed to fetch quiz", err);
      }
    };

    loadQuiz();
  }, []);

  const handleSelect = (option: string) => {
    setSelected(option);
  };

  const handleNext = () => {
    if (selected === quiz[current].answer) {
      setScore((prev) => prev + 1);
    }

    if (current + 1 < quiz.length) {
      setCurrent((prev) => prev + 1);
      setSelected(null);
    } else {
      setShowResult(true);
    }
  };

  if (!quiz.length) return <p className="p-4">Loading quiz...</p>;

  if (showResult) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
        <p className="text-lg">Your Score: {score} / {quiz.length}</p>
      </div>
    );
  }

  const q = quiz[current];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">{q.question}</h2>
      <ul className="space-y-2">
        {q.options.map((opt, index) => (
          <li
            key={index}
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
        {current === quiz.length - 1 ? "Finish" : "Next"}
      </button>
    </div>
  );
};

export default QuizChallenge;
