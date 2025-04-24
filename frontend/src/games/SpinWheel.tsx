import React, { useState } from "react";
import "./SpinWheel.css";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const SpinWheel: React.FC = () => {
  const { colors, prizes } = useTheme(); // prizes: [{ label: string, points: number }]
  const { user, setUser } = useAuth();

  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedPrize, setSelectedPrize] = useState<{
    label: string;
    points: number;
  } | null>(null);

  const spin = async () => {
    if (isSpinning || !user) return;

    setIsSpinning(true);

    const prizeCount = prizes.length;
    const anglePerPrize = 360 / prizeCount;
    const offset = anglePerPrize / 2;

    const selectedIndex = Math.floor(Math.random() * prizeCount);
    const targetAngle = 360 * 5 + selectedIndex * anglePerPrize + offset;

    setRotation(targetAngle);

    setTimeout(async () => {
      const normalized = targetAngle % 360;
      const landedIndex = Math.floor(
        ((360 - normalized + offset) % 360) / anglePerPrize
      );
      const result = prizes[landedIndex];
      setSelectedPrize(result);
      setIsSpinning(false);

      if (result.points > 0 && user._id) {
        try {
          const res = await axios.put(
            `http://localhost:5000/api/users/${user._id}/add-points`,
            { points: result.points },
            { withCredentials: true }
          );

          // ✅ update frontend copy of user with new points
          const updatedUser = { ...user, points: res.data.newPoints };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        } catch (err) {
          console.error("❌ Error adding points:", err);
        }
      }
    }, 4000);
  };

  return (
    <div className="wheel-container">
      <div className="wheel-wrapper">
        <div
          className="wheel"
          style={{
            transform: `rotate(${rotation}deg)`,
            borderColor: colors.primary,
            background: `conic-gradient(
              ${colors.secondary} 0% 12.5%,
              ${colors.background} 12.5% 25%,
              ${colors.secondary} 25% 37.5%,
              ${colors.background} 37.5% 50%,
              ${colors.secondary} 50% 62.5%,
              ${colors.background} 62.5% 75%,
              ${colors.secondary} 75% 87.5%,
              ${colors.background} 87.5% 100%
            )`,
          }}
        >
          {prizes.map((prize, index) => {
            const angle = (360 / prizes.length) * index;
            return (
              <div
                key={index}
                className="segment"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <span
                  className="prize-text"
                  style={{
                    transform: `rotate(${-angle}deg)`,
                    color: colors.text,
                  }}
                >
                  {prize.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="indicator" />
      </div>

      <button
        onClick={spin}
        disabled={isSpinning}
        className="spin-button"
        style={{
          backgroundColor: colors.primary,
        }}
      >
        {isSpinning ? "Spinning..." : "SPIN"}
      </button>

      {selectedPrize && (
        <p className="result" style={{ color: colors.primary }}>
          🎉 You won: <strong>{selectedPrize.label}</strong>
          {selectedPrize.points > 0 && <> (+{selectedPrize.points} pts)</>}
        </p>
      )}
    </div>
  );
};

export default SpinWheel;
