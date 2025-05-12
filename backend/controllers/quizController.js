// controllers/quizController.js
import axios from 'axios';

export const generateQuiz = async (req, res) => {
  try {
    const prompt = `
      Create a food waste awareness quiz with 3 multiple-choice questions.
      Each question should have 4 options (A-D) and only one correct answer.
      Respond in JSON format like:
      [
        {
          "question": "...",
          "options": ["A", "B", "C", "D"],
          "answer": "B"
        },
        ...
      ]
    `;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0].message.content;
    const quiz = JSON.parse(content);
    res.json(quiz);
  } catch (error) {
    console.error("🔥 OpenAI Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch quiz" });
  }
};
