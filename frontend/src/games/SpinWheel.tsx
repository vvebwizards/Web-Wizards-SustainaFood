import React, { useState } from "react";
import "./SpinWheel.css";
import { useTheme } from "../context/ThemeContext"; // 👈 use your theme

const SpinWheel = () => {
  const { colors, prizes } = useTheme(); // 👈 use themed prizes/colors

  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedPrize, setSelectedPrize] = useState<string | null>(null);

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    const prizeCount = prizes.length;
    const anglePerPrize = 360 / prizeCount;
    const offset = anglePerPrize / 2;

    const selectedIndex = Math.floor(Math.random() * prizeCount);
    const targetAngle = 360 * 5 + (selectedIndex * anglePerPrize + offset);
    setRotation(targetAngle);

    setTimeout(() => {
      const normalized = targetAngle % 360;
      const landedIndex = Math.floor(
        ((360 - normalized + offset) % 360) / anglePerPrize
      );
      setSelectedPrize(prizes[landedIndex]);
      setIsSpinning(false);
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
            )`
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
                    color: colors.text
                  }}
                >
                  {prize}
                </span>
              </div>
            );
          })}
        </div>
        <div className="indicator"></div>
      </div>
      <button onClick={spin} disabled={isSpinning} className="spin-button">
        {isSpinning ? "Spinning..." : "SPIN"}
      </button>
      {selectedPrize && (
        <p className="result" style={{ color: colors.primary }}>
          🎉 You won: <strong>{selectedPrize}</strong>
        </p>
      )}
    </div>
  );
};

export default SpinWheel;
