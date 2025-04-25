import axios from "axios";

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;


export const generateFoodWasteQuiz = async () => {
  const prompt = `Create a multiple-choice quiz with 1 question about food waste. Format it like:
Question: ...
Options: A) ..., B) ..., C) ..., D) ...
Answer: A`;

  const res = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data.choices[0].message.content;
};
