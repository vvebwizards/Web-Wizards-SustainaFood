import React, { useEffect, useState } from "react";
import { generateFoodWasteQuiz } from "./quizService";

const QuizChallenge = () => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState("");

  const fetchQuiz = async () => {
    const quizText = await generateFoodWasteQuiz();

    const questionMatch = quizText.match(/Question:\s*(.*)/);
    const optionsMatch = quizText.match(/Options:\s*(.*)/);
    const answerMatch = quizText.match(/Answer:\s*([A-D])/);

    if (questionMatch && optionsMatch && answerMatch) {
      setQuestion(questionMatch[1]);
      setOptions(optionsMatch[1].split(/,\s*/)); // A) ..., B) ...
      setCorrectAnswer(answerMatch[1]);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, []);

  const handleAnswer = (letter: string) => {
    setSelected(letter);
    setResult(letter === correctAnswer ? "✅ Correct!" : "❌ Wrong answer");
  };

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Quiz Challenge: Food Waste</h2>
      <p className="mb-3">{question}</p>
      <ul>
        {options.map((opt) => {
          const letter = opt.trim().charAt(0);
          return (
            <li key={letter}>
              <button
                className={`my-1 p-2 border rounded w-full text-left ${
                  selected === letter
                    ? letter === correctAnswer
                      ? "bg-green-100 border-green-400"
                      : "bg-red-100 border-red-400"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => handleAnswer(letter)}
                disabled={!!selected}
              >
                {opt}
              </button>
            </li>
          );
        })}
      </ul>
      {selected && <p className="mt-3 font-semibold">{result}</p>}
    </div>
  );
};

export default QuizChallenge;
