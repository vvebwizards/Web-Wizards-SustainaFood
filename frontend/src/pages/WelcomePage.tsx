import React from "react";
import { useAuth } from "../context/AuthContext";
import Lottie from "lottie-react";

// Example animations
import adminAnimation from "../animations/admin.json";
import deliveryAnimation from "../animations/delivery.json";
import donorAnimation from "../animations/donor.json";
import recipientAnimation from "../animations/recipient.json";

const WelcomePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  let welcomeMessage: string;
  let additionalContent: JSX.Element;
  let animationData: any = null;

  switch (user.role) {
    case "admin":
      welcomeMessage = "Welcome, Administrator!";
      additionalContent = (
        <p>
          Manage your system, view reports, and monitor user activity.
        </p>
      );
      animationData = adminAnimation;
      break;
    case "volunteer":
      welcomeMessage = "Welcome, Delivery Volunteer!";
      additionalContent = (
        <p>
          View your delivery schedule and active assignments.
        </p>
      );
      animationData = deliveryAnimation;
      break;
    case "donor":
      welcomeMessage = "Welcome, Food Donor!";
      additionalContent = (
        <p>
          Thank you for your generosity. Check your donation history and upcoming events.
        </p>
      );
      animationData = donorAnimation;
      break;
    case "recipient":
      welcomeMessage = "Welcome, Food Recipient!";
      additionalContent = (
        <p>
          Discover available food items and manage your requests easily.
        </p>
      );
      animationData = recipientAnimation;
      break;
    default:
      welcomeMessage = "Welcome!";
      additionalContent = (
        <p>
          Navigate the dashboard using the menu.
        </p>
      );
      break;
  }

  return (
    <div className="p-16 bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-10 text-center">
        {animationData && (
          <div className="w-72 h-72 mx-auto mb-8">
            <Lottie animationData={animationData} loop={true} />
          </div>
        )}
        <h1 className="text-5xl font-bold mb-8">{welcomeMessage}</h1>
        <div className="text-2xl text-gray-700 space-y-4">
          {additionalContent}
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
