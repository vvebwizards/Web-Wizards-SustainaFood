import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./MemoryGame.css";

type Difficulty = "easy" | "hard";

interface CardType {
  id: number;
  img: string;
  matched: boolean;
}

const foodImages = [
  "/images/apple.png",
  "/images/banana.png",
  "/images/carrot.png",
  "/images/grapes.png",
  "/images/orange.png",
  "/images/pear.png",
];

export default function MemoryGame() {
  const { user, setUser } = useAuth();
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [cards, setCards] = useState<CardType[]>([]);
  const [first, setFirst] = useState<CardType | null>(null);
  const [second, setSecond] = useState<CardType | null>(null);
  const [disabled, setDisabled] = useState(false);
  const [matches, setMatches] = useState(0);
  const [points, setPoints] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const timerRef = useRef<number>();

  const shuffle = <T,>(arr: T[]): T[] =>
    arr.map(v => ({ sort: Math.random(), value: v }))
       .sort((a, b) => a.sort - b.sort)
       .map(a => a.value);

  const initGame = () => {
    const deck = shuffle([...foodImages, ...foodImages]).map((img, i) => ({ id: i, img, matched: false }));
    setCards(deck);
    setFirst(null);
    setSecond(null);
    setDisabled(false);
    setMatches(0);
    setPoints(0);
    setGameOver(false);
    setGameWon(false);
    setTimeLeft(difficulty === "hard" ? 30 : 60);
  };

  useEffect(() => {
    initGame();
    clearTimeout(timerRef.current);
  }, [difficulty]);

  useEffect(() => {
    if (gameOver || gameWon) return;
    if (timeLeft <= 0) return endGame(false);
    timerRef.current = window.setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, gameOver, gameWon]);

  const handleChoice = (card: CardType) => {
    if (disabled || card === first || card.matched || gameOver || gameWon) return;
    first ? setSecond(card) : setFirst(card);
  };

  useEffect(() => {
    if (!first || !second) return;
    setDisabled(true);
    const award = difficulty === "hard" ? 20 : 10;
    if (first.img === second.img) {
      setCards(prev =>
        prev.map(c => c.img === first.img ? { ...c, matched: true } : c)
      );
      setMatches(m => {
        const newM = m + 1;
        if (newM === foodImages.length) endGame(true);
        return newM;
      });
      setPoints(p => p + award);
      // persist points
      const userId = user?._id || user?.id; // Use the correct user ID (either _id or id)
      if (userId) {
        axios.put(
          `http://foodreduce-backend.azurewebsites.net/api/users/${userId}/add-points`,
          { points: award },
          { withCredentials: true }
        )
        .then(res => {
          const updated = { ...user, points: res.data.newPoints };
          setUser(updated);
          localStorage.setItem('user', JSON.stringify(updated));
        })
        .catch(console.error);
      }
      resetTurn();
    } else {
      setTimeout(() => difficulty === "hard" ? endGame(false) : resetTurn(), 800);
    }
  }, [second]);

  const resetTurn = () => {
    setFirst(null);
    setSecond(null);
    setDisabled(false);
  };

  const endGame = (won: boolean) => {
    clearTimeout(timerRef.current);
    setGameOver(true);
    if (won) setGameWon(true);
  };

  // Render: Win screen
  if (gameWon) return (
    <div className="memory-container">
      <div className="memory-end-screen win">
        <h2>You Matched Them All!</h2>
        <p>Your Points: {points}</p>
        <button onClick={initGame}>Play Again</button>
      </div>
    </div>
  );

  // Render: Lose screen
  if (gameOver) return (
    <div className="memory-container">
      <div className="memory-end-screen lose">
        <h2>Game Over</h2>
        <p>Points: {points}</p>
        <button onClick={initGame}>Restart</button>
      </div>
    </div>
  );

  // Render: Active game
  return (
    <div className="memory-container">
      <div className="memory-header">
        <div className="controls">
          <label>
            Difficulty:
            <select value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty)}>
              <option value="easy">Easy</option>
              <option value="hard">Hard</option>
            </select>
          </label>
          <button className="restart-btn" onClick={initGame}>Restart</button>
        </div>
        <div className="status">
          <span>⏱️ {timeLeft}s</span>
          <span>⭐ {points}</span>
        </div>
      </div>

      <div className="memory-grid">
        {cards.map(card => {
          const flipped = card === first || card === second || card.matched;
          return (
            <div
              key={card.id}
              className={`memory-card ${flipped ? 'flipped' : ''}`}
              onClick={() => handleChoice(card)}
            >
              <div className="inner">
                <div className="front" />
                <div className="back" style={{ backgroundImage: `url(${card.img})` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
