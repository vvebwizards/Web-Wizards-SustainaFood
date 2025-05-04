import axios from "axios";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const Redeem = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const { user } = useAuth();

  const getLevel = (points: number) => {
    if (points >= 500) return "Gold";
    if (points >= 300) return "Silver";
    if (points >= 100) return "Bronze";
    return "Starter";
  };

  const getProgress = (points: number) => {
    const maxPoints = 500;
    return Math.min((points / maxPoints) * 100, 100);
  };

  const rewardOptions = [
    { points: 100, amount: "5.00" },
    { points: 200, amount: "10.00" },
    { points: 300, amount: "15.00" },
    { points: 400, amount: "20.00" },
    { points: 500, amount: "25.00" },
  ];

  const handleApprove = async (data: any, actions: any) => {
    const details = await actions.order.capture();

    try {
      const response = await axios.post("/api/users/redeem-points", {
        userId: user?.id || user?._id,
        points: selectedOption.points,
      });

      if (response.status === 200 && response.data?.remainingPoints !== undefined) {
        toast.success("🎉 Points successfully redeemed!");
        setSelectedOption(null);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "❌ Failed to redeem points.";
      toast.error(`❌ ${errorMessage}`);
      console.error("❌ Error redeeming points:", error);
    }
  };

  return (
    <PayPalScriptProvider
      options={{
        "client-id": "ATZqDax8mfDXSmDVdZMqTOQzuzMwOuFikYKGdFa7Z4zP3HPZDNK2O2qr4DsnjBZdluqbMbmumjyqGd6z",
        currency: "USD",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "2rem" }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: "#f9f9f9",
            padding: "3rem",
            borderRadius: "16px",
            boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
            maxWidth: "600px",
            width: "100%",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "28px", marginBottom: "0.5rem", color: "#333" }}>🎁 Redeem Your Points</h1>
          <p style={{ marginBottom: "2rem", color: "#555" }}>
            Choose how you'd like to convert your points into PayPal funds:
          </p>

          {user && (
            <div style={{ marginBottom: "2rem" }}>
              <p style={{ fontWeight: "bold", color: "#444" }}>
                 {user.points} / 500 pts – Level: {getLevel(user.points)}
              </p>
              <div
                style={{
                  height: "14px",
                  width: "100%",
                  backgroundColor: "#eee",
                  borderRadius: "10px",
                  overflow: "hidden",
                  marginTop: "0.5rem",
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgress(user.points)}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  style={{
                    height: "100%",
                    backgroundColor: "#0070BA",
                  }}
                />
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {rewardOptions.map((option) => (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={option.points}
                onClick={() => setSelectedOption(option)}
                style={{
                  padding: "1rem 1.5rem",
                  borderRadius: "10px",
                  backgroundColor: selectedOption?.points === option.points ? "#0070BA" : "#fff",
                  color: selectedOption?.points === option.points ? "#fff" : "#0070BA",
                  border: "2px solid #0070BA",
                  fontSize: "16px",
                  fontWeight: "bold",
                  transition: "all 0.3s",
                  cursor: "pointer",
                }}
              >
                ⭐ Redeem {option.points} pts → ${option.amount}
              </motion.button>
            ))}
          </div>

          {selectedOption && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    style={{
      marginTop: "2rem",
      padding: "1.5rem",
      borderRadius: "12px",
      background: "#fff",
      boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
    }}
  >
    <h3 style={{ marginBottom: "1rem", fontWeight: "600", color: "#222" }}>
      Pay with PayPal - ${selectedOption.amount}
    </h3>

    {user.points >= selectedOption.points ? (
      <PayPalButtons
        style={{
          layout: "vertical",
          color: "blue",
          shape: "pill",
          label: "paypal",
        }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: selectedOption.amount,
                },
                payee: {
                  email_address: "sb-hvxrn41241501@personal.example.com",
                },
              },
            ],
          });
        }}
        onApprove={handleApprove}
      />
    ) : (
      <p style={{ color: "red", fontWeight: "bold", marginTop: "1rem" }}>
         Not enough points to redeem this reward.
      </p>
    )}
  </motion.div>
)}

        </motion.div>
      </div>
    </PayPalScriptProvider>
  );
};

export default Redeem;
