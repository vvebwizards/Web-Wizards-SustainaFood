import axios from "axios";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Redeem = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const { user } = useAuth();

  const rewardOptions = [
    { points: 100, amount: "5.00" },
    { points: 200, amount: "10.00" },
    { points: 300, amount: "15.00" },
    { points: 400, amount: "20.00" },
    { points: 500, amount: "25.00" },
  ];

  const handleApprove = async (data: any, actions: any) => {
    const details = await actions.order.capture();
    alert(`Transaction completed by ${details.payer.name.given_name}`);

    try {
      await axios.post("/api/users/redeem-points", {
        userId: user?.id,  
        points: selectedOption.points,        // userId: user._id,
      });
      alert("✅ Points successfully redeemed!");
      // Optional: Reset selected option
      setSelectedOption(null);
    } catch (error) {
      console.error("❌ Error redeeming points:", error);
      alert("❌ Failed to redeem points.");
    }
  };

  return (
    <PayPalScriptProvider
      options={{
        "client-id": "ATZqDax8mfDXSmDVdZMqTOQzuzMwOuFikYKGdFa7Z4zP3HPZDNK2O2qr4DsnjBZdluqbMbmumjyqGd6z",
        currency: "USD",
      }}
    >
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Redeem Funds</h1>
        <p>Select a reward based on your points:</p>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", margin: "2rem 0" }}>
          {rewardOptions.map((option) => (
            <button
              key={option.points}
              onClick={() => setSelectedOption(option)}
              style={{
                padding: "1rem 2rem",
                borderRadius: "8px",
                border: selectedOption?.points === option.points ? "2px solid #0070BA" : "1px solid #0070BA",
                backgroundColor: selectedOption?.points === option.points ? "#0070BA" : "#fff",
                color: selectedOption?.points === option.points ? "#fff" : "#0070BA",
                fontWeight: "bold",
                fontSize: "16px",
                width: "320px",
                cursor: "pointer",
              }}
            >
              Redeem {option.points} points → ${option.amount}
            </button>
          ))}
        </div>

        {selectedOption && (
          <div key={selectedOption.points} style={{ maxWidth: "420px", margin: "0 auto", paddingTop: "20px" }}>
            <PayPalButtons
              style={{
                layout: "vertical",
                color: "gold",
                label: "paypal",
                shape: "rect",
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
          </div>
        )}
      </div>
    </PayPalScriptProvider>
  );
};

export default Redeem;
