import React, { useState } from "react";
import "./TicTacToe.css";  // Custom CSS file
import { useAuth } from "../context/AuthContext";
import axios from "axios";

// Difficulty Options
type Difficulty = "easy" | "medium" | "hard";

const TicTacToe: React.FC = () => {
  const { user, setUser } = useAuth();  // For user points
  const [board, setBoard] = useState<string[]>(Array(9).fill("")); // 3x3 board
  const [isXTurn, setIsXTurn] = useState<boolean>(true); // X starts first
  const [winner, setWinner] = useState<string | null>(null); // Track the winner
  const [points, setPoints] = useState<number>(user?.points || 0); // Track points
  const [difficulty, setDifficulty] = useState<Difficulty>("easy"); // Set difficulty level
  const [playerSymbol, setPlayerSymbol] = useState<string>("X"); // Player's symbol (X or O)
  const [gameStarted, setGameStarted] = useState<boolean>(false); // Track if the game is started

  // AI Move Logic
  const getAIMove = (board: string[]): number => {
    if (difficulty === "easy") return getRandomMove(board);
    if (difficulty === "medium") return getMediumMove(board);
    return getBestMove(board);
  };

  const getRandomMove = (board: string[]): number => {
    const emptyCells = board
      .map((value, index) => (value === "" ? index : -1))
      .filter(index => index !== -1);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  };

  const getMediumMove = (board: string[]): number => {
    const emptyCells = board
      .map((value, index) => (value === "" ? index : -1))
      .filter(index => index !== -1);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  };

  const getBestMove = (board: string[]): number => {
    const scores: Record<number, number> = {};

    const minimax = (newBoard: string[], depth: number, isMaximizing: boolean): number => {
      const winner = checkWinner(newBoard);
      if (winner === "X") return -1;
      if (winner === "O") return 1;
      if (newBoard.every(cell => cell !== "")) return 0;

      let bestScore = isMaximizing ? -Infinity : Infinity;

      for (let i = 0; i < newBoard.length; i++) {
        if (newBoard[i] === "") {
          newBoard[i] = isMaximizing ? "O" : "X";
          const score = minimax(newBoard, depth + 1, !isMaximizing);
          newBoard[i] = "";
          bestScore = isMaximizing
            ? Math.max(score, bestScore)
            : Math.min(score, bestScore);
        }
      }
      return bestScore;
    };

    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") {
        board[i] = "O";
        const score = minimax([...board], 0, false);
        board[i] = "";
        scores[i] = score;
      }
    }

    const bestMove = Object.keys(scores).reduce((bestIndex, current) =>
      scores[bestIndex] > scores[current] ? bestIndex : current
    );

    return parseInt(bestMove);
  };

  const checkWinner = (board: string[]): string | null => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let line of lines) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const handleClick = (index: number) => {
    if (board[index] || winner) return;
    const newBoard = [...board];
    newBoard[index] = playerSymbol; // Player's move is based on selected symbol
    setBoard(newBoard);
    setIsXTurn(false);

    const currentWinner = checkWinner(newBoard);
    if (currentWinner) {
      setWinner(currentWinner);
      handlePoints(currentWinner);
    } else {
      setTimeout(() => handleAIMove(newBoard), 500);
    }
  };

  const handleAIMove = (newBoard: string[]) => {
    const aiMove = getAIMove(newBoard);
    newBoard[aiMove] = playerSymbol === "X" ? "O" : "X"; // AI's move is the opposite symbol
    setBoard(newBoard);
    setIsXTurn(true);

    const currentWinner = checkWinner(newBoard);
    if (currentWinner) {
      setWinner(currentWinner);
      handlePoints(currentWinner);
    }
  };

  const handlePoints = async (winner: string) => {
    let awardedPoints = 0;
    if (winner === "X") {
      if (difficulty === "easy") awardedPoints = 10;
      if (difficulty === "medium") awardedPoints = 20;
      if (difficulty === "hard") awardedPoints = 30;
    }

    const newPoints = points + awardedPoints;
    setPoints(newPoints);

    const userId = user._id || user.id;
    if (!userId) {
      console.error("User ID is missing!");
      return;
    }

    try {
      const res = await axios.put(
        `http://foodreduce-backend.azurewebsites.net/api/users/${userId}/add-points`,
        { points: awardedPoints },
        { withCredentials: true }
      );
      const updatedUser = {
        ...user,
        points: res.data.newPoints,
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error("Error updating points:", err);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(""));
    setIsXTurn(true);
    setWinner(null);
  };

  // Display the selection screen if game has not started
  if (!gameStarted) {
    return (
      <div className="difficulty-container">
        <h2>Select Difficulty and Symbol</h2>

        <div className="difficulty">
          <label>Choose Difficulty: </label>
          <select onChange={(e) => setDifficulty(e.target.value as Difficulty)} value={difficulty}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="symbol">
          <label>Choose Your Symbol: </label>
          <select onChange={(e) => setPlayerSymbol(e.target.value)} value={playerSymbol}>
            <option value="X">X</option>
            <option value="O">O</option>
          </select>
        </div>

        <button onClick={() => setGameStarted(true)}>Start Game</button>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <h2>Tic-Tac-Toe</h2>
        <div className="points">Points: {points}</div>
      </div>

      <div className="board">
        {board.map((cell, index) => (
          <div
            key={index}
            className={`cell ${cell ? "filled" : ""}`}
            onClick={() => handleClick(index)}
          >
            {cell}
          </div>
        ))}
      </div>

      {winner && <h3 className="winner-message">Winner: {winner}</h3>}
      {winner === null && !board.includes("") && <h3 className="draw-message">It's a Draw!</h3>}
      <button className="restart-btn" onClick={resetGame}>
        Restart Game
      </button>

      {/* Back to Difficulty and Symbol Selection */}
   
<button className="back-btn" onClick={() => setGameStarted(false)}>
  ←
</button>

    </div>
  );
};

export default TicTacToe;
