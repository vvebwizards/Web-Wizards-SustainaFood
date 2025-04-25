import axios from "axios";

export const fetchQuiz = async () => {
  const response = await axios.post("http://localhost:5000/api/quiz", {});
  return response.data; // will be an array of { question, options, answer }
};
